const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace single quotes: 'http://localhost:5000/api/path'
    content = content.replace(/'http:\/\/localhost:5000\/api([^']*)'/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000/api\'}$1`');
    
    // Replace template literals: `http://localhost:5000/api/path${var}`
    content = content.replace(/`http:\/\/localhost:5000\/api([^`]*)`/g, '`${import.meta.env.VITE_API_URL || \'http://localhost:5000/api\'}$1`');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
