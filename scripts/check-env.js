// scripts/check-env.js
import fs from 'node:fs';
import path from 'node:path';

// 1. 讀取 .env.example
const examplePath = path.resolve(process.cwd(), '.env.example');

if (!fs.existsSync(examplePath)) {
  console.error('❌ 找不到 .env.example 檔案！請確保它存在於專案根目錄。');
  process.exit(1);
}

const content = fs.readFileSync(examplePath, 'utf-8');

// 2. 解析出所有的 Key (過濾掉註解 # 和空行)
const requiredKeys = content
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))
  .map(line => line.split('=')[0].trim());

console.log(`🔍 正在檢查 ${requiredKeys.length} 個環境變數...`);

// 3. 比對 process.env
const missingKeys = [];

requiredKeys.forEach(key => {
  // 檢查變數是否存在且不為空字串
  if (!process.env[key] || process.env[key].trim() === '') {
    missingKeys.push(key);
  }
});

// 4. 輸出結果
if (missingKeys.length > 0) {
  console.error('\n❌ [部署失敗] GitHub Secrets 缺少以下環境變數，請去 Settings 補上：');
  console.error('------------------------------------------------');
  missingKeys.forEach(key => {
    console.error(`   - ${key}`);
  });
  console.error('------------------------------------------------\n');
  process.exit(1); // 回傳錯誤碼，讓 CI 停止
}

console.log('✅ 環境變數檢查通過！所有 .env.example 中的變數皆已設定。\n');