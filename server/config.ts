// server/config.ts
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// For ESM, __dirname is not available directly.
// process.cwd() should point to the project root if scripts are run from there.
// Alternatively, go up one level from server/ to find the .env file.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Assuming .env is in the parent directory of 'server' (i.e., project root)
const envPath = path.resolve(__dirname, '..', '.env');

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('[dotenv] Error loading .env file from ' + envPath + ':', result.error);
} else {
  console.log('[dotenv] .env file processed from:', envPath);
  if (result.parsed) {
    console.log('[dotenv] Variables loaded:', Object.keys(result.parsed).join(', '));
  } else {
    console.log('[dotenv] No new variables were loaded (they might already be set in the environment).');
  }
}

// Log key immediately after trying to load
console.log(`[server/config.ts] GEMINI_FLASH_API_KEY check (first 10 chars): ${process.env.GEMINI_FLASH_API_KEY ? process.env.GEMINI_FLASH_API_KEY.substring(0, 10) + '...' : 'MISSING or empty'}`);
console.log(`[server/config.ts] NODE_ENV check: ${process.env.NODE_ENV}`);
console.log(`[server/config.ts] PORT check: ${process.env.PORT}`);

// Verify if the key is an empty string specifically
if (process.env.GEMINI_FLASH_API_KEY === '') {
    console.warn('[server/config.ts] GEMINI_FLASH_API_KEY is present but is an EMPTY STRING.');
} 