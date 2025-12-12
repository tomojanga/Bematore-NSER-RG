<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Screening | Regulator Admin Dashboard</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/screening.css">
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
</head>

<body>

<?php include './nav-sidebar.php'; ?>

<div class="main-content p-4 bg-light" id="mainContent">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold dashboard-title" style="color:#1e5aa8;">Compliance Screening</h4>
      <p class="text-muted mb-0">Monitor and review operator compliance screenings and risk levels.</p>
    </div>
    <div>
      <button class="btn dashboard-btn-secondary">
        <i class="fa-solid fa-download me-2"></i>Export Report
      </button>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="row g-3 mb-4">
    <div class="col-md-3">
      <div class="card card-stat shadow-sm border-0 bg-white" style="border-left-color: #1e5aa8 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Total Screenings</h6>
              <h3 class="fw-bold mb-0" style="color:#1e5aa8;">520</h3>
              <small class="text-muted">All screenings completed</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(30, 90, 168, 0.1); color: #1e5aa8;">
              <i class="fa-solid fa-clipboard-check"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card card-stat shadow-sm border-0 bg-white" style="border-left-color: #ffc107 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Pending Reviews</h6>
              <h3 class="fw-bold mb-0 text-warning">15</h3>
              <small class="text-muted">Awaiting approval</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(255, 193, 7, 0.1); color: #ffc107;">
              <i class="fa-solid fa-clock"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card card-stat shadow-sm border-0 bg-white" style="border-left-color: #28a745 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Approved</h6>
              <h3 class="fw-bold mb-0 text-success">470</h3>
              <small class="text-muted">Successfully verified</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(40, 167, 69, 0.1); color: #28a745;">
              <i class="fa-solid fa-check-circle"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card card-stat shadow-sm border-0 bg-white" style="border-left-color: #dc3545 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Flagged</h6>
              <h3 class="fw-bold mb-0 text-danger">35</h3>
              <small class="text-muted">Issues detected</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545;">
              <i class="fa-solid fa-flag"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts Section -->
  <div class="row g-4 mb-4">
    <div class="col-md-4">
      <div class="card shadow-sm border-0 bg-white">
        <div class="card-body">
          <h6 class="fw-bold mb-3" style="color:#1e5aa8;">Risk Distribution</h6>
          <div class="chart-container">
            <canvas id="riskDistribution"></canvas>
          </div>
          <div class="row text-center mt-3">
            <div class="col-4">
              <h5 class="fw-bold text-success mb-1">70%</h5>
              <small class="text-muted">Low Risk</small>
            </div>
            <div class="col-4">
              <h5 class="fw-bold text-warning mb-1">20%</h5>
              <small class="text-muted">Medium Risk</small>
            </div>
            <div class="col-4">
              <h5 class="fw-bold text-danger mb-1">10%</h5>
              <small class="text-muted">High Risk</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm border-0 bg-white">
        <div class="card-body">
          <h6 class="fw-bold mb-3" style="color:#1e5aa8;">Screenings Over Time</h6>
          <div class="chart-container">
            <canvas id="screeningsOverTime"></canvas>
          </div>
          <div class="row text-center mt-3">
            <div class="col-6">
              <h5 class="fw-bold text-primary mb-1">+12%</h5>
              <small class="text-muted">vs. Last Month</small>
            </div>
            <div class="col-6">
              <h5 class="fw-bold text-success mb-1">520</h5>
              <small class="text-muted">Total This Year</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card shadow-sm border-0 bg-white">
        <div class="card-body">
          <h6 class="fw-bold mb-3" style="color:#1e5aa8;">Status Overview</h6>
          <div class="chart-container">
            <canvas id="statusOverview"></canvas>
          </div>
          <div class="row text-center mt-3">
            <div class="col-4">
              <h5 class="fw-bold text-success mb-1">470</h5>
              <small class="text-muted">Approved</small>
            </div>
            <div class="col-4">
              <h5 class="fw-bold text-warning mb-1">15</h5>
              <small class="text-muted">Pending</small>
            </div>
            <div class="col-4">
              <h5 class="fw-bold text-danger mb-1">35</h5>
              <small class="text-muted">Flagged</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


  <div class="row g-4 mb-4">
    <div class="col-md-6">
      <div class="card shadow-sm border-0 bg-white">
        <div class="card-body">
          <h6 class="fw-bold mb-3" style="color:#1e5aa8;">Screening Type Distribution</h6>
          <div class="chart-container">
            <canvas id="screeningTypeChart"></canvas>
          </div>
          <div class="row text-center mt-3">
            <div class="col-3">
              <h5 class="fw-bold mb-1">45%</h5>
              <small class="text-muted">KYC</small>
            </div>
            <div class="col-3">
              <h5 class="fw-bold mb-1">30%</h5>
              <small class="text-muted">AML</small>
            </div>
            <div class="col-3">
              <h5 class="fw-bold mb-1">15%</h5>
              <small class="text-muted">License</small>
            </div>
            <div class="col-3">
              <h5 class="fw-bold mb-1">10%</h5>
              <small class="text-muted">Other</small>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card shadow-sm border-0 bg-white">
        <div class="card-body">
          <h6 class="fw-bold mb-3" style="color:#1e5aa8;">Monthly Screening Completion</h6>
          <div class="chart-container">
            <canvas id="completionRateChart"></canvas>
          </div>
          <div class="row text-center mt-3">
            <div class="col-6">
              <h5 class="fw-bold text-success mb-1">94%</h5>
              <small class="text-muted">Completion Rate</small>
            </div>
            <div class="col-6">
              <h5 class="fw-bold text-primary mb-1">2.3 days</h5>
              <small class="text-muted">Avg. Processing</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Screening Performance Metrics -->
  <div class="card shadow-sm border-0 bg-white mb-4">
    <div class="card-body">
      <h6 class="fw-bold mb-3" style="color:#1e5aa8;">Screening Performance Metrics</h6>
      <div class="row g-3">
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="fw-bold text-primary">98.2%</h4>
            <small class="text-muted">Accuracy Rate</small>
            <div class="progress progress-thin mt-1">
              <div class="progress-bar bg-success" style="width: 98.2%"></div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="fw-bold text-primary">2.1 days</h4>
            <small class="text-muted">Avg. Processing Time</small>
            <div class="progress progress-thin mt-1">
              <div class="progress-bar bg-info" style="width: 85%"></div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="fw-bold text-primary">99.7%</h4>
            <small class="text-muted">System Uptime</small>
            <div class="progress progress-thin mt-1">
              <div class="progress-bar bg-success" style="width: 99.7%"></div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="text-center">
            <h4 class="fw-bold text-primary">24 hrs</h4>
            <small class="text-muted">Avg. Response Time</small>
            <div class="progress progress-thin mt-1">
              <div class="progress-bar bg-warning" style="width: 75%"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Tabs -->
  <ul class="nav nav-tabs mb-3" id="screeningTabs">
    <li class="nav-item">
      <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#all">All Screenings</button>
    </li>
    <li class="nav-item">
      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#pending">Pending Reviews</button>
    </li>
    <li class="nav-item">
      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#flagged">Flagged</button>
    </li>
  </ul>

  <div class="tab-content">

    <!-- All Screenings -->
    <div class="tab-pane fade show active" id="all">
      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead>
            <tr>
              <th>Operator / Entity</th>
              <th>Screening Type</th>
              <th>Status</th>
              <th>Risk Level</th>
              <th>Date Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>BetSmart Kenya</td>
              <td><span class="screening-type-badge">AML Check</span></td>
              <td><span class="badge bg-success">Approved</span></td>
              <td><span class="risk-badge risk-low">Low</span></td>
              <td>Oct 28, 2025</td>
              <td><button class="btn btn-sm btn-outline-primary">View Report</button></td>
            </tr>
            <tr>
              <td>GameZone Ltd</td>
              <td><span class="screening-type-badge">License Review</span></td>
              <td><span class="badge bg-warning text-dark">Pending</span></td>
              <td><span class="risk-badge risk-medium">Medium</span></td>
              <td>—</td>
              <td><button class="btn btn-sm btn-outline-primary">View</button></td>
            </tr>
            <tr>
              <td>FastBet Africa</td>
              <td><span class="screening-type-badge">Data Compliance</span></td>
              <td><span class="badge bg-danger">Flagged</span></td>
              <td><span class="risk-badge risk-high">High</span></td>
              <td>Oct 5, 2025</td>
              <td><button class="btn btn-sm btn-outline-primary">View Details</button></td>
            </tr>
            <tr>
              <td>Play365</td>
              <td><span class="screening-type-badge">KYC Verification</span></td>
              <td><span class="badge bg-success">Approved</span></td>
              <td><span class="risk-badge risk-low">Low</span></td>
              <td>Oct 25, 2025</td>
              <td><button class="btn btn-sm btn-outline-primary">View Report</button></td>
            </tr>
            <tr>
              <td>LuckyPlay</td>
              <td><span class="screening-type-badge">AML Check</span></td>
              <td><span class="badge bg-success">Approved</span></td>
              <td><span class="risk-badge risk-low">Low</span></td>
              <td>Oct 22, 2025</td>
              <td><button class="btn btn-sm btn-outline-primary">View Report</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pending -->
    <div class="tab-pane fade" id="pending">
      <div class="alert alert-warning">15 screenings are pending administrative review.</div>
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Operator</th>
            <th>Screening Type</th>
            <th>Submitted On</th>
            <th>Assigned Officer</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Play365</td>
            <td><span class="screening-type-badge">AML / KYC</span></td>
            <td>Oct 26, 2025</td>
            <td>Jane W.</td>
            <td><button class="btn btn-sm btn-outline-primary me-2">Review</button><button class="btn btn-sm btn-success">Approve</button></td>
          </tr>
          <tr>
            <td>WinKing Sports</td>
            <td><span class="screening-type-badge">License Review</span></td>
            <td>Oct 24, 2025</td>
            <td>John D.</td>
            <td><button class="btn btn-sm btn-outline-primary me-2">Review</button><button class="btn btn-sm btn-success">Approve</button></td>
          </tr>
          <tr>
            <td>BetSavvy</td>
            <td><span class="screening-type-badge">Data Compliance</span></td>
            <td>Oct 23, 2025</td>
            <td>Sarah M.</td>
            <td><button class="btn btn-sm btn-outline-primary me-2">Review</button><button class="btn btn-sm btn-success">Approve</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Flagged -->
    <div class="tab-pane fade" id="flagged">
      <div class="alert alert-danger">35 screenings have been flagged as high-risk.</div>
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Operator</th>
            <th>Screening Type</th>
            <th>Reason for Flag</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>FastBet Africa</td>
            <td><span class="screening-type-badge">AML Check</span></td>
            <td>Failed transaction pattern detection</td>
            <td>Oct 3, 2025</td>
            <td><button class="btn btn-sm btn-outline-primary">View Report</button></td>
          </tr>
          <tr>
            <td>QuickWin Ltd</td>
            <td><span class="screening-type-badge">KYC Verification</span></td>
            <td>Document verification failure</td>
            <td>Sep 28, 2025</td>
            <td><button class="btn btn-sm btn-outline-primary">View Report</button></td>
          </tr>
          <tr>
            <td>M-Pesa Bet</td>
            <td><span class="screening-type-badge">License Review</span></td>
            <td>Compliance violations detected</td>
            <td>Sep 15, 2025</td>
            <td><button class="btn btn-sm btn-outline-primary">View Report</button></td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</div>

