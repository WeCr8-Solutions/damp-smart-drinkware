const { test: setup } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

setup('setup test context', async ({ page }) => {
  const storagePath = path.resolve(__dirname, '../storage/auth.json');
  const storageDir = path.dirname(storagePath);
  
  // Create storage directory if it doesn't exist
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  
  // Create empty auth state if it doesn't exist
  if (!fs.existsSync(storagePath)) {
    fs.writeFileSync(storagePath, JSON.stringify({
      cookies: [],
      origins: []
    }));
  }

  await page.context().storageState({ path: storagePath });
});