<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>API Simulator | NSER Portal</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/simulator.css">

</head>

<body>

<!-- Sidebar and Nav -->
<?php include './nav-sidebar.php'; ?>

  
<!-- Main Content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-1 dashboard-title">API Simulator</h4>
      <p class="text-muted mb-0">Test exclusion lookup integration before going live</p>
    </div>
  </div>

  <div class="row g-4">
    <!-- Left Column: Test Interface -->
    <div class="col-lg-8">
      <div class="simulator-card">
        <div class="api-key-status">
          <i class="fas fa-check-circle"></i>
          <span>API Key Loaded</span>
          <span class="ms-2">Using: pk_live_iO...LjdwY</span>
        </div>
        
        <h5 class="section-title">Test Parameters</h5>
        
        <div class="test-parameters">
          <div class="parameter-group">
            <div class="parameter-label">
              <i class="fas fa-phone me-2 text-primary"></i>Phone Number
            </div>
            <input type="text" class="form-control form-control-custom" placeholder="+254712345678" id="phoneNumber" value="+254712345678">
            <div class="parameter-hint">E.164 format</div>
          </div>
          
          <div class="parameter-group">
            <div class="parameter-label">
              <i class="fas fa-id-card me-2 text-primary"></i>National ID
            </div>
            <input type="text" class="form-control form-control-custom" placeholder="12345678" id="nationalId" value="12345678">
            <div class="parameter-hint">ID/Passport number</div>
          </div>
          
          <div class="parameter-group">
            <div class="parameter-label">
              <i class="fas fa-envelope me-2 text-primary"></i>Email Address
            </div>
            <input type="email" class="form-control form-control-custom" placeholder="user@example.com" id="email" value="user@example.com">
            <div class="parameter-hint">Valid email address</div>
          </div>
          
          <div class="parameter-group">
            <div class="parameter-label">
              <i class="fas fa-link me-2 text-primary"></i>BST Token (Optional)
            </div>
            <input type="text" class="form-control form-control-custom" placeholder="Blockchain Secure Token" id="bstToken">
            <div class="parameter-hint">Blockchain Secure Token</div>
          </div>
          
          <button class="run-test-btn" id="runTestBtn">
            <i class="fas fa-play me-2"></i>Run Test
          </button>
        </div>
        
        <!-- Test Results -->
        <div class="response-section">
          <h6 class="subsection-title">Test Response</h6>
          <div class="response-placeholder" id="testResponse">
            No test run yet. Click "Run Test" to see the API response.
          </div>
        </div>

        <!-- API Guidelines -->
        <div class="mt-5">
          <h5 class="section-title">API Guidelines</h5>
          <div class="guidelines-grid">
            <div class="guideline-card">
              <div class="guideline-title">Endpoint & Authentication</div>
              <div class="guideline-content">
                <strong>Endpoint:</strong> https://api-bematore.onrender.com/api/v1/nser/lookup/<br>
                <strong>Method:</strong> POST<br>
                <strong>Authentication:</strong> X-API-Key header<br>
                <strong>Operator ID:</strong> b8d32313-44d5-43b9-a079-7cdf911344f7
              </div>
            </div>
            
            <div class="guideline-card">
              <div class="guideline-title">Required Parameters</div>
              <ul class="guideline-list">
                <li><strong>operator_id</strong> (UUID format)</li>
                <li>Plus at least ONE identifier:</li>
                <li>- phone_number (E.164 format)</li>
                <li>- national_id (ID/Passport)</li>
                <li>- email (valid format)</li>
                <li>- bst_token (Blockchain token)</li>
              </ul>
            </div>
            
            <div class="guideline-card">
              <div class="guideline-title">Performance & Caching</div>
              <div class="guideline-content">
                <strong>Response Time:</strong> &lt;100ms target<br>
                <strong>Caching:</strong> 1 minute per identifier<br>
                <strong>Audit:</strong> All requests logged<br>
                <strong>Compliance:</strong> Full audit trail maintained
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Right Column: Documentation -->
    <div class="col-lg-4">
      <!-- Integration Examples -->
      <div class="simulator-card">
        <h5 class="section-title">Integration Examples</h5>
        
        <div class="code-tabs">
          <button class="code-tab active" onclick="showCodeTab('curl')">Curl</button>
          <button class="code-tab" onclick="showCodeTab('python')">Python</button>
          <button class="code-tab" onclick="showCodeTab('javascript')">Javascript</button>
        </div>
        
        <div class="code-example" id="curl-example">
          <div class="code-block">
            <button class="copy-btn" onclick="copyCode('curl')">
              <i class="fas fa-copy me-1"></i>Copy
            </button>
            <span class="code-comment"># Get your API key from: Dashboard → API Keys</span><br>
            <span class="code-comment"># Operator ID: b8d32313-44d5-43b9-a079-7cdf911344f7</span><br>
            <span class="code-comment"># Required: At least one of phone_number, national_id, email, or bst_token</span><br>
            <br>
            curl -X POST https://api-bematore.onrender.com/api/v1/nser/lookup/ \<br>
            &nbsp;&nbsp;-H "X-API-Key: $API_KEY" \<br>
            &nbsp;&nbsp;-H "Content-Type: application/json" \<br>
            &nbsp;&nbsp;-d '{<br>
            &nbsp;&nbsp;&nbsp;&nbsp;"operator_id": <span class="code-string">"b8d32313-44d5-43b9-a079-7cdf911344f7"</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;"phone_number": <span class="code-string">"+254712345678"</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;"national_id": <span class="code-string">"12345678"</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;"email": <span class="code-string">"user@example.com"</span><br>
            &nbsp;&nbsp;}'<br>
          </div>
        </div>
        
        <div class="code-example d-none" id="python-example">
          <div class="code-block">
            <button class="copy-btn" onclick="copyCode('python')">
              <i class="fas fa-copy me-1"></i>Copy
            </button>
            <span class="code-comment"># Get your API key from: Dashboard → API Keys</span><br>
            <span class="code-comment"># Operator ID: b8d32313-44d5-43b9-a079-7cdf911344f7</span><br>
            <br>
            <span class="code-key">import</span> requests<br>
            <br>
            url = <span class="code-string">"https://api-bematore.onrender.com/api/v1/nser/lookup/"</span><br>
            api_key = <span class="code-string">"YOUR_API_KEY"</span><br>
            <br>
            headers = {<br>
            &nbsp;&nbsp;<span class="code-string">"X-API-Key"</span>: api_key,<br>
            &nbsp;&nbsp;<span class="code-string">"Content-Type"</span>: <span class="code-string">"application/json"</span><br>
            }<br>
            <br>
            data = {<br>
            &nbsp;&nbsp;<span class="code-string">"operator_id"</span>: <span class="code-string">"b8d32313-44d5-43b9-a079-7cdf911344f7"</span>,<br>
            &nbsp;&nbsp;<span class="code-string">"phone_number"</span>: <span class="code-string">"+254712345678"</span>,<br>
            &nbsp;&nbsp;<span class="code-string">"national_id"</span>: <span class="code-string">"12345678"</span>,<br>
            &nbsp;&nbsp;<span class="code-string">"email"</span>: <span class="code-string">"user@example.com"</span><br>
            }<br>
            <br>
            response = requests.post(url, headers=headers, json=data)<br>
            print(response.json())<br>
          </div>
        </div>
        
        <div class="code-example d-none" id="javascript-example">
          <div class="code-block">
            <button class="copy-btn" onclick="copyCode('javascript')">
              <i class="fas fa-copy me-1"></i>Copy
            </button>
            <span class="code-comment">// Get your API key from: Dashboard → API Keys</span><br>
            <span class="code-comment">// Operator ID: b8d32313-44d5-43b9-a079-7cdf911344f7</span><br>
            <br>
            <span class="code-key">const</span> apiKey = <span class="code-string">'YOUR_API_KEY'</span>;<br>
            <span class="code-key">const</span> url = <span class="code-string">'https://api-bematore.onrender.com/api/v1/nser/lookup/'</span>;<br>
            <br>
            <span class="code-key">const</span> data = {<br>
            &nbsp;&nbsp;operator_id: <span class="code-string">'b8d32313-44d5-43b9-a079-7cdf911344f7'</span>,<br>
            &nbsp;&nbsp;phone_number: <span class="code-string">'+254712345678'</span>,<br>
            &nbsp;&nbsp;national_id: <span class="code-string">'12345678'</span>,<br>
            &nbsp;&nbsp;email: <span class="code-string">'user@example.com'</span><br>
            };<br>
            <br>
            <span class="code-key">const</span> response = <span class="code-key">await</span> fetch(url, {<br>
            &nbsp;&nbsp;method: <span class="code-string">'POST'</span>,<br>
            &nbsp;&nbsp;headers: {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'X-API-Key'</span>: apiKey,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'Content-Type'</span>: <span class="code-string">'application/json'</span><br>
            &nbsp;&nbsp;},<br>
            &nbsp;&nbsp;body: JSON.stringify(data)<br>
            });<br>
            <br>
            <span class="code-key">const</span> result = <span class="code-key">await</span> response.json();<br>
            console.log(result);<br>
          </div>
        </div>
      </div>
      
      <!-- Security Best Practices -->
      <div class="simulator-card">
        <h5 class="section-title">Security Best Practices</h5>
        <div class="security-grid">
          <div class="security-item">
            <i class="fas fa-lock security-icon"></i>
            <div class="security-text">Store API keys in environment variables</div>
          </div>
          <div class="security-item">
            <i class="fas fa-server security-icon"></i>
            <div class="security-text">Use backend proxy for browser integrations</div>
          </div>
          <div class="security-item">
            <i class="fas fa-redo security-icon"></i>
            <div class="security-text">Rotate API keys regularly</div>
          </div>
          <div class="security-item">
            <i class="fas fa-shield-alt security-icon"></i>
            <div class="security-text">Always use HTTPS for API requests</div>
          </div>
          <div class="security-item">
            <i class="fas fa-clock security-icon"></i>
            <div class="security-text">Implement request timeouts (10-30s)</div>
          </div>
          <div class="security-item">
            <i class="fas fa-chart-line security-icon"></i>
            <div class="security-text">Monitor API responses for errors</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="JS/index.js"></script>

</body>
</html>