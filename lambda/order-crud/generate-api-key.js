#!/usr/bin/env node

/**
 * API Key 生成工具
 * 用於生成安全的 API Key
 */

const crypto = require('crypto');

/**
 * 生成安全的 API Key
 * @param {number} length - Key 長度
 * @returns {string} 生成的 API Key
 */
function generateApiKey(length = 64) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * 生成帶前綴的 API Key
 * @param {string} prefix - Key 前綴
 * @param {number} length - Key 長度
 * @returns {string} 生成的 API Key
 */
function generatePrefixedApiKey(prefix = 'ak', length = 32) {
  const key = crypto.randomBytes(length).toString('hex');
  return `${prefix}_${key}`;
}

/**
 * 驗證 API Key 格式
 * @param {string} apiKey - 要驗證的 API Key
 * @returns {boolean} 是否有效
 */
function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // 檢查長度（至少 32 字符）
  if (apiKey.length < 32) {
    return false;
  }
  
  // 檢查是否只包含字母數字字符
  if (!/^[a-zA-Z0-9_]+$/.test(apiKey)) {
    return false;
  }
  
  return true;
}

// 如果直接執行此腳本
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'generate':
      const length = parseInt(args[1]) || 64;
      const key = generateApiKey(length);
      console.log('Generated API Key:');
      console.log(key);
      console.log('\nAdd this to your environment variables:');
      console.log(`API_KEY=${key}`);
      break;
      
    case 'generate-prefixed':
      const prefix = args[1] || 'ak';
      const keyLength = parseInt(args[2]) || 32;
      const prefixedKey = generatePrefixedApiKey(prefix, keyLength);
      console.log('Generated Prefixed API Key:');
      console.log(prefixedKey);
      console.log('\nAdd this to your environment variables:');
      console.log(`API_KEY=${prefixedKey}`);
      break;
      
    case 'validate':
      const keyToValidate = args[1];
      if (!keyToValidate) {
        console.error('Please provide an API key to validate');
        process.exit(1);
      }
      
      const isValid = validateApiKey(keyToValidate);
      console.log(`API Key validation: ${isValid ? 'VALID' : 'INVALID'}`);
      if (!isValid) {
        console.log('API Key must be at least 32 characters long and contain only alphanumeric characters and underscores');
      }
      break;
      
    default:
      console.log('API Key Generator');
      console.log('\nUsage:');
      console.log('  node generate-api-key.js generate [length]     - Generate a random API key');
      console.log('  node generate-api-key.js generate-prefixed [prefix] [length] - Generate a prefixed API key');
      console.log('  node generate-api-key.js validate <key>       - Validate an API key');
      console.log('\nExamples:');
      console.log('  node generate-api-key.js generate');
      console.log('  node generate-api-key.js generate-prefixed ak 32');
      console.log('  node generate-api-key.js validate ak_1234567890abcdef1234567890abcdef');
      break;
  }
}

module.exports = {
  generateApiKey,
  generatePrefixedApiKey,
  validateApiKey
};
