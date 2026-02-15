const fs = require('fs');
const cheerio = require('./functions/node_modules/cheerio');

// Copy các hàm từ simpleCrawler.js
function normalizeText(text = '') {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đÐ]/g, 'd')
    .replace(/[Đ]/g, 'D')
    .replace(/Ä'/g, 'd')
    .replace(/Ä/g, 'D')
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

function extractAllTables($) {
  const tables = [];
  const seen = new Set();

  $('table').each((tableIndex, tableEl) => {
    const $table = $(tableEl);
    const tableClass = cleanText($table.attr('class') || '');

    const hasThead = $table.find('thead tr').length > 0;
    const headerRowElements = hasThead
      ? $table.find('thead tr').toArray()
      : $table.find('tr').first().toArray();

    const headerRows = headerRowElements.map((rowEl) => (
      $(rowEl).find('th,td').toArray().map((cellEl) => extractCellData($, cellEl))
    ));

    const bodyRowElements = hasThead
      ? ($table.find('tbody tr').length > 0
        ? $table.find('tbody tr').toArray()
        : $table.find('tr').slice(headerRowElements.length).toArray())
      : $table.find('tr').slice(1).toArray();

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

    tables.push({
      tableClass,
      normalizedTitle: normalizeText(tableClass),
      headers,
      keys,
      rows,
      rowCount: bodyRows.length,
      tableIndex,
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

    console.log('\n=== Found Coffee Table ===');
    console.log('Table class:', table.tableClass);
    console.log('Headers:', table.headers);
    console.log('Keys:', table.keys);
    console.log('First row:', table.rows[0]);

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

      console.log(`\nFound region: ${canonical}`);
      console.log('Row data:', row);

      // Tìm cột giá - thường là cột thứ 3 hoặc có key chứa "gia"
      const priceKeys = Object.keys(row).filter(k => 
        !k.startsWith('_') && 
        (k.includes('gia') || k.includes('col_3'))
      );
      
      // Ưu tiên cột có "gia" trong tên, nếu không thì lấy cột thứ 3
      let priceValue = '';
      for (const key of priceKeys) {
        if (row[key] && row[key].trim()) {
          priceValue = row[key];
          console.log(`Price from key "${key}":`, priceValue);
          break;
        }
      }

      // Nếu không tìm thấy, thử lấy từ các cột theo thứ tự
      if (!priceValue) {
        const allKeys = Object.keys(row).filter(k => !k.startsWith('_'));
        // Thường giá ở cột 2 (index 1)
        if (allKeys.length >= 2) {
          priceValue = row[allKeys[1]] || '';
          console.log(`Price from column 2 (${allKeys[1]}):`, priceValue);
        }
      }

      if (priceValue) {
        prices[canonical] = priceValue;
        
        // Tìm cột thay đổi
        const changeKeys = Object.keys(row).filter(k => 
          k.includes('thay') || k.includes('doi') || k.includes('col_3')
        );
        changes[canonical] = changeKeys.length > 0 ? row[changeKeys[0]] : '';
      }
    }

    console.log('\n=== Extracted Prices ===');
    console.log('Prices:', prices);
    console.log('Changes:', changes);

    // Kiểm tra xem đã tìm đủ 4 vùng chưa
    const foundAll = required.every((r) => prices[regionMap[r]]);
    if (foundAll) {
      return { prices, changes, tableTitle: 'Coffee Prices' };
    }

    // Nếu chưa đủ nhưng có ít nhất 1 vùng, vẫn trả về
    if (Object.keys(prices).length > 0) {
      console.log(`Found partial coffee prices: ${Object.keys(prices).join(', ')}`);
      return { prices, changes, tableTitle: 'Coffee Prices' };
    }
  }

  throw new Error('Could not find coffee price table (gia-ca-phe)');
}

// Test
const html = fs.readFileSync('tmp_nhabeagri.html', 'utf8');
const $ = cheerio.load(html);

console.log('=== Starting Crawler Test ===\n');

const allTables = extractAllTables($);
console.log(`Total tables found: ${allTables.length}\n`);

try {
  const result = pickCoffeeRegionalTable(allTables);
  console.log('\n=== SUCCESS ===');
  console.log('Final result:', JSON.stringify(result, null, 2));
} catch (error) {
  console.error('\n=== ERROR ===');
  console.error(error.message);
}
