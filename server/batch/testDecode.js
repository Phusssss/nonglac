// Test decode function
const gm = (r) => {
  r = r.replace(/A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z/g, "");
  const n = [];
  for (let t = 0; t < r.length - 1; t += 2) {
    n.push(parseInt(r.substr(t, 2), 16));
  }
  return String.fromCharCode.apply(String, n);
};

// Test với các mã từ HTML
const testCodes = [
  { market: 'Đắk Lắk', code: 'NG3Y13VB13JE62e3H5A303D0' },
  { market: 'Lâm Đồng', code: 'K313135UE2eUOYZ323R0Q30' },
  { market: 'Gia Lai', code: 'RS31313CG62e3030E30N' },
  { market: 'Đắk Nông', code: '313TFU1362e3G5S3030' }
];

console.log('Testing decode function:');
testCodes.forEach(item => {
  try {
    const decoded = gm(item.code);
    console.log(`${item.market}: ${item.code} → "${decoded}"`);
  } catch (e) {
    console.log(`${item.market}: ${item.code} → ERROR: ${e.message}`);
  }
});