<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Statistics | NSER Portal</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/statistics.css">

</head>

<body>

<!-- Sidebar and Nav -->
<?php include './nav-sidebar.php'; ?>

  
<!-- Main Content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="header-section">
    <div>
      <h4 class="fw-bold mb-1 dashboard-title">Statistics</h4>
      <p class="text-muted mb-0">Your operator performance metrics and analytics</p>
    </div>
    <div class="d-flex align-items-center gap-3">
      <div class="time-filter">
        <i class="fas fa-calendar me-2"></i>Last 30 days
      </div>
      <button class="export-btn">
        <i class="fas fa-download me-2"></i>Export CSV
      </button>
    </div>
  </div>

  <div class="row g-4">
    <!-- Left Column: Main Metrics -->
    <div class="col-lg-8">
      <!-- Key Metrics -->
      <div class="stats-card">
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-search"></i>
            </div>
            <div class="metric-value">0</div>
            <div class="metric-label">Total Lookups</div>
            <div class="metric-subtext">0 today</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-tachometer-alt"></i>
            </div>
            <div class="metric-value">0ms</div>
            <div class="metric-label">Avg Response Time</div>
            <div class="metric-subtext">P99: 0ms</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="metric-value">0.00%</div>
            <div class="metric-label">Success Rate</div>
            <div class="metric-subtext">Uptime</div>
          </div>
          
          <div class="metric-card">
            <div class="metric-icon">
              <i class="fas fa-user-slash"></i>
            </div>
            <div class="metric-value">0</div>
            <div class="metric-label">Exclusions Found</div>
            <div class="metric-subtext">This month</div>
          </div>
        </div>

        <!-- Chart Placeholder -->
        <div class="chart-placeholder">
          <i class="fas fa-chart-bar"></i>
          <h6 class="text-muted mt-3">Analytics Chart</h6>
          <p class="text-muted mb-0">Visual representation of your API usage and performance metrics</p>
        </div>
      </div>

      <!-- Monthly Overview -->
      <div class="stats-card">
        <h5 class="section-title">Monthly Overview</h5>
        
        <div class="overview-grid">
          <div class="overview-card">
            <div class="overview-title">Lookups This Month</div>
            <div class="overview-value">0</div>
            <div class="overview-subtitle">
              <span class="trend-indicator trend-neutral">
                <i class="fas fa-minus me-1"></i>No change
              </span>
            </div>
          </div>
          
          <div class="overview-card">
            <div class="overview-title">P50 Response Time</div>
            <div class="overview-value">0ms</div>
            <div class="overview-subtitle">
              <span class="trend-indicator trend-up">
                <i class="fas fa-arrow-up me-1"></i>Within target
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Right Column: Performance & Targets -->
    <div class="col-lg-4">
      <!-- Performance Targets -->
      <div class="stats-card">
        <h5 class="section-title">Performance Targets</h5>
        
        <div class="targets-section">
          <ul class="targets-list">
            <li>
              <strong>P50 Response Time:</strong> Target &lt;50ms (median)
              <span class="performance-badge">Met</span>
            </li>
            <li>
              <strong>P99 Response Time:</strong> Target &lt;200ms (99th percentile)
              <span class="performance-badge">Met</span>
            </li>
            <li>
              <strong>Success Rate:</strong> Target &gt;99.9% uptime
              <span class="performance-badge">Met</span>
            </li>
            <li>
              <strong>Rate Limits:</strong> 100 requests/second per API key
              <span class="performance-badge">Active</span>
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Additional Metrics -->
      <div class="stats-card">
        <h5 class="section-title">API Usage</h5>
        
        <div class="usage-metrics">
          <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
            <div>
              <div class="fw-bold">API Calls Today</div>
              <small class="text-muted">Current usage</small>
            </div>
            <div class="text-end">
              <div class="fw-bold">0</div>
              <small class="text-muted">0% of limit</small>
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
            <div>
              <div class="fw-bold">Peak Usage</div>
              <small class="text-muted">Highest in 30 days</small>
            </div>
            <div class="text-end">
              <div class="fw-bold">0</div>
              <small class="text-muted">requests/minute</small>
            </div>
          </div>
          
          <div class="d-flex justify-content-between align-items-center p-3 bg-light rounded">
            <div>
              <div class="fw-bold">Error Rate</div>
              <small class="text-muted">Failed requests</small>
            </div>
            <div class="text-end">
              <div class="fw-bold">0.00%</div>
              <small class="text-success">
                <i class="fas fa-check me-1"></i>Optimal
              </small>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Quick Actions -->
      <div class="stats-card">
        <h5 class="section-title">Quick Actions</h5>
        
        <div class="quick-actions">
          <button class="btn w-100 mb-2 p-3 text-start bg-light border">
            <i class="fas fa-chart-line me-2 text-primary"></i>
            <strong>View Detailed Reports</strong>
            <small class="d-block text-muted mt-1">Access comprehensive analytics</small>
          </button>
          
          <button class="btn w-100 mb-2 p-3 text-start bg-light border">
            <i class="fas fa-bell me-2 text-primary"></i>
            <strong>Set Up Alerts</strong>
            <small class="d-block text-muted mt-1">Get notified about performance issues</small>
          </button>
          
          <button class="btn w-100 p-3 text-start bg-light border">
            <i class="fas fa-cog me-2 text-primary"></i>
            <strong>Configure Monitoring</strong>
            <small class="d-block text-muted mt-1">Customize your metrics dashboard</small>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="JS/index.js"></script>

</body>
</html>