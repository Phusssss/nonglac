/**
 * Agricultural price crawler (Nha Be Agri)
 * - Extracts all price tables and section metadata from source page
 * - Keeps coffee region prices for backward compatibility
 */

const axios = require('axios');
const cheerio = require('cheerio');
const admin = require('firebase-admin');

const SOURCE_URL = 'https://nhabeagri.com/gia-nong-san/';
const SUMMARY_TABLE_CLASS = 'bang-gia-nong-san';

function normalizeText(text = '') {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đÐ]/g, 'd')
    .replace(/[Đ]/g, 'D')
    .replace(/Ä‘/g, 'd')
    .replace(/Ä/g, 'D')
    .toLowerCase()
    .trim();
}

function cleanText(text = '') {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function headerToKey(header, index) {
  const normalized = normalizeText(cleanText(header))
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized || `col_${index + 1}`;
}

function createUniqueKeys(headers) {
  const countByKey = {};
  return headers.map((header, idx) => {
    const base = headerToKey(header, idx);
    const count = (countByKey[base] || 0) + 1;
    countByKey[base] = count;
    return count === 1 ? base : `${base}_${count}`;
  });
}

function extractCellData($, cellEl) {
  const $cell = $(cellEl);
  const colspan = Math.max(parseInt($cell.attr('colspan'), 10) || 1, 1);
  const rowspan = Math.max(parseInt($cell.attr('rowspan'), 10) || 1, 1);

  return {
    tag: ($cell.get(0)?.tagName || '').toLowerCase(),
    text: cleanText($cell.text()),
    html: cleanText($cell.html() || ''),
    colspan,
    rowspan,
    className: cleanText($cell.attr('class') || ''),
  };
}

function flattenHeaderColumns(headerRows) {
  if (!Array.isArray(headerRows) || headerRows.length === 0) {
    return [];
  }

  const grid = [];
  let maxCols = 0;

  headerRows.forEach((row, rowIndex) => {
    if (!Array.isArray(row)) return;
    if (!grid[rowIndex]) grid[rowIndex] = [];

    let colIndex = 0;
    row.forEach((cell) => {
      while (grid[rowIndex][colIndex] !== undefined) {
        colIndex += 1;
      }

      const colspan = Math.max(cell.colspan || 1, 1);
      const rowspan = Math.max(cell.rowspan || 1, 1);

      for (let r = 0; r < rowspan; r += 1) {
        const targetRow = rowIndex + r;
        if (!grid[targetRow]) grid[targetRow] = [];
        for (let c = 0; c < colspan; c += 1) {
          grid[targetRow][colIndex + c] = cell.text;
        }
      }

      colIndex += colspan;
      maxCols = Math.max(maxCols, colIndex);
    });
  });

  const columns = [];
  for (let c = 0; c < maxCols; c += 1) {
    let label = '';
    for (let r = grid.length - 1; r >= 0; r -= 1) {
      const candidate = cleanText(grid[r]?.[c] || '');
      if (candidate) {
        label = candidate;
        break;
      }
    }
    columns.push(label || `Col ${c + 1}`);
  }

  return columns;
}

function expandRowCells(cells) {
  const expanded = [];
  (cells || []).forEach((cell) => {
    const count = Math.max(cell.colspan || 1, 1);
    for (let i = 0; i < count; i += 1) {
      expanded.push(cell.text || '');
    }
  });
  return expanded;
}

function pickTableContext($, tableEl, tableIndex) {
  const table = $(tableEl);
  const tableColumn = table.closest('.wpb_column');
  const inSummaryBlock = table.closest(`.${SUMMARY_TABLE_CLASS}`).length > 0;

  const titleInColumn = cleanText(tableColumn.find('.page-title').first().text());
  const titleGlobal = cleanText($('.page-title').first().text());
  const updatedInColumn = cleanText(tableColumn.find('.ngay-cap-nhat').first().text());
  const updatedGlobal = cleanText($('.ngay-cap-nhat').first().text());

  const title = titleInColumn || (inSummaryBlock ? titleGlobal : '') || `Table ${tableIndex + 1}`;
  const updatedAt = updatedInColumn || (inSummaryBlock ? updatedGlobal : '') || '';

  let reference = null;
  const links = tableColumn.find('a[href]');
  if (links.length > 0) {
    const preferred = links
      .filter((_, el) => normalizeText($(el).text()).includes('chi tiet bang gia'))
      .last();
    const chosen = preferred.length ? preferred : links.last();
    const href = cleanText(chosen.attr('href') || '');
    const text = cleanText(chosen.text() || '');
    if (href) {
      reference = { href, text };
    }
  }

  return {
    title,
    updatedAt,
    reference,
    inSummaryBlock,
  };
}

function sortSummaryTableRows($, $table) {
  if (!$table.hasClass(SUMMARY_TABLE_CLASS)) {
    return;
  }

  const $tbody = $table.find('tbody').first();
  if (!$tbody.length) {
    return;
  }

  const rows = $tbody.find('tr').toArray();
  rows.sort((a, b) => {
    const left = normalizeText($(a).find('td,th').first().text());
    const right = normalizeText($(b).find('td,th').first().text());
    return left.localeCompare(right, 'vi');
  });

  $tbody.empty();
  rows.forEach((row) => $tbody.append(row));
}

function extractAllTables($) {
  const tables = [];
  const seen = new Set();

  $('table').each((tableIndex, tableEl) => {
    const context = pickTableContext($, tableEl, tableIndex);

    const tableClone = $(tableEl).clone();
    if (context.inSummaryBlock && !tableClone.hasClass(SUMMARY_TABLE_CLASS)) {
      tableClone.addClass(SUMMARY_TABLE_CLASS);
    }

    sortSummaryTableRows($, tableClone);

    const hasThead = tableClone.find('thead tr').length > 0;
    const headerRowElements = hasThead
      ? tableClone.find('thead tr').toArray()
      : tableClone.find('tr').first().toArray();

    const headerRows = headerRowElements.map((rowEl) => (
      $(rowEl).find('th,td').toArray().map((cellEl) => extractCellData($, cellEl))
    ));

    const bodyRowElements = hasThead
      ? (tableClone.find('tbody tr').length > 0
        ? tableClone.find('tbody tr').toArray()
        : tableClone.find('tr').slice(headerRowElements.length).toArray())
      : tableClone.find('tr').slice(1).toArray();

    const bodyRows = bodyRowElements
      .map((rowEl) => {
        const cells = $(rowEl).find('th,td').toArray().map((cellEl) => extractCellData($, cellEl));
        if (!cells.length) return null;
        return {
          className: cleanText($(rowEl).attr('class') || ''),
          cells,
        };
      })
      .filter(Boolean);

    if (headerRows.length === 0 || bodyRows.length === 0) {
      return;
    }

    const headers = flattenHeaderColumns(headerRows);
    const keys = createUniqueKeys(headers);

    const rows = bodyRows.map((row) => {
      const expanded = expandRowCells(row.cells);
      const maxCols = Math.max(keys.length, expanded.length);
      const rowObj = {};

      for (let i = 0; i < maxCols; i += 1) {
        const key = keys[i] || `col_${i + 1}`;
        rowObj[key] = expanded[i] || '';
      }

      rowObj._rowClass = row.className || '';
      return rowObj;
    });

    const signature = [
      normalizeText(context.title),
      headers.join('|'),
      rows.slice(0, 2).map((row) => JSON.stringify(row)).join('||'),
    ].join('::');

    if (seen.has(signature)) {
      return;
    }
    seen.add(signature);

    tables.push({
      title: context.title,
      normalizedTitle: normalizeText(context.title),
      updatedAt: context.updatedAt,
      reference: context.reference,
      headers,
      headerRows,
      bodyRows,
      rows,
      rowCount: bodyRows.length,
      tableIndex,
      tableClass: cleanText(tableClone.attr('class') || ''),
      tableHtml: $.html(tableClone),
    });
  });

  return tables;
}

function pickCoffeeRegionalTable(allTables) {
  const orderedCoffeeRegions = ['Đắk Lắk', 'Gia Lai', 'Đắk Nông', 'Lâm Đồng'];

  const resolveRegion = (value = '') => {
    const normalized = normalizeText(value).replace(/[^a-z0-9]+/g, ' ').trim();
    if (!normalized) return null;

    if (normalized.includes('gia lai')) return 'Gia Lai';
    if (normalized.includes('dak lak') || normalized === 'k l k') return 'Đắk Lắk';
    if (normalized.includes('dak nong') || normalized === 'k n ng') return 'Đắk Nông';
    if (normalized.includes('lam dong') || normalized === 'l m ng') return 'Lâm Đồng';
    return null;
  };

  const regionMap = {
    'dak lak': 'Đắk Lắk',
    'lam dong': 'Lâm Đồng',
    'gia lai': 'Gia Lai',
    'dak nong': 'Đắk Nông',
  };

  const required = Object.keys(regionMap);

  // Tìm bảng có class "gia-ca-phe" hoặc title chứa "cà phê"
  for (const table of allTables) {
    const isCoffeeTable = table.tableClass.includes('gia-ca-phe') || 
                          table.normalizedTitle.includes('ca phe');
    
    if (!isCoffeeTable) {
      continue;
    }

    const prices = {};
    const changes = {};

    // Duyệt qua từng row để tìm giá theo vùng
    for (const row of table.rows) {
      // Lấy tên vùng từ cột đầu tiên (có thể là col_1, khu_vuc, hoặc key khác)
      const firstColKey = Object.keys(row).find(k => !k.startsWith('_'));
      if (!firstColKey) continue;

      const regionText = row[firstColKey] || '';
      const normalized = normalizeText(regionText);
      const canonical = regionMap[normalized] || resolveRegion(regionText);
      
      if (!canonical) {
        continue;
      }

      // Lấy tất cả keys không phải internal
      const allKeys = Object.keys(row).filter(k => !k.startsWith('_'));
      
      // Cột giá thường là cột thứ 2 (index 1)
      let priceValue = '';
      if (allKeys.length >= 2) {
        priceValue = row[allKeys[1]] || '';
      }

      // Nếu không có, thử tìm key có chứa "gia"
      if (!priceValue) {
        const priceKey = allKeys.find(k => k.includes('gia'));
        if (priceKey) {
          priceValue = row[priceKey] || '';
        }
      }

      if (priceValue) {
        prices[canonical] = priceValue;
        
        // Cột thay đổi thường là cột thứ 3 (index 2)
        if (allKeys.length >= 3) {
          changes[canonical] = row[allKeys[2]] || '';
        } else {
          // Nếu không có, thử tìm key có chứa "thay" hoặc "doi"
          const changeKey = allKeys.find(k => k.includes('thay') || k.includes('doi'));
          changes[canonical] = changeKey ? row[changeKey] : '';
        }
      }
    }

    // Kiểm tra xem đã tìm đủ 4 vùng chưa
    const foundAll = required.every((r) => prices[regionMap[r]]);
    if (foundAll) {
      return { prices, changes, tableTitle: table.title };
    }

    // Nếu chưa đủ nhưng có ít nhất 1 vùng, vẫn trả về
    if (Object.keys(prices).length > 0) {
      console.log(`Found partial coffee prices: ${Object.keys(prices).join(', ')}`);
      return { prices, changes, tableTitle: table.title };
    }
  }

  throw new Error('Could not find coffee price table (gia-ca-phe)');
}

async function crawlCoffeePricesSimple() {
  const startTime = Date.now();

  try {
    console.log('Starting agri price crawl from nhabeagri...');

    const response = await axios.get(SOURCE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 30000,
    });

    const $ = cheerio.load(response.data);
    const allTables = extractAllTables($);
    const { prices, changes, tableTitle } = pickCoffeeRegionalTable(allTables);

    const pageTitle = cleanText($('.page-title').first().text()) || 'Gia nong san hom nay';
    const pageUpdatedAt = cleanText($('.ngay-cap-nhat').first().text()) || '';

    const priceSections = allTables.map((table, index) => ({
      id: `section_${index + 1}`,
      title: table.title,
      updatedAt: table.updatedAt || '',
      reference: table.reference || null,
      tableClass: table.tableClass || '',
      tableHtml: table.tableHtml || '',
      headers: table.headers || [],
      headerRows: table.headerRows || [],
      bodyRows: table.bodyRows || [],
      rowCount: table.rowCount || 0,
      tableIndex: table.tableIndex,
    }));

    const priceData = {
      source: 'nhabeagri.com',
      url: SOURCE_URL,
      pageTitle,
      pageUpdatedAt,
      prices,
      changes,
      coffeeSourceTable: tableTitle,
      allTables,
      priceSections,
      timestamp: Date.now(),
      date: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      unit: 'VND/kg',
      crawlDuration: Date.now() - startTime,
      method: 'section-table-extraction',
    };

    await savePriceData(priceData);
    console.log(`Crawl completed successfully. tables=${allTables.length}`);

    return priceData;
  } catch (error) {
    const status = error?.response?.status || null;
    console.error('Crawl error:', {
      message: error?.message || 'Unknown error',
      status,
    });

    try {
      await admin.firestore().collection('crawler_errors').add({
        error: error?.message || 'Unknown error',
        stack: error?.stack || null,
        status,
        timestamp: Date.now(),
        source: 'simpleCrawler',
        url: SOURCE_URL,
      });
    } catch (logError) {
      console.error('Failed to log crawler error:', logError?.message || logError);
    }

    throw error;
  }
}

