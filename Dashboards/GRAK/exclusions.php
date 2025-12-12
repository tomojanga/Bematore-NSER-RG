<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exclusions | Regulator RAK Admin Dashboard</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
    <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/exclusion.css">

</head>

<body>

<!-- Sidebar and Nav -->
<?php include './nav-sidebar.php'; ?>

<!-- Main content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold dashboard-title" style="color:#1e5aa8;">Self-Exclusions Management</h4>
      <p class="text-muted mb-0">View and monitor all self-excluded individuals across operators</p>
    </div>
    <div>
      <button class="btn dashboard-btn-secondary">
        <i class="fa-solid fa-download me-2"></i>Bulk Export Data
      </button>
    </div>
  </div>

  <!-- Stats Cards -->
  <div class="row g-3 mb-4">
    <div class="col-md-3">
      <div class="card shadow-sm border-0 exclusion-stats-card bg-white">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Total Self-Exclusions</h6>
              <h3 class="fw-bold mb-0" style="color:#1e5aa8;">845</h3>
              <small class="text-muted">All-time records</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(30, 90, 168, 0.1); color: #1e5aa8;">
              <i class="fa-solid fa-ban"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm border-0 exclusion-stats-card bg-white">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Active Exclusions</h6>
              <h3 class="fw-bold mb-0 text-success">790</h3>
              <small class="text-muted">Currently in effect</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(40, 167, 69, 0.1); color: #28a745;">
              <i class="fa-solid fa-user-slash"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm border-0 exclusion-stats-card bg-white">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Expired Exclusions</h6>
              <h3 class="fw-bold mb-0 text-warning">55</h3>
              <small class="text-muted">Period elapsed</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(255, 193, 7, 0.1); color: #ffc107;">
              <i class="fa-solid fa-clock"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm border-0 exclusion-stats-card bg-white">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">New This Month</h6>
              <h3 class="fw-bold mb-0 text-danger">34</h3>
              <small class="text-muted">Recent submissions</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545;">
              <i class="fa-solid fa-chart-line"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="row g-4">
    <!-- Left Column -->
    <div class="col-lg-8">
      <!-- Search and Basic Filters -->
      <div class="card shadow-sm border-0 mb-4 dashboard-card-light">
        <div class="card-body py-3">
          <div class="row g-3 align-items-end">
            <div class="col-md-6">
              <div class="search-box-custom">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" placeholder="Search by BST token...">
              </div>
            </div>
            <div class="col-md-3">
              <label class="form-label small text-muted mb-1">Status</label>
              <select class="form-select form-select-sm">
                <option selected>All Status</option>
                <option>Active Only</option>
                <option>Expired Only</option>
              </select>
            </div>
          
          </div>
        </div>
      </div>

      <!-- Exclusions Table -->
      <div class="card shadow-sm border-0 dashboard-card-light">
        <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center py-3">
          <h6 class="mb-0">Self-Exclusions Registry</h6>
          <div class="text-muted small">845 total records</div>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0 exclusion-table">
              <thead>
                <tr>
                  <th class="ps-4">BST Token</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="ps-4">
                    <span class="bst-token">BST-K47A9X2P</span>
                  </td>
                  <td>15 Sep 2025</td>
                  <td>15 Mar 2026</td>
                  <td><span class="duration-badge">6 months</span></td>
                  <td><span class="badge bg-success status-badge">Active</span></td>
                </tr>
                <tr>
                  <td class="ps-4">
                    <span class="bst-token">BST-R83M1Y9Q</span>
                  </td>
                  <td>22 Aug 2025</td>
                  <td>22 Aug 2026</td>
                  <td><span class="duration-badge">1 year</span></td>
                  <td><span class="badge bg-success status-badge">Active</span></td>
                </tr>
                <tr>
                  <td class="ps-4">
                    <span class="bst-token">BST-N29P5Z7R</span>
                  </td>
                  <td>05 Jun 2025</td>
                  <td>05 Sep 2025</td>
                  <td><span class="duration-badge">3 months</span></td>
                  <td><span class="badge bg-warning status-badge">Expired</span></td>
                </tr>
                <tr>
                  <td class="ps-4">
                    <span class="bst-token">BST-L62T3V8S</span>
                  </td>
                  <td>10 Oct 2025</td>
                  <td>10 Oct 2027</td>
                  <td><span class="duration-badge">2 years</span></td>
                  <td><span class="badge bg-success status-badge">Active</span></td>
                </tr>
                <tr>
                  <td class="ps-4">
                    <span class="bst-token">BST-F94W2X5T</span>
                  </td>
                  <td>18 Jul 2025</td>
                  <td>18 Jan 2026</td>
                  <td><span class="duration-badge">6 months</span></td>
                  <td><span class="badge bg-success status-badge">Active</span></td>
                </tr>
                <tr>
                  <td class="ps-4">
                    <span class="bst-token">BST-D58U7Y1V</span>
                  </td>
                  <td>30 Mar 2025</td>
                  <td>30 Jun 2025</td>
                  <td><span class="duration-badge">3 months</span></td>
                  <td><span class="badge bg-warning status-badge">Expired</span></td>
                </tr>
                <tr>
                  <td class="ps-4">
                    <span class="bst-token">BST-H76Z4X9W</span>
                  </td>
                  <td>12 Nov 2025</td>
                  <td>12 Nov 2026</td>
                  <td><span class="duration-badge">1 year</span></td>
                  <td><span class="badge bg-success status-badge">Active</span></td>
                </tr>
                <tr>
                  <td class="ps-4">
                    <span class="bst-token">BST-J38V2B7C</span>
                  </td>
                  <td>25 Sep 2025</td>
                  <td>25 Dec 2025</td>
                  <td><span class="duration-badge">3 months</span></td>
                  <td><span class="badge bg-success status-badge">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
            <div class="text-muted small">Showing 8 of 845 records</div>
            <nav>
              <ul class="pagination pagination-sm mb-0">
                <li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
                <li class="page-item active"><a class="page-link" href="#">1</a></li>
                <li class="page-item"><a class="page-link" href="#">2</a></li>
                <li class="page-item"><a class="page-link" href="#">3</a></li>
                <li class="page-item"><a class="page-link" href="#">Next</a></li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column -->
    <div class="col-lg-4">
      <!-- Exclusion Trends Chart -->
      <div class="card shadow-sm border-0 mb-4 dashboard-card-light">
        <div class="card-header bg-white border-0">
          <h6 class="mb-0">Monthly Exclusion Trends</h6>
        </div>
        <div class="card-body">
          <div class="chart-container-sm">
            <canvas id="exclusionTrendsChart"></canvas>
          </div>
          <div class="row text-center mt-3">
            <div class="col-6">
              <h5 class="fw-bold text-primary mb-1">+12%</h5>
              <small class="text-muted">vs. Last Month</small>
            </div>
            <div class="col-6">
              <h5 class="fw-bold text-success mb-1">34</h5>
              <small class="text-muted">New This Month</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Exclusion Duration Distribution -->
      <div class="card shadow-sm border-0 mb-4 dashboard-card-light">
        <div class="card-header bg-white border-0">
          <h6 class="mb-0">Exclusion Duration</h6>
        </div>
        <div class="card-body">
          <div class="chart-container-sm">
            <canvas id="durationDistributionChart"></canvas>
          </div>
          <div class="row text-center mt-3">
            <div class="col-4">
              <h5 class="fw-bold mb-1">62%</h5>
              <small class="text-muted">6 Months</small>
            </div>
            <div class="col-4">
              <h5 class="fw-bold mb-1">24%</h5>
              <small class="text-muted">1 Year</small>
            </div>
            <div class="col-4">
              <h5 class="fw-bold mb-1">14%</h5>
              <small class="text-muted">Other</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Operator Distribution -->
      <div class="card shadow-sm border-0 mb-4 dashboard-card-light">
        <div class="card-header bg-white border-0">
          <h6 class="mb-0">Operator Distribution</h6>
        </div>
        <div class="card-body">
          <div class="chart-container-sm">
            <canvas id="operatorDistributionChart"></canvas>
          </div>
          <div class="row text-center mt-3">
            <div class="col-6">
              <h5 class="fw-bold text-primary mb-1">42%</h5>
              <small class="text-muted">Online Betting</small>
            </div>
            <div class="col-6">
              <h5 class="fw-bold text-success mb-1">35%</h5>
              <small class="text-muted">Land Casinos</small>
            </div>
          </div>
        </div>
      </div>

      <!-- System Information -->
      <div class="card shadow-sm border-0 dashboard-card-light">
        <div class="card-header bg-white border-0">
          <h6 class="mb-0">System Information</h6>
        </div>
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted">Last Data Sync</span>
            <span class="fw-semibold">Today, 14:30</span>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted">NSER Registry</span>
            <span class="badge bg-success">Connected</span>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="text-muted">API Status</span>
            <span class="badge bg-success">Operational</span>
          </div>
          <div class="d-flex justify-content-between align-items-center">
            <span class="text-muted">Data Integrity</span>
            <span class="badge bg-success">Verified</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
