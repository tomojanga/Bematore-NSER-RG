<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NSER Operator Dashboard</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
</head>

<body>

<!-- Sidebar and Nav -->
<?php include './nav-sidebar.php'; ?>

  
<!-- Main  -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-1 dashboard-title">Dashboard</h4>
      <p class="text-muted mb-0">Welcome back, ABC GAMING LTD</p>
    </div>
    <button class="btn dashboard-btn-primary">
      <i class="fas fa-sync-alt me-1"></i> Refresh
    </button>
  </div>

  <div class="row g-3">
    <!-- Left Column -->
    <div class="col-lg-8">
      <div class="row g-3">
        <!-- Top Stats Cards -->
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 text-white equal-height-card dashboard-card-blue">
            <div class="card-body">
              <i class="fas fa-chart-line fa-2x mb-2 stats-card-text-white"></i>
              <h6 class="opacity-75 stats-card-text-white">API Calls Today</h6>
              <h4 class="fw-bold stats-card-text-white">0</h4>
              <small class="stats-card-text-white">99.8% success rate</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 text-white equal-height-card dashboard-card-green">
            <div class="card-body">
              <i class="fas fa-user-slash fa-2x mb-2 stats-card-text-white"></i>
              <h6 class="opacity-75 stats-card-text-white">Active Exclusions</h6>
              <h4 class="fw-bold stats-card-text-white">0</h4>
              <small class="stats-card-text-white">99.8% success rate</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 text-white equal-height-card dashboard-card-red">
            <div class="card-body">
              <i class="fas fa-plus-circle fa-2x mb-2 stats-card-text-white"></i>
              <h6 class="opacity-75 stats-card-text-white">New Today</h6>
              <h4 class="fw-bold stats-card-text-white">0</h4>
              <small class="stats-card-text-white">99.8% success rate</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 equal-height-card dashboard-card-yellow">
            <div class="card-body">
              <i class="fas fa-tachometer-alt fa-2x mb-2 stats-card-text-dark"></i>
              <h6 class="opacity-75 stats-card-text-dark">Avg Response</h6>
              <h4 class="fw-bold stats-card-text-dark">45ms</h4>
              <small class="stats-card-text-dark">99.8% success rate</small>
            </div>
          </div>
        </div>

        <!-- Getting Started -->
        <div class="col-md-12">
          <div class="card shadow-sm border-0 dashboard-card-light">
            <div class="card-header bg-white border-0">
              <h6 class="mb-0">Getting Started</h6>
            </div>
            <div class="card-body">
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="getting-started-card text-center p-3">
                    <div class="icon-container mb-3">
                      <i class="fas fa-key fa-2x text-primary"></i>
                    </div>
                    <h6 class="fw-bold">Generate API Keys</h6>
                    <p class="small text-muted mb-0">Create API keys for production and testing environments</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="getting-started-card text-center p-3">
                    <div class="icon-container mb-3">
                      <i class="fas fa-flask fa-2x text-primary"></i>
                    </div>
                    <h6 class="fw-bold">Test with Simulator</h6>
                    <p class="small text-muted mb-0">Use the simulator to test exclusion lookups before going live</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="getting-started-card text-center p-3">
                    <div class="icon-container mb-3">
                      <i class="fas fa-link fa-2x text-primary"></i>
                    </div>
                    <h6 class="fw-bold">Setup Integration</h6>
                    <p class="small text-muted mb-0">Integrate real-time exclusion checks into your platform</p>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="getting-started-card text-center p-3">
                    <div class="icon-container mb-3">
                      <i class="fas fa-search fa-2x text-primary"></i>
                    </div>
                    <h6 class="fw-bold">Perform Lookups</h6>
                    <p class="small text-muted mb-0">Search the exclusion register in real-time</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Real-time Lookups -->
        <div class="col-md-6">
          <div class="card shadow-sm border-0 equal-height-card dashboard-card-light">
            <div class="card-header bg-white border-0 d-flex align-items-center">
              <i class="fas fa-bolt text-warning me-2"></i>
              <h6 class="mb-0">Real-time Lookups</h6>
            </div>
            <div class="card-body">
              <p class="small text-muted mb-3">Check exclusion status instantly with our API</p>
              <div class="feature-list">
                <div class="feature-item d-flex align-items-center mb-2">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  <span>&lt; 100ms response</span>
                </div>
                <div class="feature-item d-flex align-items-center mb-2">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  <span>High availability</span>
                </div>
                <div class="feature-item d-flex align-items-center">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  <span>99.9% uptime</span>
                </div>
              </div>
              <button class="btn btn-sm dashboard-btn-primary w-100 mt-3">
                <i class="fas fa-play-circle me-1"></i> Start Testing
              </button>
            </div>
          </div>
        </div>

        <!-- Compliance Tracking -->
        <div class="col-md-6">
          <div class="card shadow-sm border-0 equal-height-card dashboard-card-light">
            <div class="card-header bg-white border-0 d-flex align-items-center">
              <i class="fas fa-chart-bar text-info me-2"></i>
              <h6 class="mb-0">Compliance Tracking</h6>
            </div>
            <div class="card-body">
              <p class="small text-muted mb-3">Monitor your compliance score and metrics</p>
              <div class="feature-list">
                <div class="feature-item d-flex align-items-center mb-2">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  <span>Real-time metrics</span>
                </div>
                <div class="feature-item d-flex align-items-center mb-2">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  <span>Detailed reports</span>
                </div>
                <div class="feature-item d-flex align-items-center">
                  <i class="fas fa-check-circle text-success me-2"></i>
                  <span>Compliance alerts</span>
                </div>
              </div>
              <button class="btn btn-sm dashboard-btn-success w-100 mt-3">
                <i class="fas fa-chart-line me-1"></i> View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column -->
    <div class="col-lg-4">
      <!-- Integration Support -->
      <div class="card shadow-sm border-0 mb-3 dashboard-card-light">
        <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Integration Support</h6>
          <a href="#" class="small text-primary">View All →</a>
        </div>
        <div class="card-body">
          <p class="small text-muted mb-3">Easy integration with your existing systems</p>
          <div class="integration-feature">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h6 class="mb-1">REST API</h6>
                <small class="text-muted">Standard HTTP endpoints</small>
              </div>
              <span class="badge badge-dashboard-success">Available</span>
            </div>
            
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h6 class="mb-1">Webhooks</h6>
                <small class="text-muted">Real-time notifications</small>
              </div>
              <span class="badge badge-dashboard-success">Available</span>
            </div>
            
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="mb-1">SDKs</h6>
                <small class="text-muted">Multiple language support</small>
              </div>
              <span class="badge badge-dashboard-success">Available</span>
            </div>
            
            <div class="d-flex gap-2 mt-3">
              <button class="btn btn-sm dashboard-btn-primary flex-fill">
                <i class="fas fa-code me-1"></i> API Docs
              </button>
              <button class="btn btn-sm dashboard-btn-info flex-fill">
                <i class="fas fa-book me-1"></i> Guide
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="card shadow-sm border-0 mb-3 dashboard-card-light">
        <div class="card-header bg-white border-0">
          <h6 class="mb-0">System Status</h6>
        </div>
        <div class="card-body small">
          <div class="alert alert-dashboard-success py-2 mb-2">
            <i class="fas fa-check-circle me-2"></i>API Status — Operational
          </div>
          <div class="alert alert-dashboard-success py-2 mb-2">
            <i class="fas fa-check-circle me-2"></i>Database — Online
          </div>
          <div class="alert alert-dashboard-success py-2 mb-2">
            <i class="fas fa-check-circle me-2"></i>Webhooks — Active
          </div>
          <div class="alert alert-dashboard-success py-2">
            <i class="fas fa-check-circle me-2"></i>NSER Registry — Active
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