async function savePriceData(priceData) {
  const db = admin.firestore();

  // Clean data for Firestore - remove deeply nested objects
  const cleanedData = {
    source: priceData.source,
    url: priceData.url,
    pageTitle: priceData.pageTitle,
    pageUpdatedAt: priceData.pageUpdatedAt,
    prices: priceData.prices,
    changes: priceData.changes,
    coffeeSourceTable: priceData.coffeeSourceTable,
    timestamp: priceData.timestamp,
    date: priceData.date,
    unit: priceData.unit,
    crawlDuration: priceData.crawlDuration,
    method: priceData.method,
    tableCount: priceData.allTables?.length || 0,
    // Store simplified sections without nested arrays
    priceSections: (priceData.priceSections || []).map(section => ({
      id: section.id,
      title: section.title,
      updatedAt: section.updatedAt,
      reference: section.reference,
      tableClass: section.tableClass,
      tableHtml: section.tableHtml,
      rowCount: section.rowCount,
      tableIndex: section.tableIndex,
      // Remove headerRows and bodyRows - they contain nested arrays
    }))
  };

  const priceDocRef = await db.collection('coffee_prices').add(cleanedData);

  await db.collection('full_prices').doc('current').set({
    ...cleanedData,
    lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
  });

  console.log('Firestore write completed:', {
    coffee_prices_doc: priceDocRef.id,
    full_prices_doc: 'full_prices/current',
  });
}

module.exports = {
  crawlCoffeePricesSimple,
};
