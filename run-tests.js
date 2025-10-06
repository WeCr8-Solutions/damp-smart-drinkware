const { spawn } = require('child_process');
const path = require('path');
const http = require('http');
const testConfig = require('./test-config');

async function runTest(test) {
  console.log(`\n🚀 Running test: ${test.name}`);
  console.log(`Description: ${test.description}`);
  
  return new Promise((resolve, reject) => {
    if (test.type === 'verification') {
      try {
        const verificationModule = require(`./${test.file}`);
        if (typeof verificationModule.runCompleteVerification === 'function') {
          verificationModule.runCompleteVerification()
            .then(success => {
              if (success) {
                console.log(`✅ Verification ${test.name} completed successfully`);
                resolve();
              } else {
                console.error(`❌ Verification ${test.name} failed`);
                reject(new Error('Verification failed'));
              }
            })
            .catch(error => {
              console.error(`❌ Error in verification ${test.name}:`, error);
              reject(error);
            });
        } else {
          reject(new Error('Verification module does not export runCompleteVerification function'));
        }
      } catch (error) {
        console.error(`❌ Error loading verification module ${test.file}:`, error);
        reject(error);
      }
    } else if (test.type === 'browser') {
      // For browser-based tests, start a local server
      const server = http.createServer((req, res) => {
        // Serve the HTML file
        res.writeHead(200, { 'Content-Type': 'text/html' });
        require('fs').readFile(test.file, (err, data) => {
          if (err) {
            res.end('Error loading test file');
            return;
          }
          res.end(data);
        });
      });
      
      server.listen(0, () => {
        const port = server.address().port;
        console.log(`Test server running on port ${port}`);
        console.log(`Please open http://localhost:${port} in your browser to run the test`);
        console.log('Press Ctrl+C when finished testing');
      });
      
      // Handle server shutdown
      process.on('SIGINT', () => {
        server.close();
        resolve();
      });
    } else if (test.type === 'node') {
      // For Node.js tests
      const proc = spawn('node', [test.file], {
        stdio: 'inherit'
      });
      
      proc.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ Test ${test.name} completed successfully`);
          resolve();
        } else {
          console.error(`❌ Test ${test.name} failed with code ${code}`);
          reject(new Error(`Test failed with code ${code}`));
        }
      });
    } else if (test.type === 'doc') {
      console.log(`📝 Documentation test: ${test.name}`);
      console.log(`Please review the documentation at: ${test.file}`);
      resolve();
    }
  });
}

async function runAllTests() {
  console.log('Running all tests sequentially...\n');
  
  const allTests = [
    ...testConfig.browserTests,
    ...testConfig.automatedTests,
    ...testConfig.workflowTests,
    ...testConfig.verificationTests
  ];
  
  for (const test of allTests) {
    try {
      await runTest(test);
    } catch (error) {
      console.error(`Error running ${test.name}:`, error);
      // Continue with next test even if current one fails
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const testName = args[0];
  
  if (!testName) {
    // No specific test specified, run all tests
    await runAllTests();
    return;
  }
  
  // Find the specified test
  const allTests = [
    ...testConfig.browserTests,
    ...testConfig.automatedTests,
    ...testConfig.workflowTests
  ];
  
  const testToRun = allTests.find(t => 
    t.name.toLowerCase() === testName.toLowerCase() ||
    t.file.toLowerCase().includes(testName.toLowerCase())
  );
  
  if (!testToRun) {
    console.error(`Test "${testName}" not found`);
    console.log('\nAvailable tests:');
    allTests.forEach(t => console.log(`- ${t.name} (${t.file})`));
    process.exit(1);
  }
  
  try {
    await runTest(testToRun);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

main().catch(console.error);