const fs = require('fs');
const cheerio = require('./functions/node_modules/cheerio');

const html = fs.readFileSync('tmp_nhabeagri.html', 'utf8');
const $ = cheerio.load(html);

console.log('=== Testing Coffee Price Table Extraction ===\n');

// Tìm tất cả bảng có class gia-ca-phe
const coffeeTables = $('.gia-ca-phe');
console.log(`Found ${coffeeTables.length} tables with class "gia-ca-phe"\n`);

coffeeTables.each((index, tableEl) => {
  console.log(`\n--- Table ${index + 1} ---`);
  const $table = $(tableEl);
  
  // Lấy tất cả các row
  const rows = $table.find('tbody tr, tr');
  console.log(`Total rows: ${rows.length}`);
  
  rows.each((rowIndex, rowEl) => {
    const $row = $(rowEl);
    const cells = $row.find('td, th');
    const cellTexts = [];
    
    cells.each((cellIndex, cellEl) => {
      cellTexts.push($(cellEl).text().trim());
    });
    
    if (cellTexts.length > 0) {
      console.log(`Row ${rowIndex + 1}:`, cellTexts);
    }
  });
});

console.log('\n=== Testing Summary Table ===\n');
const summaryTable = $('.bang-gia-nong-san');
console.log(`Found ${summaryTable.length} summary tables\n`);

if (summaryTable.length > 0) {
  const rows = summaryTable.find('tbody tr, tr');
  console.log(`Total rows: ${rows.length}`);
  
  rows.slice(0, 5).each((rowIndex, rowEl) => {
    const $row = $(rowEl);
    const cells = $row.find('td, th');
    const cellTexts = [];
    
    cells.each((cellIndex, cellEl) => {
      cellTexts.push($(cellEl).text().trim());
    });
    
    if (cellTexts.length > 0) {
      console.log(`Row ${rowIndex + 1}:`, cellTexts);
    }
  });
}
