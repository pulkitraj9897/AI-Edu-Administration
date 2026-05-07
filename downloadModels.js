const https = require('https');
const fs = require('fs');
const path = require('path');

const modelsDir = path.join(__dirname, 'frontend', 'public', 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';
const files = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  'ssd_mobilenetv1_model-shard1',
  'ssd_mobilenetv1_model-shard2',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

let pending = files.length;

files.forEach(file => {
  const dest = path.join(modelsDir, file);
  const fileStream = fs.createWriteStream(dest);
  https.get(baseUrl + file, response => {
    response.pipe(fileStream);
    fileStream.on('finish', () => {
      fileStream.close();
      console.log(`Downloaded ${file}`);
      pending--;
      if (pending === 0) console.log('All models downloaded successfully.');
    });
  }).on('error', err => {
    console.error(`Error downloading ${file}:`, err.message);
  });
});
