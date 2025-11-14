<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>API Keys | NSER Portal</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/api-keys.css">

</head>

<body>

<!-- Sidebar and Nav -->
<?php include './nav-sidebar.php'; ?>

  
<!-- Main Content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-1 dashboard-title">API Keys</h4>
      <p class="text-muted mb-0">Manage your API keys for NSER integration</p>
    </div>
    <button class="btn dashboard-btn-primary">
      <i class="fas fa-plus me-1"></i> Create New Key
    </button>
  </div>

  <div class="row g-4">
    <!-- Left Column:  API Keys -->
    <div class="col-lg-8">
      <!-- Create API Key Section -->
      <div class="api-key-card create-key-section">
        <h5 class="section-title">Create API Key</h5>
        
        <div class="mb-3">
          <label class="form-label fw-semibold">Your Operator ID</label>
          <div class="operator-id-box">
            <div class="operator-id">b8d32313-44d5-43b9-a079-7cdf911344f7</div>
          </div>
          <div class="form-text">Required when making API requests to the lookup endpoint</div>
        </div>
        
        <button class="create-key-btn">
          <i class="fas fa-key me-2"></i>Generate New API Key
        </button>
      </div>

      <!-- Existing API Keys -->
      <div class="api-key-card">
        <h5 class="section-title">Your API Keys</h5>
        
        <!-- API Key Item -->
        <div class="api-key-item">
          <div class="key-header">
            <div>
              <div class="key-name">test</div>
              <div class="key-id">ID: dd222a09...</div>
            </div>
            <div class="key-status">
              <span class="status-badge status-expiring">Expiring Soon</span>
            </div>
          </div>
          
          <div class="key-value">••••••••••••••••••••••••••••••••</div>
          
          <div class="key-details">
            <div class="detail-item">
              <div class="detail-label">Created</div>
              <div class="detail-value">12/11/2025</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Expires</div>
              <div class="detail-value">12/12/2025</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Days Left</div>
              <div class="detail-value">29 days</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Last Used</div>
              <div class="detail-value">Never</div>
            </div>
          </div>
          
          <div class="key-actions">
            <button class="btn-key-action btn-rotate">
              <i class="fas fa-redo me-1"></i>Rotate
            </button>
            <button class="btn-key-action btn-revoke">
              <i class="fas fa-trash me-1"></i>Revoke
            </button>
          </div>
        </div>
        
        <!-- Additional keys -->
        <div class="text-center py-4">
          <i class="fas fa-key fa-2x text-muted mb-3"></i>
          <p class="text-muted mb-0">No additional API keys found</p>
        </div>
      </div>
    </div>
    
    <!-- Right Column: Usage Guide -->
    <div class="col-lg-4">
      <div class="usage-guide">
        <h5 class="section-title">API Key Usage Guide</h5>
        
        <div class="guide-item">
          <div class="guide-icon">
            <i class="fas fa-code"></i>
          </div>
          <div class="guide-content">
            <div class="guide-title">Authorization Header</div>
            <div class="guide-description">
              Use your API key in the Authorization header:
              <div class="code-block">Authorization: Bearer YOUR_API_KEY</div>
            </div>
          </div>
        </div>
        
        <div class="guide-item">
          <div class="guide-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="guide-content">
            <div class="guide-title">Keep Keys Secure</div>
            <div class="guide-description">
              Keep your API keys secure and never commit them to version control
            </div>
          </div>
        </div>
        
        <div class="guide-item">
          <div class="guide-icon">
            <i class="fas fa-sync"></i>
          </div>
          <div class="guide-content">
            <div class="guide-title">Rotate Regularly</div>
            <div class="guide-description">
              Rotate keys periodically for enhanced security
            </div>
          </div>
        </div>
        
        <div class="guide-item">
          <div class="guide-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <div class="guide-content">
            <div class="guide-title">Rate Limits</div>
            <div class="guide-description">
              Each key has rate limits to protect the service
            </div>
          </div>
        </div>
        
        <div class="guide-item">
          <div class="guide-icon">
            <i class="fas fa-eye"></i>
          </div>
          <div class="guide-content">
            <div class="guide-title">Monitor Usage</div>
            <div class="guide-description">
              Monitor the "Last Used" timestamp to identify unused keys
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