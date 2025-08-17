// scripts/build-pwa.js - PWA対応ビルドスクリプト
const fs = require('fs');
const path = require('path');

async function buildPWA() {
  console.log('Building PWA...');
  
  // Expo export実行
  const { execSync } = require('child_process');
  execSync('npx expo export --platform web', { stdio: 'inherit' });
  
  // PWAファイルをdistにコピー
  const publicFiles = [
    'manifest.json',
    'sw.js', 
    'offline.html',
    'favicon.ico'
  ];
  
  for (const file of publicFiles) {
    const src = path.join('public', file);
    const dest = path.join('dist', file);
    
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied ${file}`);
    }
  }
  
  // アイコンフォルダをコピー
  const iconsDir = path.join('public', 'icons');
  const destIconsDir = path.join('dist', 'icons');
  
  if (fs.existsSync(iconsDir)) {
    fs.mkdirSync(destIconsDir, { recursive: true });
    
    const icons = fs.readdirSync(iconsDir);
    for (const icon of icons) {
      fs.copyFileSync(
        path.join(iconsDir, icon),
        path.join(destIconsDir, icon)
      );
    }
    console.log('Copied icons folder');
  }
  
  console.log('PWA build complete!');
}

buildPWA().catch(console.error);