// Exclusion Trends Chart
new Chart(document.getElementById('exclusionTrendsChart'), {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
    datasets: [{
      label: 'New Exclusions',
      data: [28, 32, 40, 35, 42, 38, 45, 50, 48, 34],
      borderColor: getComputedStyle(document.documentElement).getPropertyValue('--primary-blue').trim(),
      backgroundColor: 'rgba(30, 90, 168, 0.1)',
      tension: 0.3,
      fill: true
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
          text: 'Number of Exclusions'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      }
    }
  }
});

// Duration Distribution Chart
new Chart(document.getElementById('durationDistributionChart'), {
  type: 'doughnut',
  data: {
    labels: ['6 Months', '1 Year', '2 Years', 'Permanent'],
    datasets: [{
      data: [62, 24, 10, 4],
      backgroundColor: [
        getComputedStyle(document.documentElement).getPropertyValue('--primary-blue').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--success-green').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--warning-yellow').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--danger-red').trim()
      ],
      borderWidth: 0
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    }
  }
});

// Operator Distribution Chart
new Chart(document.getElementById('operatorDistributionChart'), {
  type: 'bar',
  data: {
    labels: ['Online Betting', 'Land Casinos', 'Lottery', 'Other'],
    datasets: [{
      data: [42, 35, 15, 8],
      backgroundColor: [
        getComputedStyle(document.documentElement).getPropertyValue('--primary-blue').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--success-green').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--warning-yellow').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--neutral-gray').trim()
      ],
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
        beginAtZero: true,
        max: 50,
        ticks: {
          callback: function(value) {
            return value + '%';
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