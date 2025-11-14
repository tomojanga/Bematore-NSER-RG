<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Integration Guide | NSER Portal</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/integration-guide.css">

</head>

<body>

<!-- Sidebar and Nav -->
<?php include './nav-sidebar.php'; ?>

  
<!-- Main Content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-1 dashboard-title">Integration Guide</h4>
      <p class="text-muted mb-0">Integrate NSER exclusion checks into your platform</p>
    </div>
  </div>

  <div class="row g-4">
    <!-- Left Column; Main Content -->
    <div class="col-lg-8">
      <!-- Quick Start -->
      <div class="guide-card">
        <h5 class="section-title">Quick Start</h5>
        
        <div class="quick-start-steps">
          <div class="step-card">
            <div class="step-number">1</div>
            <div class="step-icon">
              <i class="fas fa-key"></i>
            </div>
            <div class="step-title">Get API Keys</div>
            <div class="step-description">
              Generate production and sandbox API keys from the API Keys page
            </div>
          </div>
          
          <div class="step-card">
            <div class="step-number">2</div>
            <div class="step-icon">
              <i class="fas fa-code"></i>
            </div>
            <div class="step-title">Implement Lookup</div>
            <div class="step-description">
              Add exclusion checks before allowing users to gamble
            </div>
          </div>
          
          <div class="step-card">
            <div class="step-number">3</div>
            <div class="step-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="step-title">Handle Response</div>
            <div class="step-description">
              Block excluded users and show appropriate messaging
            </div>
          </div>
        </div>
      </div>

      <!-- Code Examples -->
      <div class="guide-card">
        <h5 class="section-title">Code Examples</h5>
        
        <div class="code-tabs">
          <button class="code-tab active" onclick="showCodeTab('javascript')">JavaScript</button>
          <button class="code-tab" onclick="showCodeTab('python')">Python</button>
          <button class="code-tab" onclick="showCodeTab('php')">PHP</button>
          <button class="code-tab" onclick="showCodeTab('java')">Java</button>
        </div>
        
        <div class="code-example" id="javascript-example">
          <div class="language-badge">JavaScript</div>
          <div class="code-block">
            <button class="copy-btn" onclick="copyCode('javascript')">
              <i class="fas fa-copy me-1"></i>Copy
            </button>
            <span class="code-comment">// Install axios</span><br>
            <span class="code-comment">// npm install axios</span><br>
            <br>
            <span class="code-key">const</span> axios = <span class="code-key">require</span>(<span class="code-string">'axios'</span>);<br>
            <br>
            <span class="code-key">const</span> API_KEY = <span class="code-string">'your_api_key_here'</span>;<br>
            <span class="code-key">const</span> API_URL = <span class="code-string">'http://127.0.0.1:8000/api/v1'</span>;<br>
            <br>
            <span class="code-key">async function</span> checkExclusion(phoneNumber) {<br>
            &nbsp;&nbsp;<span class="code-key">try</span> {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">const</span> response = <span class="code-key">await</span> axios.post(<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">`${API_URL}/nser/lookup/`</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;phone_number: phoneNumber,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;operator_id: <span class="code-string">'your_operator_id'</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;},<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;headers: {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'Authorization'</span>: <span class="code-string">`Bearer ${API_KEY}`</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'Content-Type'</span>: <span class="code-string">'application/json'</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
            &nbsp;&nbsp;&nbsp;&nbsp;);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">if</span> (response.data.is_excluded) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;console.log(<span class="code-string">'User is EXCLUDED'</span>);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;console.log(<span class="code-string">'Exclusion ends:'</span>, response.data.end_date);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">false</span>; <span class="code-comment">// Block user</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;}<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">true</span>; <span class="code-comment">// Allow user</span><br>
            &nbsp;&nbsp;} <span class="code-key">catch</span> (error) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;console.error(<span class="code-string">'Lookup failed:'</span>, error);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">false</span>; <span class="code-comment">// Fail-safe: block on error</span><br>
            &nbsp;&nbsp;}<br>
            }<br>
            <br>
            <span class="code-comment">// Usage</span><br>
            checkExclusion(<span class="code-string">'+254712345678'</span>).then(allowed => {<br>
            &nbsp;&nbsp;<span class="code-key">if</span> (allowed) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;console.log(<span class="code-string">'User can proceed'</span>);<br>
            &nbsp;&nbsp;} <span class="code-key">else</span> {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;console.log(<span class="code-string">'User is blocked'</span>);<br>
            &nbsp;&nbsp;}<br>
            });<br>
          </div>
        </div>
        
        <div class="code-example d-none" id="python-example">
          <div class="language-badge">Python</div>
          <div class="code-block">
            <button class="copy-btn" onclick="copyCode('python')">
              <i class="fas fa-copy me-1"></i>Copy
            </button>
            <span class="code-comment"># Install requests</span><br>
            <span class="code-comment"># pip install requests</span><br>
            <br>
            <span class="code-key">import</span> requests<br>
            <br>
            API_KEY = <span class="code-string">'your_api_key_here'</span><br>
            API_URL = <span class="code-string">'http://127.0.0.1:8000/api/v1'</span><br>
            <br>
            <span class="code-key">def</span> check_exclusion(phone_number):<br>
            &nbsp;&nbsp;<span class="code-key">try</span>:<br>
            &nbsp;&nbsp;&nbsp;&nbsp;headers = {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'Authorization'</span>: <span class="code-string">f'Bearer {API_KEY}'</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'Content-Type'</span>: <span class="code-string">'application/json'</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;}<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;data = {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'phone_number'</span>: phone_number,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'operator_id'</span>: <span class="code-string">'your_operator_id'</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;}<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;response = requests.post(<span class="code-string">f'{API_URL}/nser/lookup/'</span>, <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;headers=headers, <br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;json=data)<br>
            &nbsp;&nbsp;&nbsp;&nbsp;response.raise_for_status()<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;result = response.json()<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">if</span> result.get(<span class="code-string">'is_excluded'</span>):<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;print(<span class="code-string">'User is EXCLUDED'</span>)<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;print(<span class="code-string">'Exclusion ends:'</span>, result.get(<span class="code-string">'end_date'</span>))<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">False</span>  <span class="code-comment"># Block user</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">True</span>  <span class="code-comment"># Allow user</span><br>
            &nbsp;&nbsp;<br>
            &nbsp;&nbsp;<span class="code-key">except</span> Exception <span class="code-key">as</span> e:<br>
            &nbsp;&nbsp;&nbsp;&nbsp;print(<span class="code-string">'Lookup failed:'</span>, e)<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">False</span>  <span class="code-comment"># Fail-safe: block on error</span><br>
            <br>
            <span class="code-comment"># Usage</span><br>
            allowed = check_exclusion(<span class="code-string">'+254712345678'</span>)<br>
            <span class="code-key">if</span> allowed:<br>
            &nbsp;&nbsp;print(<span class="code-string">'User can proceed'</span>)<br>
            <span class="code-key">else</span>:<br>
            &nbsp;&nbsp;print(<span class="code-string">'User is blocked'</span>)<br>
          </div>
        </div>
        
        <div class="code-example d-none" id="php-example">
          <div class="language-badge">PHP</div>
          <div class="code-block">
            <button class="copy-btn" onclick="copyCode('php')">
              <i class="fas fa-copy me-1"></i>Copy
            </button>
            <span class="code-comment">// Using cURL</span><br>
            <br>
            <span class="code-key">function</span> checkExclusion(<span class="code-key">$phoneNumber</span>) {<br>
            &nbsp;&nbsp;<span class="code-key">$apiKey</span> = <span class="code-string">'your_api_key_here'</span>;<br>
            &nbsp;&nbsp;<span class="code-key">$apiUrl</span> = <span class="code-string">'http://127.0.0.1:8000/api/v1/nser/lookup/'</span>;<br>
            &nbsp;&nbsp;<br>
            &nbsp;&nbsp;<span class="code-key">$data</span> = [<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'phone_number'</span> => <span class="code-key">$phoneNumber</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'operator_id'</span> => <span class="code-string">'your_operator_id'</span><br>
            &nbsp;&nbsp;];<br>
            &nbsp;&nbsp;<br>
            &nbsp;&nbsp;<span class="code-key">$ch</span> = curl_init();<br>
            &nbsp;&nbsp;curl_setopt(<span class="code-key">$ch</span>, CURLOPT_URL, <span class="code-key">$apiUrl</span>);<br>
            &nbsp;&nbsp;curl_setopt(<span class="code-key">$ch</span>, CURLOPT_POST, <span class="code-key">true</span>);<br>
            &nbsp;&nbsp;curl_setopt(<span class="code-key">$ch</span>, CURLOPT_POSTFIELDS, json_encode(<span class="code-key">$data</span>));<br>
            &nbsp;&nbsp;curl_setopt(<span class="code-key">$ch</span>, CURLOPT_HTTPHEADER, [<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'Authorization: Bearer '</span> . <span class="code-key">$apiKey</span>,<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-string">'Content-Type: application/json'</span><br>
            &nbsp;&nbsp;]);<br>
            &nbsp;&nbsp;curl_setopt(<span class="code-key">$ch</span>, CURLOPT_RETURNTRANSFER, <span class="code-key">true</span>);<br>
            &nbsp;&nbsp;<br>
            &nbsp;&nbsp;<span class="code-key">$response</span> = curl_exec(<span class="code-key">$ch</span>);<br>
            &nbsp;&nbsp;<span class="code-key">$httpCode</span> = curl_getinfo(<span class="code-key">$ch</span>, CURLINFO_HTTP_CODE);<br>
            &nbsp;&nbsp;curl_close(<span class="code-key">$ch</span>);<br>
            &nbsp;&nbsp;<br>
            &nbsp;&nbsp;<span class="code-key">if</span> (<span class="code-key">$httpCode</span> === 200) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">$result</span> = json_decode(<span class="code-key">$response</span>, <span class="code-key">true</span>);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">if</span> (<span class="code-key">$result</span>[<span class="code-string">'is_excluded'</span>] ?? <span class="code-key">false</span>) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;echo <span class="code-string">'User is EXCLUDED'</span> . PHP_EOL;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;echo <span class="code-string">'Exclusion ends: '</span> . (<span class="code-key">$result</span>[<span class="code-string">'end_date'</span>] ?? <span class="code-string">'N/A'</span>) . PHP_EOL;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">false</span>; <span class="code-comment">// Block user</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;}<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">true</span>; <span class="code-comment">// Allow user</span><br>
            &nbsp;&nbsp;} <span class="code-key">else</span> {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;echo <span class="code-string">'Lookup failed. HTTP Code: '</span> . <span class="code-key">$httpCode</span> . PHP_EOL;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">false</span>; <span class="code-comment">// Fail-safe: block on error</span><br>
            &nbsp;&nbsp;}<br>
            }<br>
            <br>
            <span class="code-comment">// Usage</span><br>
            <span class="code-key">$allowed</span> = checkExclusion(<span class="code-string">'+254712345678'</span>);<br>
            <span class="code-key">if</span> (<span class="code-key">$allowed</span>) {<br>
            &nbsp;&nbsp;echo <span class="code-string">'User can proceed'</span> . PHP_EOL;<br>
            } <span class="code-key">else</span> {<br>
            &nbsp;&nbsp;echo <span class="code-string">'User is blocked'</span> . PHP_EOL;<br>
            }<br>
          </div>
        </div>
        
        <div class="code-example d-none" id="java-example">
          <div class="language-badge">Java</div>
          <div class="code-block">
            <button class="copy-btn" onclick="copyCode('java')">
              <i class="fas fa-copy me-1"></i>Copy
            </button>
            <span class="code-comment">// Using HttpURLConnection</span><br>
            <br>
            <span class="code-key">import</span> java.io.*;<br>
            <span class="code-key">import</span> java.net.*;<br>
            <span class="code-key">import</span> org.json.*;<br>
            <br>
            <span class="code-key">public class</span> NSERIntegration {<br>
            &nbsp;&nbsp;<span class="code-key">private static final String</span> API_KEY = <span class="code-string">"your_api_key_here"</span>;<br>
            &nbsp;&nbsp;<span class="code-key">private static final String</span> API_URL = <span class="code-string">"http://127.0.0.1:8000/api/v1/nser/lookup/"</span>;<br>
            &nbsp;&nbsp;<br>
            &nbsp;&nbsp;<span class="code-key">public static boolean</span> checkExclusion(String phoneNumber) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">try</span> {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;URL url = <span class="code-key">new</span> URL(API_URL);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;HttpURLConnection conn = (HttpURLConnection) url.openConnection();<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;conn.setRequestMethod(<span class="code-string">"POST"</span>);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;conn.setRequestProperty(<span class="code-string">"Authorization"</span>, <span class="code-string">"Bearer "</span> + API_KEY);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;conn.setRequestProperty(<span class="code-string">"Content-Type"</span>, <span class="code-string">"application/json"</span>);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;conn.setDoOutput(<span class="code-key">true</span>);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSONObject data = <span class="code-key">new</span> JSONObject();<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;data.put(<span class="code-string">"phone_number"</span>, phoneNumber);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;data.put(<span class="code-string">"operator_id"</span>, <span class="code-string">"your_operator_id"</span>);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;OutputStream os = conn.getOutputStream();<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.write(data.toString().getBytes());<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;os.flush();<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">int</span> responseCode = conn.getResponseCode();<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">if</span> (responseCode == HttpURLConnection.HTTP_OK) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;BufferedReader in = <span class="code-key">new</span> BufferedReader(<span class="code-key">new</span> InputStreamReader(conn.getInputStream()));<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;String inputLine;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;StringBuilder response = <span class="code-key">new</span> StringBuilder();<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">while</span> ((inputLine = in.readLine()) != <span class="code-key">null</span>) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;response.append(inputLine);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;in.close();<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;JSONObject result = <span class="code-key">new</span> JSONObject(response.toString());<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">if</span> (result.getBoolean(<span class="code-string">"is_excluded"</span>)) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span class="code-string">"User is EXCLUDED"</span>);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span class="code-string">"Exclusion ends: "</span> + result.getString(<span class="code-string">"end_date"</span>));<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">false</span>; <span class="code-comment">// Block user</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">true</span>; <span class="code-comment">// Allow user</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;} <span class="code-key">else</span> {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span class="code-string">"Lookup failed. HTTP Code: "</span> + responseCode);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">false</span>; <span class="code-comment">// Fail-safe: block on error</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}<br>
            &nbsp;&nbsp;&nbsp;&nbsp;} <span class="code-key">catch</span> (Exception e) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span class="code-string">"Lookup failed: "</span> + e.getMessage());<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">return</span> <span class="code-key">false</span>; <span class="code-comment">// Fail-safe: block on error</span><br>
            &nbsp;&nbsp;&nbsp;&nbsp;}<br>
            &nbsp;&nbsp;}<br>
            &nbsp;&nbsp;<br>
            &nbsp;&nbsp;<span class="code-key">public static void</span> main(String[] args) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">boolean</span> allowed = checkExclusion(<span class="code-string">"+254712345678"</span>);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;<span class="code-key">if</span> (allowed) {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span class="code-string">"User can proceed"</span>);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;} <span class="code-key">else</span> {<br>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span class="code-string">"User is blocked"</span>);<br>
            &nbsp;&nbsp;&nbsp;&nbsp;}<br>
            &nbsp;&nbsp;}<br>
            }<br>
          </div>
        </div>
      </div>

      <!-- API Endpoints -->
      <div class="guide-card">
        <h5 class="section-title">API Endpoints</h5>
        
        <div class="endpoints-grid">
          <div class="endpoint-card">
            <div class="endpoint-method">POST</div>
            <div class="endpoint-path">/api/v1/nser/lookup/</div>
            <div class="endpoint-description">
              Check if a user is excluded using phone number, national ID, email, or BST token
            </div>
          </div>
          
          <div class="endpoint-card">
            <div class="endpoint-method">POST</div>
            <div class="endpoint-path">/api/v1/nser/lookup/bulk/</div>
            <div class="endpoint-description">
              Check multiple users at once (maximum 100 per request)
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

      <!-- Important Notes -->
      <div class="important-notes">
        <div class="d-flex align-items-center mb-3">
          <i class="fas fa-exclamation-triangle text-warning me-2 fs-5"></i>
          <h6 class="subsection-title mb-0">Important Notes</h6>
        </div>
        <ul class="notes-list">
          <li>Always implement fail-safe logic: block users if lookup fails</li>
          <li>Cache exclusion status for 5 minutes maximum</li>
          <li>Target response time: &lt;50ms for lookups</li>
          <li>Use webhooks for real-time exclusion updates</li>
          <li>Never store exclusion data permanently</li>
        </ul>
      </div>
    </div>
    
    <!-- Right Column:  Additional Resources -->
    <div class="col-lg-4">
      <!-- Additional Resources -->
      <div class="guide-card">
        <h5 class="section-title">Additional Resources</h5>
        
        <div class="resource-links">
          <a href="api-reference.php" class="d-block p-3 mb-2 bg-light rounded text-decoration-none">
            <i class="fas fa-book me-2 text-primary"></i>
            <strong>API Reference</strong>
            <small class="d-block text-muted mt-1">Complete API documentation with all parameters</small>
          </a>
          
          <a href="simulator.php" class="d-block p-3 mb-2 bg-light rounded text-decoration-none">
            <i class="fas fa-flask me-2 text-primary"></i>
            <strong>API Simulator</strong>
            <small class="d-block text-muted mt-1">Test your integration before going live</small>
          </a>
          
          <a href="webhooks.php" class="d-block p-3 mb-2 bg-light rounded text-decoration-none">
            <i class="fas fa-bell me-2 text-primary"></i>
            <strong>Webhooks Guide</strong>
            <small class="d-block text-muted mt-1">Set up real-time exclusion notifications</small>
          </a>
          
          <a href="api-keys.php" class="d-block p-3 bg-light rounded text-decoration-none">
            <i class="fas fa-key me-2 text-primary"></i>
            <strong>API Keys Management</strong>
            <small class="d-block text-muted mt-1">Generate and manage your API keys</small>
          </a>
        </div>
      </div>
      
      <!-- Best Practices -->
      <div class="guide-card">
        <h5 class="section-title">Best Practices</h5>
        
        <div class="best-practices">
          <div class="d-flex align-items-start mb-3">
            <i class="fas fa-shield-alt text-primary me-3 mt-1"></i>
            <div>
              <strong>Security First</strong>
              <div class="small text-muted">Always use HTTPS and never expose API keys in client-side code</div>
            </div>
          </div>
          
          <div class="d-flex align-items-start mb-3">
            <i class="fas fa-tachometer-alt text-primary me-3 mt-1"></i>
            <div>
              <strong>Performance</strong>
              <div class="small text-muted">Implement proper caching and timeout handling</div>
            </div>
          </div>
          
          <div class="d-flex align-items-start mb-3">
            <i class="fas fa-user-slash text-primary me-3 mt-1"></i>
            <div>
              <strong>User Experience</strong>
              <div class="small text-muted">Show clear messaging when users are excluded</div>
            </div>
          </div>
          
          <div class="d-flex align-items-start">
            <i class="fas fa-clipboard-check text-primary me-3 mt-1"></i>
            <div>
              <strong>Compliance</strong>
              <div class="small text-muted">Maintain audit logs and follow regulatory requirements</div>
            </div>
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