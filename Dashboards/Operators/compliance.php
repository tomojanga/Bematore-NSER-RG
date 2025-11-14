<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Compliance | NSER Portal</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/compliance.css">

</head>

<body>

<!-- Sidebar and Nav -->
<?php include './nav-sidebar.php'; ?>

  
<!-- Main Content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="header-section">
    <div>
      <h4 class="fw-bold mb-1 dashboard-title">Compliance Tracking</h4>
      <p class="text-muted mb-0">Monitor your operational compliance score</p>
    </div>
    <div class="action-buttons">
      <button class="run-check-btn" id="runCheckBtn">
        <i class="fas fa-play me-2"></i>Run Check
      </button>
      <button class="download-btn">
        <i class="fas fa-download me-2"></i>Download
      </button>
    </div>
  </div>

  <div class="row g-4">
    <!-- Left Column: Compliance Score & Metrics -->
    <div class="col-lg-8">
      <!-- Overall Compliance Score -->
      <div class="compliance-card">
        <div class="score-section">
          <svg class="progress-ring" viewBox="0 0 120 120">
            <circle class="progress-bg" cx="60" cy="60" r="52"></circle>
            <circle class="progress-fill" cx="60" cy="60" r="52" stroke-dasharray="0 327"></circle>
          </svg>
          <div class="score-value">0%</div>
          <div class="score-label">Overall Compliance Score</div>
          <div class="score-timestamp">
            <i class="fas fa-clock me-2"></i>Last checked: 14/11/2025
          </div>
        </div>

        <!-- Checks Summary -->
        <div class="checks-grid">
          <div class="check-card">
            <div class="check-value">0</div>
            <div class="check-label">Total Checks</div>
          </div>
          
          <div class="check-card">
            <div class="check-value">0</div>
            <div class="check-label">Passed</div>
          </div>
          
          <div class="check-card">
            <div class="check-value">0</div>
            <div class="check-label">Failed</div>
          </div>
        </div>
      </div>

      <!-- Compliance Metrics -->
      <div class="compliance-card">
        <h5 class="section-title">Compliance Metrics</h5>
        
        <div class="metrics-section">
          <div class="empty-state">
            <i class="fas fa-chart-bar"></i>
            <h6 class="text-muted mt-3">No compliance metrics available</h6>
            <p class="text-muted mb-0">Run a compliance check to see detailed metrics and analysis</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Right Column: Requirements & Actions -->
    <div class="col-lg-4">
      <!-- Compliance Requirements -->
      <div class="compliance-card">
        <h5 class="section-title">Compliance Requirements</h5>
        
        <div class="requirements-section">
          <ul class="requirements-list">
            <li>
              <strong>Maintain a compliance score of at least 90%</strong> for unrestricted access
              <span class="status-badge status-warning ms-2">Current: 0%</span>
            </li>
            <li>
              <strong>API response times must be under 200ms</strong> (P99)
              <span class="status-badge status-success ms-2">Met</span>
            </li>
            <li>
              <strong>Webhook delivery success rate must be at least 99%</strong>
              <span class="status-badge status-success ms-2">Met</span>
            </li>
            <li>
              <strong>Log all API calls and maintain audit trails</strong> for 12 months
              <span class="status-badge status-success ms-2">Active</span>
            </li>
            <li>
              <strong>Complete compliance checks</strong> are recommended quarterly
              <span class="status-badge status-warning ms-2">Due</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Quick Status -->
      <div class="compliance-card">
        <h5 class="section-title">Quick Status</h5>
        
        <div class="status-items">
          <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
            <div>
              <div class="fw-bold">API Compliance</div>
              <small class="text-muted">Response time & uptime</small>
            </div>
            <div class="text-end">
              <span class="status-badge status-success">Passing</span>
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
            <div>
              <div class="fw-bold">Data Retention</div>
              <small class="text-muted">Audit logs & records</small>
            </div>
            <div class="text-end">
              <span class="status-badge status-success">Compliant</span>
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
            <div>
              <div class="fw-bold">Security Standards</div>
              <small class="text-muted">Encryption & access controls</small>
            </div>
            <div class="text-end">
              <span class="status-badge status-success">Verified</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Next Steps -->
      <div class="compliance-card">
        <h5 class="section-title">Next Steps</h5>
        
        <div class="next-steps">
          <div class="d-flex align-items-start mb-3">
            <i class="fas fa-play-circle text-primary me-3 mt-1"></i>
            <div>
              <strong>Run Initial Compliance Check</strong>
              <div class="small text-muted">Start by running your first compliance assessment</div>
            </div>
          </div>
          
          <div class="d-flex align-items-start mb-3">
            <i class="fas fa-chart-line text-primary me-3 mt-1"></i>
            <div>
              <strong>Review Metrics</strong>
              <div class="small text-muted">Analyze compliance scores and areas for improvement</div>
            </div>
          </div>
          
          <div class="d-flex align-items-start">
            <i class="fas fa-cog text-primary me-3 mt-1"></i>
            <div>
              <strong>Configure Monitoring</strong>
              <div class="small text-muted">Set up ongoing compliance monitoring</div>
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