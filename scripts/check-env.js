// scripts/check-env.js
import fs from 'node:fs';
import path from 'node:path';

// 1. Read .env.example
const examplePath = path.resolve(process.cwd(), '.env.example');

if (!fs.existsSync(examplePath)) {
  console.error('❌ .env.example file not found! Please ensure it exists in the project root.');
  process.exit(1);
}

const content = fs.readFileSync(examplePath, 'utf-8');

// 2. Parse all Keys (filter out comments # and empty lines)
const requiredKeys = content
  .split('\n')
  .map(line => line.trim())
  .filter(line => line && !line.startsWith('#'))
  .map(line => line.split('=')[0].trim());

console.log(`🔍 Checking ${requiredKeys.length} environment variables...`);

// 3. Compare with process.env
const missingKeys = [];

requiredKeys.forEach(key => {
  // Check if variable exists and is not an empty string
  if (!process.env[key] || process.env[key].trim() === '') {
    missingKeys.push(key);
  }
});

// 4. Output results
if (missingKeys.length > 0) {
  console.error('\n❌ [Deployment Failed] GitHub Secrets is missing the following environment variables, please add them in Settings:');
  console.error('------------------------------------------------');
  missingKeys.forEach(key => {
    console.error(`   - ${key}`);
  });
  console.error('------------------------------------------------\n');
  process.exit(1); // Return error code to stop CI
}

console.log('✅ Environment variable check passed! All variables in .env.example are set.\n');