<!-- JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="JS/index.js"></script>

<script>
  // Risk Distribution Pie
  new Chart(document.getElementById('riskDistribution'), {
    type: 'doughnut',
    data: {
      labels: ['Low', 'Medium', 'High'],
      datasets: [{
        data: [70, 20, 10],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        borderWidth: 0
      }]
    },
    options: { 
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          position: 'bottom',
          labels: {
            padding: 20
          }
        } 
      } 
    }
  });

  // Screenings Over Time Line
  new Chart(document.getElementById('screeningsOverTime'), {
    type: 'line',
    data: {
      labels: ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
      datasets: [{
        label: 'Total Screenings',
        data: [400, 420, 450, 480, 510, 520],
        borderColor: '#1e5aa8',
        backgroundColor: 'rgba(30, 90, 168, 0.1)',
        fill: true,
        tension: 0.3,
        pointBackgroundColor: '#1e5aa8'
      }]
    },
    options: { 
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          display: false 
        } 
      },
      scales: {
        y: {
          beginAtZero: false,
          min: 350
        }
      }
    }
  });

  // Status Overview Bar
  new Chart(document.getElementById('statusOverview'), {
    type: 'bar',
    data: {
      labels: ['Approved', 'Pending', 'Flagged'],
      datasets: [{
        label: 'Screenings',
        data: [470, 15, 35],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { 
        legend: { 
          display: false 
        } 
      },
      scales: { 
        y: { 
          beginAtZero: true 
        } 
      }
    }
  });

  // Screening Type Distribution
  new Chart(document.getElementById('screeningTypeChart'), {
    type: 'pie',
    data: {
      labels: ['KYC', 'AML', 'License Review', 'Other'],
      datasets: [{
        data: [45, 30, 15, 10],
        backgroundColor: ['#1e5aa8', '#28a745', '#ffc107', '#6c757d'],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });

  // Completion Rate Chart
  new Chart(document.getElementById('completionRateChart'), {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [
        {
          label: 'Completion Rate',
          data: [89, 91, 90, 92, 93, 94, 95, 94, 93, 94],
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          fill: true,
          tension: 0.3,
          yAxisID: 'y'
        },
        {
          label: 'Avg. Processing (days)',
          data: [3.2, 2.9, 2.7, 2.5, 2.4, 2.3, 2.2, 2.1, 2.1, 2.1],
          borderColor: '#1e5aa8',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          tension: 0.3,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Completion Rate (%)'
          },
          min: 85,
          max: 100
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Processing Time (days)'
          },
          min: 1.5,
          max: 3.5,
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    }
  });
</script>

</body>
</html>