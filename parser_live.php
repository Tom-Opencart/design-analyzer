<?php

// --- НАСТРОЙКИ КЭШИРОВАНИЯ ДЛЯ МОДУЛЕЙ ---
$modulesCacheDir = __DIR__ . '/cache/'; // Директория для кэша. Убедитесь, что она существует и доступна для записи.
$modulesCacheFileName = 'liveopencart_modules_cache.json'; // УНИКАЛЬНОЕ ИМЯ ФАЙЛА КЭША ДЛЯ ЭТОГО ПАРСЕРА
$modulesCacheFilePath = $modulesCacheDir . $modulesCacheFileName;
$modulesCacheTTL = 24 * 60 * 60; // 24 часа в секундах
// --- КОНЕЦ НАСТРОЕК КЭШИРОВАНИЯ ДЛЯ МОДУЛЕЙ ---

// --- НАСТРОЙКИ КЭШИРОВАНИЯ ДЛЯ RSS-ЛЕНТЫ ---
$rssCacheDir = __DIR__ . '/cache/';
$rssCacheFileName = 'liveopencart_news_rss_cache.json'; // УНИКАЛЬНОЕ ИМЯ ФАЙЛА КЭША ДЛЯ ЭТОЙ RSS-ЛЕНТЫ
$rssCacheFilePath = $rssCacheDir . $rssCacheFileName;
$rssCacheTTL = 24 * 60 * 60; // 24 часа в секундах
// --- КОНЕЦ НАСТРОЕК КЭШИРОВАНИЯ ДЛЯ RSS-ЛЕНТЫ ---

// Главный URL сайта, с которого парсим.
const BASE_URL = 'https://liveopencart.ru/';

// Разрешаем кросс-доменные запросы (если лендинг на другом домене)
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8'); // Отправляем JSON-заголовок

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
// --- КОНЕЦ ФУНКЦИЙ ДЛЯ КЭШИРОВАНИЯ ---

