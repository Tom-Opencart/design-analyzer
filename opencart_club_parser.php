<?php

// --- НАСТРОЙКИ КЭШИРОВАНИЯ ---
$cacheDir = __DIR__ . '/cache/'; // Директория для кэша. Убедитесь, что она существует и доступна для записи.
$cacheFileName = 'opencart_club_cache.json'; // Имя файла кэша для этого парсера
$cacheFilePath = $cacheDir . $cacheFileName;
$cacheTTL = 24 * 60 * 60; // 24 часа в секундах
// --- КОНЕЦ НАСТРОЕК КЭШИРОВАНИЯ ---

// Разрешаем кросс-доменные запросы (если лендинг на другом домене)
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=utf-8'); // Отправляем JSON-заголовок

// --- ФУНКЦИИ ДЛЯ КЭШИРОВАНИЯ ---
function getCachedData($cacheFilePath, $cacheTTL)
{
  if (file_exists($cacheFilePath) && (filemtime($cacheFilePath) + $cacheTTL > time())) {
    return file_get_contents($cacheFilePath);
  }
  return false;
}

function saveCachedData($cacheFilePath, $data)
{
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

// Function to fetch HTML content from a URL using cURL
function fetchHTML($url)
{
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
  curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  curl_setopt($ch, CURLOPT_TIMEOUT, 30); // Увеличиваем таймаут до 30 секунд
  curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Для тестирования; в продакшене лучше настроить верификацию SSL
  $html = curl_exec($ch);
  if (curl_errno($ch)) {
    throw new Exception('cURL error: ' . curl_error($ch));
  }
  curl_close($ch);
  return $html;
}

// Function to parse the HTML and extract extension details
function parseExtensions($html)
{
  $doc = new DOMDocument();
  // Suppress warnings due to potential malformed HTML
  @$doc->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'));
  $xpath = new DOMXPath($doc);

  $extensions = [];
  // Query all carousel items
  $items = $xpath->query('//li[contains(@class, "cDownloadsCarouselItem")]');

  foreach ($items as $item) {
    $extension = [];

    // Extract title and URL
    $titleNode = $xpath->query('.//h3/a[@title]', $item);
    if ($titleNode->length > 0) {
      $extension['title'] = trim($titleNode->item(0)->textContent);
      $extension['url'] = $titleNode->item(0)->getAttribute('href');
    } else {
      $extension['title'] = 'N/A';
      $extension['url'] = 'N/A';
    }

    // Extract author
    $authorNode = $xpath->query('.//p/a[contains(@class, "ipsType_break")]', $item);
    if ($authorNode->length > 0) {
      $extension['author'] = trim($authorNode->item(0)->textContent);
    } else {
      $extension['author'] = 'N/A';
    }

    // Extract rating (count of filled stars)
    $ratingNodes = $xpath->query('.//ul[contains(@class, "ipsRating_collective")]/li[contains(@class, "ipsRating_on")]', $item);
    $extension['rating'] = $ratingNodes->length;

    // Extract purchases
    $purchasesNode = $xpath->query('.//p/span[contains(@title, "Покупки")]', $item);
    if ($purchasesNode->length > 0) {
      $purchasesText = trim($purchasesNode->item(0)->textContent);
      $extension['purchases'] = (int) filter_var($purchasesText, FILTER_SANITIZE_NUMBER_INT);
    } else {
      $extension['purchases'] = 0;
    }

    // Extract downloads
    $downloadsNode = $xpath->query('.//p/span[contains(@title, "Скачивания")]', $item);
    if ($downloadsNode->length > 0) {
      $downloadsText = trim($downloadsNode->item(0)->textContent);
      $extension['downloads'] = (int) filter_var($downloadsText, FILTER_SANITIZE_NUMBER_INT);
    } else {
      $extension['downloads'] = 0;
    }

    // --- Извлечение цены для файла ---
    $prices = [];
    $oldPriceNode = $xpath->query('.//span[contains(@class, "priceOld")]', $item);
    $newPriceNode = $xpath->query('.//span[contains(@class, "priceNew")]', $item);
    $singlePriceNode = $xpath->query('.//span[contains(@class, "cFilePrice")]', $item); // Один элемент цены, если нет priceOld/priceNew

    if ($oldPriceNode->length > 0 && $newPriceNode->length > 0) {
      // Если есть и старая, и новая цена - показываем обе
      $prices['old_price'] = trim($oldPriceNode->item(0)->textContent);
      $prices['new_price'] = trim($newPriceNode->item(0)->textContent);
    } elseif ($singlePriceNode->length > 0) {
      // Если есть только один элемент цены, но нет priceOld/priceNew
      // Используем его как обычную цену
      $prices['price'] = trim($singlePriceNode->item(0)->textContent);
    } else {
      // Если вообще нет элементов цены
      $prices['price'] = 'N/A';
    }

    $extension['price'] = $prices;
    // --- Конец извлечения цены для файла ---

    // Extract image URL
    $imageNode = $xpath->query('.//span[contains(@class, "ipsThumb")]/@data-background-src', $item);
    if ($imageNode->length > 0) {
      $extension['image_url'] = $imageNode->item(0)->nodeValue;
    } else {
      $extension['image_url'] = 'N/A';
    }

    $extensions[] = $extension;
  }

  return $extensions;
}

// Main execution
try {
  // Попытка получить данные из кэша
  $cachedData = getCachedData($cacheFilePath, $cacheTTL);

  if ($cachedData !== false) {
    // Если данные найдены в кэше и они актуальны, отдаем их
    echo $cachedData;
  } else {
    // Если кэш отсутствует или устарел, выполняем парсинг
    // Fetch the HTML from the OpenCart Club files page
    $url = 'https://opencart.club/files/';
    $html = fetchHTML($url);

    // Parse the extensions
    $extensions = parseExtensions($html);

    // Сохраняем данные в кэш перед выводом
    $jsonData = json_encode($extensions, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    saveCachedData($cacheFilePath, $jsonData);

    // Output the results as JSON
    echo $jsonData;
  }
} catch (Exception $e) {
  // Handle errors gracefully
  echo json_encode(['error' => $e->getMessage()], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}
