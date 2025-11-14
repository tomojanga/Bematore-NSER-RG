<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>API Reference  | NSER Portal</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/api-reference.css">
</head>

<body>

<!-- Sidebar and Nav -->
<?php include './nav-sidebar.php'; ?>

  
<!-- Main Content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-1 dashboard-title">API Reference</h4>
      <p class="text-muted mb-0">Complete documentation for NSER API endpoints</p>
    </div>
  </div>

  <div class="row g-4">
    <!-- Left Column: Main Content -->
    <div class="col-lg-8">
      <!-- Authentication -->
      <div class="reference-card">
        <h5 class="section-title">Authentication</h5>
        
        <div class="auth-section">
          <h6 class="subsection-title">API Key Authentication</h6>
          <p class="mb-3">Include your API key in the X-API-Key header:</p>
          
          <div class="base-url">
            X-API-Key: YOUR_API_KEY
          </div>
          
          <div class="row mt-4">
            <div class="col-md-6">
              <h6 class="subsection-title">Example (Python):</h6>
              <div class="code-block">
                <button class="copy-btn" onclick="copyCode('python-auth')">
                  <i class="fas fa-copy me-1"></i>Copy
                </button>
                headers = {<span class="code-string">'X-API-Key'</span>: <span class="code-string">'your_api_key'</span>}
              </div>
            </div>
            <div class="col-md-6">
              <h6 class="subsection-title">Example (JavaScript):</h6>
              <div class="code-block">
                <button class="copy-btn" onclick="copyCode('js-auth')">
                  <i class="fas fa-copy me-1"></i>Copy
                </button>
                headers: {<span class="code-string">'X-API-Key'</span>: <span class="code-string">'your_api_key'</span>}
              </div>
            </div>
          </div>
          
          <div class="mt-3">
            <small class="text-muted">
              <i class="fas fa-key me-1"></i>
              Generate API keys from the API Keys section in your dashboard
            </small>
          </div>
        </div>
        
        <div class="mt-4">
          <h6 class="subsection-title">Base URL</h6>
          <div class="base-url">
            https://api.nser.rg/api/v1
          </div>
        </div>
      </div>

      <!-- API Endpoints Overview -->
      <div class="reference-card">
        <h5 class="section-title">API Endpoints</h5>
        
        <div class="endpoint-grid">
          <div class="endpoint-card">
            <div class="endpoint-method">POST</div>
            <div class="endpoint-path">/api/v1/nser/lookup/</div>
            <div class="endpoint-description">
              Check if a single phone number is excluded from gambling
            </div>
          </div>
          
          <div class="endpoint-card">
            <div class="endpoint-method">POST</div>
            <div class="endpoint-path">/api/v1/nser/lookup/bulk/</div>
            <div class="endpoint-description">
              Check multiple numbers at once (max 100 per request)
            </div>
          </div>
          
          <div class="endpoint-card">
            <div class="endpoint-method">POST</div>
            <div class="endpoint-path">/api/v1/nser/lookup/bst/</div>
            <div class="endpoint-description">
              Check exclusion status using Blockchain Secure Token
            </div>
          </div>
        </div>
      </div>

      <!-- Single Lookup Endpoint Details -->
      <div class="reference-card">
        <div class="d-flex align-items-center mb-4">
          <div class="endpoint-method me-3">POST</div>
          <div class="endpoint-path">/api/v1/nser/lookup/</div>
          <div class="ms-3">
            <h6 class="subsection-title mb-0">Check Single Number</h6>
          </div>
        </div>
        
        <div class="mb-4">
          <h6 class="subsection-title">Description</h6>
          <p class="mb-0">Check if a single phone number is excluded from gambling</p>
        </div>
        
        <div class="mb-4">
          <h6 class="subsection-title">Request Parameters</h6>
          <table class="parameter-table">
            <thead>
              <tr>
                <th>Parameter</th>
                <th>Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <span class="fw-bold">phone_number</span>
                  <span class="parameter-required ms-2">REQUIRED</span>
                </td>
                <td>string</td>
                <td>Phone number in E.164 format (e.g., +254712345678)</td>
              </tr>
              <tr>
                <td>
                  <span class="fw-bold">operator_id</span>
                  <span class="parameter-required ms-2">REQUIRED</span>
                </td>
                <td>string</td>
                <td>Your operator ID</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="mb-4">
          <h6 class="subsection-title">Request Example</h6>
          <div class="code-block">
            <button class="copy-btn" onclick="copyCode('request-example')">
              <i class="fas fa-copy me-1"></i>Copy
            </button>
            {<br>
            &nbsp;&nbsp;<span class="code-string">"phone_number"</span>: <span class="code-string">"+254712345678"</span>,<br>
            &nbsp;&nbsp;<span class="code-string">"operator_id"</span>: <span class="code-string">"operator_123"</span><br>
            }
          </div>
        </div>
        
        <div class="mb-4">
          <h6 class="subsection-title">Response Example</h6>
          <div class="code-block">
            <button class="copy-btn" onclick="copyCode('response-example')">
              <i class="fas fa-copy me-1"></i>Copy
            </button>
            {<br>
            &nbsp;&nbsp;<span class="code-string">"success"</span>: <span class="code-key">true</span>,<br>
            &nbsp;&nbsp;<span class="code-string">"data"</span>: {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">"phone_number"</span>: <span class="code-string">"+254712345678"</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">"is_excluded"</span>: <span class="code-key">true</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">"exclusion_type"</span>: <span class="code-string">"SELF"</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">"start_date"</span>: <span class="code-string">"2024-01-15T10:30:00Z"</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">"end_date"</span>: <span class="code-string">"2025-01-15T10:30:00Z"</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">"reason"</span>: <span class="code-string">"User requested self-exclusion"</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">"operator_id"</span>: <span class="code-string">"operator_123"</span><br>
            &nbsp;&nbsp;}<br>
            }
          </div>
        </div>
        
        <div>
          <h6 class="subsection-title">Response Codes</h6>
          <div class="response-codes">
            <div class="response-code">
              <div class="code-number">200</div>
              <div class="code-description">Lookup successful</div>
            </div>
            <div class="response-code">
              <div class="code-number">400</div>
              <div class="code-description">Invalid request parameters</div>
            </div>
            <div class="response-code">
              <div class="code-number">401</div>
              <div class="code-description">Authentication failed</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Right Column : Best Practices & Rate Limiting -->
    <div class="col-lg-4">
      <!-- Best Practices -->
      <div class="reference-card">
        <h5 class="section-title">Best Practices</h5>
        
        <div class="best-practices-grid">
          <div class="practice-item">
            <i class="fas fa-check practice-icon check"></i>
            <div class="practice-text">Always implement proper error handling and retry logic</div>
          </div>
          
          <div class="practice-item">
            <i class="fas fa-check practice-icon check"></i>
            <div class="practice-text">Cache lookup results for 5 minutes maximum</div>
          </div>
          
          <div class="practice-item">
            <i class="fas fa-check practice-icon check"></i>
            <div class="practice-text">Target response time: &lt;50ms for optimal UX</div>
          </div>
          
          <div class="practice-item">
            <i class="fas fa-check practice-icon check"></i>
            <div class="practice-text">Use webhooks for real-time exclusion updates</div>
          </div>
          
          <div class="practice-item">
            <i class="fas fa-check practice-icon check"></i>
            <div class="practice-text">Never store exclusion data beyond required retention period</div>
          </div>
          
          <div class="practice-item">
            <i class="fas fa-times practice-icon cross"></i>
            <div class="practice-text">Do not expose API keys in client-side code</div>
          </div>
          
          <div class="practice-item">
            <i class="fas fa-times practice-icon cross"></i>
            <div class="practice-text">Do not skip exclusion checks or retry limits</div>
          </div>
        </div>
      </div>
      
      <!-- Rate Limiting -->
      <div class="reference-card">
        <h5 class="section-title">Rate Limiting</h5>
        
        <div class="rate-limiting">
          <div class="rate-item">
            <div class="rate-bullet">•</div>
            <div class="rate-details">
              <div class="rate-tier">Standard tier</div>
              <div class="rate-limit">1,000 requests/minute</div>
            </div>
          </div>
          
          <div class="rate-item">
            <div class="rate-bullet">•</div>
            <div class="rate-details">
              <div class="rate-tier">Premium tier</div>
              <div class="rate-limit">10,000 requests/minute</div>
            </div>
          </div>
          
          <div class="rate-item">
            <div class="rate-bullet">•</div>
            <div class="rate-details">
              <div class="rate-tier">Headers</div>
              <div class="rate-limit">X-RateLimit-Limit, X-RateLimit-Remaining</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Additional Resources -->
      <div class="reference-card">
        <h5 class="section-title">Additional Resources</h5>
        
        <div class="resource-links">
          <a href="integration-guide.php" class="d-block p-3 mb-2 bg-light rounded text-decoration-none">
            <i class="fas fa-book me-2 text-primary"></i>
            <strong>Integration Guide</strong>
            <small class="d-block text-muted mt-1">Step-by-step integration instructions</small>
          </a>
          
          <a href="simulator.php" class="d-block p-3 mb-2 bg-light rounded text-decoration-none">
            <i class="fas fa-flask me-2 text-primary"></i>
            <strong>API Simulator</strong>
            <small class="d-block text-muted mt-1">Test API calls before implementation</small>
          </a>
          
          <a href="webhooks.php" class="d-block p-3 bg-light rounded text-decoration-none">
            <i class="fas fa-bell me-2 text-primary"></i>
            <strong>Webhooks</strong>
            <small class="d-block text-muted mt-1">Real-time exclusion notifications</small>
          </a>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="JS/index.js"></script>

</body>
</html>