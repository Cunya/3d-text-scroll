// This is a Node.js script to download the font file
// Run this with: node download-font.js

const https = require('https');
const fs = require('fs');

console.log('Downloading helvetiker_regular.typeface.json...');

const fontUrl = 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_regular.typeface.json';
const outputPath = './helvetiker_regular.typeface.json';

https.get(fontUrl, (response) => {
  if (response.statusCode !== 200) {
    console.error(`Failed to download font: ${response.statusCode} ${response.statusMessage}`);
    return;
  }

  const fileStream = fs.createWriteStream(outputPath);
  response.pipe(fileStream);

  fileStream.on('finish', () => {
    fileStream.close();
    console.log(`Font downloaded successfully to ${outputPath}`);
    
    // Verify file size
    const stats = fs.statSync(outputPath);
    console.log(`File size: ${stats.size} bytes`);
    
    if (stats.size < 1000) {
      console.error('Warning: Downloaded file is too small, might be corrupted');
    } else {
      console.log('File size looks good');
    }
  });
}).on('error', (err) => {
  console.error(`Error downloading font: ${err.message}`);
}); 