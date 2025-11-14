<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>GRAK Admin Dashboard</title>

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

  
<!-- Main content placeholder -->
<div class="main-content p-4 bg-light" id="mainContent">
  <h4 class="fw-bold mb-4 dashboard-title">GRAK Compliance Dashboard</h4>

  <div class="row g-3">
    <!-- Left Column -->
    <div class="col-lg-8">
      <div class="row g-3">
        <!-- Top Stats Cards -->
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 text-white equal-height-card dashboard-card-blue">
            <div class="card-body">
              <h6 class="opacity-75 stats-card-text-white">Total Operators</h6>
              <h4 class="fw-bold stats-card-text-white">42</h4>
              <small class="stats-card-text-white">+5 this month</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 text-white equal-height-card dashboard-card-green">
            <div class="card-body">
              <h6 class="opacity-75 stats-card-text-white">Screening Coverage</h6>
              <h4 class="fw-bold stats-card-text-white">87%</h4>
              <small class="stats-card-text-white">target: 90%</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 text-white equal-height-card dashboard-card-red">
            <div class="card-body">
              <h6 class="opacity-75 stats-card-text-white">Active Exclusions</h6>
              <h4 class="fw-bold stats-card-text-white">28,450</h4>
              <small class="stats-card-text-white">self-excluded users</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 equal-height-card dashboard-card-yellow">
            <div class="card-body">
              <h6 class="opacity-75 stats-card-text-dark">Daily Revenue</h6>
              <h4 class="fw-bold stats-card-text-dark">$2.8M</h4>
              <small class="stats-card-text-dark">5% levy collection</small>
            </div>
          </div>
        </div>

        <!-- System Alerts -->
        <div class="col-md-6">
          <div class="card shadow-sm border-0 equal-height-card dashboard-card-light">
            <div class="card-header bg-white border-0">
              <h6 class="mb-0">System Alerts</h6>
            </div>
            <div class="card-body">
              <ul class="list-group list-group-dashboard">
                <li class="list-group-item border-0 d-flex justify-content-between align-items-center">
                  <span><i class="fa fa-exclamation-triangle text-warning me-2"></i>Cross-platform duplicates</span>
                  <span class="badge badge-dashboard-warning">12 flagged</span>
                </li>
                <li class="list-group-item border-0 d-flex justify-content-between align-items-center">
                  <span><i class="fa fa-shield-alt text-primary me-2"></i>Risk score updates</span>
                  <span class="badge badge-dashboard-primary">245 pending</span>
                </li>
                <li class="list-group-item border-0 d-flex justify-content-between align-items-center">
                  <span><i class="fa fa-sync text-info me-2"></i>API sync required</span>
                  <span class="badge badge-dashboard-info">3 operators</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Daily Screening Stats -->
        <div class="col-md-6">
          <div class="card shadow-sm border-0 equal-height-card dashboard-card-light">
            <div class="card-header bg-white border-0">
              <h6 class="mb-0">Today's Screening Activity</h6>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between mb-2 small">
                <span>New Registrations</span><strong>1,245</strong>
              </div>
              <div class="d-flex justify-content-between mb-2 small">
                <span>Risk Assessments</span><strong>892</strong>
              </div>
              <div class="d-flex justify-content-between mb-2 small">
                <span>Self-Exclusions</span><strong>67</strong>
              </div>
              <div class="d-flex justify-content-between mb-2 small">
                <span>BST Generated</span><strong>1,198</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Compliance Overview -->
        <div class="col-md-12">
          <div class="card shadow-sm border-0 dashboard-card-light">
            <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center">
              <h6 class="mb-0">Operator Compliance Status</h6>
              <small class="text-muted">Real-time monitoring</small>
            </div>
            <div class="card-body">
              <div class="mb-2">
                <small>Fully Compliant — <strong>32 operators</strong></small>
                <div class="progress" style="height:8px">
                  <div class="progress-bar progress-bar-primary" style="width:76%"></div>
                </div>
              </div>
              <div class="mb-2">
                <small>Partial Compliance — <strong>7 operators</strong></small>
                <div class="progress" style="height:8px">
                  <div class="progress-bar bg-warning" style="width:17%"></div>
                </div>
              </div>
              <div class="mb-2">
                <small>Non-Compliant — <strong>3 operators</strong></small>
                <div class="progress" style="height:8px">
                  <div class="progress-bar bg-danger" style="width:7%"></div>
                </div>
              </div>
              <div>
                <small>Pending Onboarding — <strong>5 operators</strong></small>
                <div class="progress" style="height:8px">
                  <div class="progress-bar bg-secondary" style="width:12%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="col-md-12">
          <div class="card shadow-sm border-0 dashboard-card-light">
            <div class="card-header bg-white border-0">
              <h6 class="mb-0">Quick Actions</h6>
            </div>
            <div class="card-body">
              <div class="quick-actions-grid">
                <button class="btn btn-sm dashboard-btn-primary">
                  <i class="fa fa-download me-2"></i>Export Report
                </button>
                <button class="btn btn-sm dashboard-btn-success">
                  <i class="fa fa-eye me-2"></i>View Operators
                </button>
                <button class="btn btn-sm dashboard-btn-danger">
                  <i class="fa fa-ban me-2"></i>Exclusions
                </button>
                <button class="btn btn-sm dashboard-btn-secondary">
                  <i class="fa fa-cog me-2"></i>Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column -->
    <div class="col-lg-4">
      <!-- Risk Distribution Chart -->
      <div class="card shadow-sm border-0 mb-3 chart-card dashboard-card-light">
        <div class="card-header bg-white border-0">
          <h6 class="mb-0">Risk Distribution</h6>
        </div>
        <div class="card-body">
          <div class="chart-container">
            <canvas id="riskChart" height="160"></canvas>
          </div>
        </div>
      </div>

      <!-- Platform Distribution -->
      <div class="card shadow-sm border-0 mb-3 chart-card dashboard-card-light">
        <div class="card-header bg-white border-0">
          <h6 class="mb-0">Platform Distribution</h6>
        </div>
        <div class="card-body text-center">
          <div class="chart-container">
            <canvas id="platformPie" width="200" height="200"></canvas>
          </div>
          <ul class="list-unstyled small mt-3 text-start">
            <li><i class="fa fa-circle me-1" style="color: #1e5aa8;"></i> Online Betting – 45%</li>
            <li><i class="fa fa-circle me-1" style="color: #28a745;"></i> Land Casinos – 35%</li>
            <li><i class="fa fa-circle me-1" style="color: #ffc107;"></i> Lottery – 15%</li>
            <li><i class="fa fa-circle me-1" style="color: #dc3545;"></i> Other – 5%</li>
          </ul>
        </div>
      </div>

      <!-- System Status -->
      <div class="card shadow-sm border-0 mb-3 dashboard-card-light">
        <div class="card-header bg-white border-0">
          <h6 class="mb-0">System Status</h6>
        </div>
        <div class="card-body small">
          <div class="alert alert-dashboard-success py-2 mb-2">
            <i class="fa fa-check-circle me-2"></i>API Gateway — Operational
          </div>
          <div class="alert alert-dashboard-success py-2 mb-2">
            <i class="fa fa-check-circle me-2"></i>BST Generation — Active
          </div>
          <div class="alert alert-dashboard-info py-2 mb-2">
            <i class="fa fa-sync me-2"></i>Data Sync — Processing
          </div>
          <div class="alert alert-dashboard-success py-2">
            <i class="fa fa-check-circle me-2"></i>NSER Registry — Live
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
 // Risk Distribution Chart
new Chart(document.getElementById('riskChart'), {
  type: 'bar',
  data: {
    labels: ['Low Risk','Medium Risk','High Risk'],
    datasets: [{
      label: 'Users',
      data: [15600, 8450, 3200],
      backgroundColor: [
        getComputedStyle(document.documentElement).getPropertyValue('--success-green').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--warning-yellow').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--danger-red').trim()
      ],
      borderRadius: 6
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: { 
      y: { 
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Users'
        }
      }
    },
    plugins: { 
      legend: { display: false }
    }
  }
});

// Platform Distribution Pie Chart
new Chart(document.getElementById('platformPie'), {
  type: 'doughnut',
  data: {
    labels: ['Online Betting', 'Land Casinos', 'Lottery', 'Other'],
    datasets: [{
      data: [45, 35, 15, 5],
      backgroundColor: [
        getComputedStyle(document.documentElement).getPropertyValue('--chart-blue').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--chart-green').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--chart-yellow').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--chart-red').trim()
      ]
    }]
  },
  options: { 
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
      }
    }
  }
});
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="JS/index.js"></script>
</body>
</html>