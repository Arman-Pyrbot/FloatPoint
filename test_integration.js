#!/usr/bin/env node
/**
 * Integration test for FloatPoint BGC Model
 * Tests the complete flow: HF Space -> Next.js API -> Supabase
 */

const https = require('https');

// Configuration
const HF_SPACE_URL = 'https://armanpyro-floatpoint.hf.space';
const NEXTJS_API_URL = 'http://localhost:3000/api/predict';

// Test data
const testCases = [
  {
    name: 'Surface Waters (Arabian Sea)',
    data: {
      temperature: 28.5,
      salinity: 36.2,
      pressure: 5.0
    }
  },
  {
    name: 'Deep Waters (Bay of Bengal)',
    data: {
      temperature: 15.2,
      salinity: 34.8,
      pressure: 150.0
    }
  },
  {
    name: 'Complete Parameters',
    data: {
      temperature: 25.5,
      salinity: 35.2,
      pressure: 100.0,
      dissolvedOxygen: 200.0,
      nitrate: 1.5,
      chlorophyll: 0.8
    }
  }
];

// Helper function to make HTTP requests
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            data: JSON.parse(body)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            data: body
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test Hugging Face Space directly
async function testHuggingFaceSpace() {
  console.log('🧪 Testing Hugging Face Space...');
  
  try {
    // First check if the space is accessible
    const healthCheck = await makeRequest(HF_SPACE_URL, { method: 'GET' });
    
    if (healthCheck.statusCode === 200) {
      console.log('✅ Hugging Face Space is accessible');
      
      // Test the API endpoint
      for (const testCase of testCases) {
        console.log(`\n🔬 Testing: ${testCase.name}`);
        
        const apiData = {
          data: [
            testCase.data.temperature,
            testCase.data.salinity,
            testCase.data.pressure,
            testCase.data.dissolvedOxygen || null,
            testCase.data.nitrate || null,
            testCase.data.chlorophyll || null
          ]
        };
        
        try {
          const result = await makeRequest(`${HF_SPACE_URL}/api/predict`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          }, apiData);
          
          if (result.statusCode === 200) {
            console.log('✅ HF API call successful');
            console.log('📊 Sample prediction:', JSON.stringify(result.data, null, 2));
          } else {
            console.log(`❌ HF API call failed: ${result.statusCode}`);
            console.log('📝 Response:', result.data);
          }
        } catch (error) {
          console.log(`❌ HF API error: ${error.message}`);
        }
        
        // Wait between requests
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } else {
      console.log(`❌ Hugging Face Space not accessible: ${healthCheck.statusCode}`);
    }
  } catch (error) {
    console.log(`❌ Cannot reach Hugging Face Space: ${error.message}`);
  }
}

// Test Next.js API (requires local server running)
async function testNextJSAPI() {
  console.log('\n🌐 Testing Next.js API...');
  
  try {
    const http = require('http');
    
    for (const testCase of testCases) {
      console.log(`\n🔬 Testing: ${testCase.name}`);
      
      const postData = JSON.stringify(testCase.data);
      
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/predict',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const result = await new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
          let body = '';
          res.on('data', (chunk) => body += chunk);
          res.on('end', () => {
            try {
              resolve({
                statusCode: res.statusCode,
                data: JSON.parse(body)
              });
            } catch (e) {
              resolve({
                statusCode: res.statusCode,
                data: body
              });
            }
          });
        });
        
        req.on('error', reject);
        req.write(postData);
        req.end();
      });
      
      if (result.statusCode === 200) {
        console.log('✅ Next.js API call successful');
        console.log('📊 Response:', JSON.stringify(result.data, null, 2));
      } else {
        console.log(`❌ Next.js API call failed: ${result.statusCode}`);
        console.log('📝 Response:', result.data);
      }
      
      // Wait between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.log(`❌ Next.js API error: ${error.message}`);
    console.log('💡 Make sure your Next.js server is running: npm run dev');
  }
}

// Main test function
async function runTests() {
  console.log('🌊 FloatPoint BGC Model - Integration Test');
  console.log('=' * 50);
  
  // Test Hugging Face Space
  await testHuggingFaceSpace();
  
  // Test Next.js API
  await testNextJSAPI();
  
  console.log('\n🎯 Test Summary:');
  console.log('1. Deploy your model files to Hugging Face Space');
  console.log('2. Update your .env.local with Supabase keys');
  console.log('3. Run the SQL script to create the predictions table');
  console.log('4. Start your Next.js server: npm run dev');
  console.log('5. Test the integration in your dashboard');
}

// Run the tests
runTests().catch(console.error);