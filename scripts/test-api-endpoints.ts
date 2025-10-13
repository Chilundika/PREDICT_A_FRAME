// Simple API endpoint validation test
// This tests the API structure without needing a running server

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface APITest {
  name: string;
  path: string;
  expectedMethods: string[];
  status: 'PASS' | 'FAIL';
  message: string;
}

class APITester {
  private results: APITest[] = [];
  private apiBasePath = join(process.cwd(), 'app', 'api');

  async testAPIStructure() {
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║            API ENDPOINTS STRUCTURE TEST                    ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("");

    // Test each API endpoint
    this.testEndpoint('Notify API', 'notify/route.ts', ['POST']);
    this.testEndpoint('Validate Address API', 'validate-address/route.ts', ['GET', 'POST']);
    this.testEndpoint('Webhook API', 'webhook/route.ts', []);
    this.testEndpoint('Protected Example API', 'protected/example/route.ts', []);

    this.printResults();
  }

  private testEndpoint(name: string, path: string, expectedMethods: string[]) {
    const fullPath = join(this.apiBasePath, path);
    
    if (!existsSync(fullPath)) {
      this.results.push({
        name,
        path,
        expectedMethods,
        status: 'FAIL',
        message: 'File does not exist'
      });
      return;
    }

    try {
      const content = readFileSync(fullPath, 'utf-8');
      
      // Check for expected HTTP methods
      const foundMethods: string[] = [];
      const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      
      methods.forEach(method => {
        const regex = new RegExp(`export\\s+async\\s+function\\s+${method}`, 'i');
        if (regex.test(content)) {
          foundMethods.push(method);
        }
      });

      // Validate expected methods are present
      const missingMethods = expectedMethods.filter(m => !foundMethods.includes(m));
      
      if (missingMethods.length > 0 && expectedMethods.length > 0) {
        this.results.push({
          name,
          path,
          expectedMethods,
          status: 'FAIL',
          message: `Missing methods: ${missingMethods.join(', ')}`
        });
      } else {
        this.results.push({
          name,
          path,
          expectedMethods,
          status: 'PASS',
          message: `Found methods: ${foundMethods.join(', ') || 'None (file exists)'}`
        });
      }
    } catch (error: any) {
      this.results.push({
        name,
        path,
        expectedMethods,
        status: 'FAIL',
        message: `Error reading file: ${error.message}`
      });
    }
  }

  private printResults() {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("  API ENDPOINT RESULTS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("");

    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✅' : '❌';
      console.log(`${icon} ${result.name}`);
      console.log(`   Path: app/api/${result.path}`);
      console.log(`   ${result.message}`);
      console.log("");
    });

    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`📊 API Endpoints: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    
    if (failed === 0) {
      console.log("");
      console.log("✅ All API endpoints are properly structured!");
    } else {
      console.log("");
      console.log("❌ Some API endpoints have issues!");
      process.exit(1);
    }
  }
}

// Run the tests
const tester = new APITester();
tester.testAPIStructure().catch(error => {
  console.error("❌ API test failed:", error);
  process.exit(1);
});

