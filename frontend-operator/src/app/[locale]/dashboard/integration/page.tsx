'use client'

import { useState } from 'react'
import { Code, Copy, Check } from 'lucide-react'

export default function IntegrationPage() {
  const [copied, setCopied] = useState<string | null>(null)
  const [language, setLanguage] = useState('javascript')

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const codeExamples: Record<string, string> = {
    javascript: `// Install axios
// npm install axios

const axios = require('axios');

const API_KEY = 'your_api_key_here';
const API_URL = 'http://127.0.0.1:8000/api/v1';

async function checkExclusion(phoneNumber) {
  try {
    const response = await axios.post(
      \`\${API_URL}/nser/lookup/\`,
      {
        phone_number: phoneNumber,
        operator_id: 'your_operator_id'
      },
      {
        headers: {
          'Authorization': \`Bearer \${API_KEY}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.is_excluded) {
      console.log('User is EXCLUDED');
      console.log('Exclusion ends:', response.data.end_date);
      return false; // Block user
    }
    
    return true; // Allow user
  } catch (error) {
    console.error('Lookup failed:', error);
    return false; // Fail-safe: block on error
  }
}

// Usage
checkExclusion('+254712345678').then(allowed => {
  if (allowed) {
    console.log('User can proceed');
  } else {
    console.log('User is blocked');
  }
});`,
    python: `# Install requests
# pip install requests

import requests

API_KEY = 'your_api_key_here'
API_URL = 'http://127.0.0.1:8000/api/v1'

def check_exclusion(phone_number):
    try:
        response = requests.post(
            f'{API_URL}/nser/lookup/',
            json={
                'phone_number': phone_number,
                'operator_id': 'your_operator_id'
            },
            headers={
                'Authorization': f'Bearer {API_KEY}',
                'Content-Type': 'application/json'
            }
        )
        
        data = response.json()
        
        if data.get('is_excluded'):
            print('User is EXCLUDED')
            print(f"Exclusion ends: {data.get('end_date')}")
            return False  # Block user
        
        return True  # Allow user
    except Exception as e:
        print(f'Lookup failed: {e}')
        return False  # Fail-safe: block on error

# Usage
if check_exclusion('+254712345678'):
    print('User can proceed')
else:
    print('User is blocked')`,
    php: `<?php
// Install Guzzle
// composer require guzzlehttp/guzzle

require 'vendor/autoload.php';

use GuzzleHttp\\Client;

$apiKey = 'your_api_key_here';
$apiUrl = 'http://127.0.0.1:8000/api/v1';

function checkExclusion($phoneNumber) {
    global $apiKey, $apiUrl;
    
    $client = new Client();
    
    try {
        $response = $client->post("$apiUrl/nser/lookup/", [
            'json' => [
                'phone_number' => $phoneNumber,
                'operator_id' => 'your_operator_id'
            ],
            'headers' => [
                'Authorization' => "Bearer $apiKey",
                'Content-Type' => 'application/json'
            ]
        ]);
        
        $data = json_decode($response->getBody(), true);
        
        if ($data['is_excluded']) {
            echo "User is EXCLUDED\\n";
            echo "Exclusion ends: " . $data['end_date'] . "\\n";
            return false; // Block user
        }
        
        return true; // Allow user
    } catch (Exception $e) {
        echo "Lookup failed: " . $e->getMessage() . "\\n";
        return false; // Fail-safe: block on error
    }
}

// Usage
if (checkExclusion('+254712345678')) {
    echo "User can proceed\\n";
} else {
    echo "User is blocked\\n";
}
?>`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Integration Guide</h1>
        <p className="text-gray-600 mt-1">Integrate NSER exclusion checks into your platform</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Start</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <div>
              <h3 className="font-semibold text-gray-900">Get API Keys</h3>
              <p className="text-sm text-gray-600">Generate production and sandbox API keys from the API Keys page</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <div>
              <h3 className="font-semibold text-gray-900">Implement Lookup</h3>
              <p className="text-sm text-gray-600">Add exclusion checks before allowing users to gamble</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
            <div className="h-6 w-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <div>
              <h3 className="font-semibold text-gray-900">Handle Response</h3>
              <p className="text-sm text-gray-600">Block excluded users and show appropriate messaging</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Code Examples</h2>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="php">PHP</option>
          </select>
        </div>

        <div className="relative">
          <button
            onClick={() => copyCode(codeExamples[language], language)}
            className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
          >
            {copied === language ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
          <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto">
            <code>{codeExamples[language]}</code>
          </pre>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">API Endpoints</h2>
        <div className="space-y-3">
          <div className="border-l-4 border-indigo-600 pl-4">
            <p className="font-mono text-sm text-gray-900">POST /api/v1/nser/lookup/</p>
            <p className="text-sm text-gray-600 mt-1">Check if a user is excluded</p>
          </div>
          <div className="border-l-4 border-indigo-600 pl-4">
            <p className="font-mono text-sm text-gray-900">POST /api/v1/nser/lookup/bulk/</p>
            <p className="text-sm text-gray-600 mt-1">Check multiple users at once (max 100)</p>
          </div>
          <div className="border-l-4 border-indigo-600 pl-4">
            <p className="font-mono text-sm text-gray-900">POST /api/v1/nser/lookup/bst/</p>
            <p className="text-sm text-gray-600 mt-1">Check using BST token</p>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Important Notes</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
          <li>Always implement fail-safe logic: block users if lookup fails</li>
          <li>Cache exclusion status for 5 minutes maximum</li>
          <li>Target response time: &lt;50ms for lookups</li>
          <li>Use webhooks for real-time exclusion updates</li>
          <li>Never store exclusion data permanently</li>
        </ul>
      </div>
    </div>
  )
}
