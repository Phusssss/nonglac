import axios from 'axios';
import fs from 'fs';

const getWebGiaHtml = async () => {
  try {
    console.log('Fetching HTML from WebGia...');
    
    const response = await axios.get('https://webgia.com/gia-hang-hoa/ca-phe/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `webgia_html_${timestamp}.html`;
    
    fs.writeFileSync(filename, response.data, 'utf8');
    console.log(`HTML saved to: ${filename}`);
    
  } catch (error) {
    console.error('Error fetching HTML:', error.message);
  }
};

getWebGiaHtml();