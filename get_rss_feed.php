<?php

// --- НАСТРОЙКИ КЭШИРОВАНИЯ ---
$cacheDir = __DIR__ . '/cache/'; // Директория для кэша. Убедитесь, что она существует и доступна для записи.
$cacheFileName = 'rss_feed_cache.json'; // Имя файла кэша для RSS-лент
$cacheFilePath = $cacheDir . $cacheFileName;
$cacheTTL = 30 * 60; // 30 минут в секундах
// --- КОНЕЦ НАСТРОЕК КЭШИРОВАНИЯ ---

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *'); // Это позволит вашему лендингу делать запросы к этому скрипту

$rss_url = isset($_GET['url']) ? $_GET['url'] : '';

if (empty($rss_url)) {
    echo json_encode(['status' => 'error', 'message' => 'Не указан URL RSS-ленты.']);
    exit;
}

// Проверяем, является ли URL валидным RSS-источником
// Для безопасности, можно добавить более строгие проверки URL,
// например, убедиться, что он начинается с liveopencart.ru или forum.opencart-russia.ru
$allowed_domains = ['liveopencart.ru', 'forum.opencart-russia.ru'];
$url_parts = parse_url($rss_url);

if (!isset($url_parts['host']) || !in_array($url_parts['host'], $allowed_domains)) {
    echo json_encode(['status' => 'error', 'message' => 'Недопустимый домен RSS-ленты.']);
    exit;
}

// --- ФУНКЦИИ ДЛЯ КЭШИРОВАНИЯ ---
function getCachedData($cacheFilePath, $cacheTTL) {
    if (file_exists($cacheFilePath) && (filemtime($cacheFilePath) + $cacheTTL > time())) {
        return file_get_contents($cacheFilePath);
    }
    return false;
}

function saveCachedData($cacheFilePath, $data) {
    // Убедимся, что директория кэша существует
    $cacheDir = dirname($cacheFilePath);
    if (!is_dir($cacheDir)) {
        // Создаем рекурсивно с правами 0755. true для рекурсивного создания.
        if (!mkdir($cacheDir, 0755, true) && !is_dir($cacheDir)) {
            throw new \RuntimeException(sprintf('Directory "%s" was not created', $cacheDir));
        }
    }
    if (file_put_contents($cacheFilePath, $data) === false) {
        throw new Exception('Не удалось записать данные в файл кэша: ' . $cacheFilePath);
    }
}
// --- КОНЕЦ ФУНКЦИИ ДЛЯ КЭШИРОВАНИЯ ---

try {
    // Попытка получить данные из кэша
    $cachedData = getCachedData($cacheFilePath, $cacheTTL);
    
    if ($cachedData !== false) {
        // Если данные найдены в кэше и они актуальны, отдаем их
        // Проверим, соответствует ли кэш запрашиваемому URL
        $cachedResponse = json_decode($cachedData, true);
        if (isset($cachedResponse['feed']['url']) && $cachedResponse['feed']['url'] === $rss_url) {
            echo $cachedData;
            exit;
        }
    }
    
    // Если кэш отсутствует, устарел или не соответствует URL, выполняем загрузку RSS
    
    // Инициализация cURL для более надежной загрузки RSS
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $rss_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Следовать редиректам
    curl_setopt($ch, CURLOPT_TIMEOUT, 10); // Таймаут 10 секунд
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    $xml_string = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    if ($xml_string === false || $http_code >= 400) {
        echo json_encode(['status' => 'error', 'message' => 'Ошибка загрузки RSS-ленты: ' . ($curl_error ? $curl_error : 'HTTP Code ' . $http_code)]);
        exit;
    }

    // Попытка загрузить XML
    libxml_use_internal_errors(true); // Отключаем вывод ошибок XML на страницу
    $xml = simplexml_load_string($xml_string);

    if ($xml === false) {
        $errors = [];
        foreach (libxml_get_errors() as $error) {
            $errors[] = $error->message;
        }
        echo json_encode(['status' => 'error', 'message' => 'Ошибка парсинга XML: ' . implode(', ', $errors)]);
        exit;
    }

    $items = [];
    foreach ($xml->channel->item as $item) {
        // Try description first, then content:encoded, then category
        $desc = (string)$item->description;
        if (empty($desc) && isset($item->children('content', true)->encoded)) {
            $desc = (string)$item->children('content', true)->encoded;
        }
        if (empty($desc) && isset($item->category)) {
            $desc = (string)$item->category;
        }
        $items[] = [
            'title'       => (string)$item->title,
            'link'        => (string)$item->link,
            'description' => $desc,
            'pubDate'     => (string)$item->pubDate,
            'author'      => (string)$item->author,
            'category'    => isset($item->category) ? (string)$item->category : null,
            'guid'        => isset($item->guid) ? (string)$item->guid : null,
        ];
    }

    $response = [
        'status' => 'ok',
        'feed' => [
            'title' => (string)$xml->channel->title,
            'link'  => (string)$xml->channel->link,
            'description' => isset($xml->channel->description) ? (string)$xml->channel->description : null,
            'language' => isset($xml->channel->language) ? (string)$xml->channel->language : null,
            'pubDate' => isset($xml->channel->pubDate) ? (string)$xml->channel->pubDate : null,
            'url'   => $rss_url,
        ],
        'items' => $items
    ];

    // Сохраняем данные в кэш перед выводом
    $jsonData = json_encode($response, JSON_UNESCAPED_UNICODE);
    saveCachedData($cacheFilePath, $jsonData);
    
    echo $jsonData;

} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Произошла ошибка сервера: ' . $e->getMessage()]);
    error_log("Unhandled exception in get_rss_feed.php: " . $e->getMessage());
}

?>