// Функция для парсинга блока "Новинки" с сайта liveopencart.ru
function parseNewArrivals($url) {
    // Инициализация cURL для получения веб-страницы
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Увеличим таймаут на всякий случай
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Временное решение для тестирования, в продакшене лучше настроить верификацию SSL

    $html = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);

    // Проверка, был ли HTML успешно получен
    if ($html === false || $http_code >= 400) {
        return ['error' => 'Не удалось получить веб-страницу: ' . ($curl_error ? $curl_error : 'HTTP Code ' . $http_code)];
    }

    // Инициализация DOMDocument
    $doc = new DOMDocument();
    // Подавляем предупреждения из-за некорректного HTML
    // Важно: HTML-ENTITIES для корректной обработки кириллицы
    @$doc->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    libxml_clear_errors(); // Очищаем буфер ошибок
    $xpath = new DOMXPath($doc);

    // Находим блок "Новинки" по тексту заголовка
    // Используем contains() вместо normalize-space() для большей гибкости
    $boxHeading = $xpath->query("//div[@class='box-heading' and (contains(text(), 'Новинки') or contains(text(), 'New Arrivals'))]");
    
    if ($boxHeading->length === 0) {
        return ['error' => 'Блок "Новинки" (или "New Arrivals") не найден.'];
    }

    // Получаем родительский контейнер (обычно class="box")
    $boxContainer = $boxHeading->item(0)->parentNode;
    if (!$boxContainer) {
        return ['error' => 'Родительский контейнер блока "Новинки" не найден.'];
    }

    // Инициализируем массив результатов
    $products = [];

    // Находим все элементы продуктов внутри этого контейнера
    // Ищем .product-thumb, так как это стандартный класс для карточки товара в Opencart
    $productNodes = $xpath->query(".//div[contains(@class, 'product-thumb')]", $boxContainer);
    
    // Если ничего не нашли, попробуем поискать просто блоки с картинкой и именем (fallback)
    if ($productNodes->length === 0) {
         $productNodes = $xpath->query(".//div[contains(@class, 'product-layout')]", $boxContainer);
    }

    foreach ($productNodes as $node) {
        $product = [];

        // --- ИЗВЛЕЧЕНИЕ НАЗВАНИЯ И URL ---
        // Проверяем различные варианты вложенности
        $nameNode = $xpath->query(".//div[@class='name']/a", $node);
        if ($nameNode->length === 0) {
             $nameNode = $xpath->query(".//h4/a", $node); // Иногда бывает h4
        }
        if ($nameNode->length === 0) {
             $nameNode = $xpath->query(".//div[@class='caption']//a", $node); // Ищем любую ссылку в caption
        }
        
        if ($nameNode->length > 0) {
            $product['name'] = trim($nameNode->item(0)->textContent);
            $href = $nameNode->item(0)->getAttribute('href');
            $product['url'] = !empty($href) ?
                               (strpos($href, 'http') === 0 ? $href : BASE_URL . ltrim($href, '/')) : '';
        } else {
             continue; // Не нашли название - пропускаем
        }

        // --- ИЗВЛЕЧЕНИЕ ИЗОБРАЖЕНИЯ ---
        $imageNode = $xpath->query(".//div[@class='image']//img", $node);
        if ($imageNode->length > 0) {
            $src = $imageNode->item(0)->getAttribute('src');
            // Если src пустой, проверяем data-src (lazy load)
            if (empty($src)) {
                $src = $imageNode->item(0)->getAttribute('data-src');
            }
            $product['image'] = !empty($src) ?
                                 (strpos($src, 'http') === 0 ? $src : BASE_URL . ltrim($src, '/')) : '';
        } else {
            $product['image'] = '';
        }

        // --- ИЗВЛЕЧЕНИЕ ЦЕНЫ ---
        $priceNode = $xpath->query(".//div[@class='price']", $node);
        if ($priceNode->length > 0) {
            // Пытаемся найти спец. цены (акция)
            $priceNewNode = $xpath->query(".//span[@class='price-new']", $priceNode->item(0));
            $priceOldNode = $xpath->query(".//span[@class='price-old']", $priceNode->item(0));
            
            if ($priceNewNode->length > 0) {
                $product['price_new'] = trim($priceNewNode->item(0)->textContent);
                $product['price_old'] = $priceOldNode->length > 0 ? trim($priceOldNode->item(0)->textContent) : null;
            } else {
                // Обычная цена
                $product['price_new'] = trim($priceNode->item(0)->textContent);
                // Чистим цену от лишних пробелов и переносов, так как там может быть текст налога и т.д.
                // Можно добавить regex, если нужно число, но пока оставляем текстом
                $product['price_old'] = null;
            }
        } else {
            $product['price_new'] = null;
            $product['price_old'] = null;
        }

        // --- ИЗВЛЕЧЕНИЕ СТИКЕРОВ ---
        $stickers = [];
        // Ищем контейнеры стикеров (july-stickers или просто stickers)
        $stickerNodes = $xpath->query(".//div[contains(@class, 'sticker')]", $node);
        foreach ($stickerNodes as $sticker) {
            $text = trim($sticker->textContent);
            if (!empty($text)) {
                $stickers[] = $text;
            }
        }
        $product['stickers'] = array_unique($stickers);

        // Добавляем, если валидно
        if (!empty($product['name']) && !empty($product['url'])) {
            $products[] = $product;
        }
    }

    if (empty($products)) {
        return ['error' => 'Продукты не найдены. Структура страницы могла измениться.', 'products' => []];
    }

    return ['status' => 'ok', 'products' => $products];
}

// ====================================================================
// Основной вызов для отдачи JSON (с логикой кэширования)
// ====================================================================

try {
    // Попытка получить данные из кэша
    global $modulesCacheFilePath, $modulesCacheTTL;
    $cachedData = getCachedData($modulesCacheFilePath, $modulesCacheTTL);

    if ($cachedData !== false) {
        // Если данные найдены в кэше и они актуальны, отдаем их
        echo $cachedData;
    } else {
        // Если кэш отсутствует или устарел, выполняем парсинг
        $url_to_parse = BASE_URL; // URL страницы, которую парсим
        $results = parseNewArrivals($url_to_parse);

        // Если парсинг прошел успешно, сохраняем данные в кэш
        if (isset($results['status']) && $results['status'] === 'ok') {
            $jsonData = json_encode($results, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            global $modulesCacheFilePath;
            saveCachedData($modulesCacheFilePath, $jsonData);
            echo $jsonData;
        } else {
            // Если при парсинге произошла ошибка, выводим ее и не кэшируем
            echo json_encode($results, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
            // Optionally: log the error
            error_log("Error parsing Liveopencart modules: " . ($results['error'] ?? 'Unknown error'));
        }
    }

} catch (Exception $e) {
    // Обработка ошибок кэширования или других непредвиденных исключений
    echo json_encode(['error' => 'Произошла ошибка сервера: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    error_log("Unhandled exception in parser_live.php: " . $e->getMessage());
}

?>