<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Audit Trail | GRAK Dashboard</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/audit.css">

</head>

<body>

<?php include './nav-sidebar.php'; ?>

<div class="main-content p-4 bg-light" id="mainContent">

  <!-- Header -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="dashboard-title"> Audit Trail</h4>
      <p class="text-muted mb-0">Complete system activity logs and security monitoring</p>
    </div>
    <div>
      <button class="btn dashboard-btn-secondary me-2">
        <i class="fa-solid fa-download me-2"></i> Export Logs
      </button>
      <button class="btn dashboard-btn-primary">
        <i class="fa-solid fa-filter me-2"></i> Advanced Filters
      </button>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="row g-3 mb-4">
    <div class="col-md-3">
      <div class="card audit-card bg-white equal-height" style="border-left-color: #1e5aa8 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Total Audit Events</h6>
              <h3 class="fw-bold mb-0" style="color:#1e5aa8;">12,847</h3>
              <small class="text-muted">Last 30 days</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(30, 90, 168, 0.1); color: #1e5aa8;">
              <i class="fa-solid fa-list-check"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card audit-card bg-white equal-height" style="border-left-color: #28a745 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Security Events</h6>
              <h3 class="fw-bold mb-0 text-success">245</h3>
              <small class="text-muted">Login attempts & access</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(40, 167, 69, 0.1); color: #28a745;">
              <i class="fa-solid fa-shield-alt"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card audit-card bg-white equal-height" style="border-left-color: #ffc107 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Data Changes</h6>
              <h3 class="fw-bold mb-0 text-warning">1,842</h3>
              <small class="text-muted">Records modified</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(255, 193, 7, 0.1); color: #ffc107;">
              <i class="fa-solid fa-database"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card audit-card bg-white equal-height" style="border-left-color: #dc3545 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Suspicious Activities</h6>
              <h3 class="fw-bold mb-0 text-danger">18</h3>
              <small class="text-muted">Requires investigation</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545;">
              <i class="fa-solid fa-exclamation-triangle"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Charts Section -->
  <div class="row g-4 mb-4">
    <div class="col-md-6">
      <div class="card audit-card p-3 equal-height">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-line me-2 text-primary"></i>Audit Events Timeline</h6>
        <div class="chart-container">
          <canvas id="auditTimelineChart"></canvas>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card audit-card p-3 equal-height">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-pie me-2 text-primary"></i>Event Type Distribution</h6>
        <div class="chart-container">
          <canvas id="eventTypeChart"></canvas>
        </div>
      </div>
    </div>
  </div>

  <!-- Additional Charts -->
  <div class="row g-4 mb-4">
    <div class="col-md-4">
      <div class="card audit-card p-3 equal-height">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-user-shield me-2 text-primary"></i>User Activity Levels</h6>
        <div class="small-chart-container">
          <canvas id="userActivityChart"></canvas>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card audit-card p-3 equal-height">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-clock me-2 text-primary"></i>Peak Activity Hours</h6>
        <div class="small-chart-container">
          <canvas id="peakHoursChart"></canvas>
        </div>
      </div>
    </div>
    <div class="col-md-4">
      <div class="card audit-card p-3 equal-height">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-exclamation-circle me-2 text-primary"></i>Security Alerts</h6>
        <div class="small-chart-container">
          <canvas id="securityAlertsChart"></canvas>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters and Search -->
  <div class="card audit-card mb-4">
    <div class="card-body py-3">
      <div class="row g-3">
        <div class="col-md-4">
          <div class="search-box-custom">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search audit logs...">
          </div>
        </div>
        <div class="col-md-2">
          <select class="form-select form-select-sm">
            <option selected>All Event Types</option>
            <option>Login Events</option>
            <option>Data Changes</option>
            <option>System Events</option>
            <option>Security Events</option>
          </select>
        </div>
        <div class="col-md-2">
          <select class="form-select form-select-sm">
            <option selected>All Users</option>
            <option>Admin Users</option>
            <option>Operator Users</option>
            <option>System</option>
          </select>
        </div>
        <div class="col-md-2">
          <select class="form-select form-select-sm">
            <option selected>All Levels</option>
            <option>INFO</option>
            <option>WARNING</option>
            <option>ERROR</option>
            <option>SUCCESS</option>
          </select>
        </div>
        <div class="col-md-2">
          <input type="date" class="form-control form-control-sm" value="2025-10-01">
        </div>
      </div>
    </div>
  </div>

  <!-- Audit Logs Table -->
  <div class="card audit-card">
  <div class="card-body">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="fw-semibold text-muted mb-0">
        <i class="fa-solid fa-list me-2 text-primary"></i>Recent Audit Logs
      </h6>
      <div class="text-muted small">Showing 10 of 12,847 records</div>
    </div>

    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>Event Type</th>
            <th>Action</th>
            <th>IP Address</th>
            <th>Status</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <tr class="log-level-info">
            <td>2025-10-28 14:23:45</td>
            <td><span class="audit-badge" style="background-color: #e8f0fc; color: #1e5aa8;">Login</span></td>
            <td>User login</td>
            <td>192.168.1.45</td>
            <td><span class="badge bg-success">Success</span></td>
            <td><button class="btn btn-sm btn-outline-primary">View</button></td>
          </tr>
          <tr class="log-level-warning">
            <td>2025-10-28 14:15:32</td>
            <td><span class="audit-badge" style="background-color: #fff3cd; color: #856404;">Data Change</span></td>
            <td>Operator status updated</td>
            <td>192.168.1.67</td>
            <td><span class="badge bg-success">Success</span></td>
            <td><button class="btn btn-sm btn-outline-primary">View</button></td>
          </tr>
          <tr class="log-level-error">
            <td>2025-10-28 13:58:12</td>
            <td><span class="audit-badge" style="background-color: #f8d7da; color: #721c24;">Security</span></td>
            <td>Failed login attempt</td>
            <td>203.145.87.23</td>
            <td><span class="badge bg-danger">Failed</span></td>
            <td><button class="btn btn-sm btn-outline-primary">View</button></td>
          </tr>
          <tr class="log-level-success">
            <td>2025-10-28 13:42:56</td>
            <td><span class="audit-badge" style="background-color: #d4edda; color: #155724;">Report</span></td>
            <td>Report generated</td>
            <td>192.168.1.89</td>
            <td><span class="badge bg-success">Success</span></td>
            <td><button class="btn btn-sm btn-outline-primary">View</button></td>
          </tr>
          <tr class="log-level-info">
            <td>2025-10-28 13:25:34</td>
            <td><span class="audit-badge" style="background-color: #e8f0fc; color: #1e5aa8;">System</span></td>
            <td>Data backup completed</td>
            <td>192.168.1.77</td>
            <td><span class="badge bg-success">Success</span></td>
            <td><button class="btn btn-sm btn-outline-primary">View</button></td>
          </tr>
          <tr class="log-level-warning">
            <td>2025-10-28 12:58:47</td>
            <td><span class="audit-badge" style="background-color: #fff3cd; color: #856404;">Data Change</span></td>
            <td>User permissions updated</td>
            <td>192.168.1.92</td>
            <td><span class="badge bg-success">Success</span></td>
            <td><button class="btn btn-sm btn-outline-primary">View</button></td>
          </tr>
          <tr class="log-level-error">
            <td>2025-10-28 12:35:21</td>
            <td><span class="audit-badge" style="background-color: #f8d7da; color: #721c24;">Security</span></td>
            <td>API access denied</td>
            <td>192.168.1.45</td>
            <td><span class="badge bg-danger">Failed</span></td>
            <td><button class="btn btn-sm btn-outline-primary">View</button></td>
          </tr>
          <tr class="log-level-info">
            <td>2025-10-28 12:12:08</td>
            <td><span class="audit-badge" style="background-color: #e8f0fc; color: #1e5aa8;">Screening</span></td>
            <td>Screening review completed</td>
            <td>192.168.1.67</td>
            <td><span class="badge bg-success">Success</span></td>
            <td><button class="btn btn-sm btn-outline-primary">View</button></td>
          </tr>
          <tr class="log-level-success">
            <td>2025-10-28 11:45:33</td>
            <td><span class="audit-badge" style="background-color: #d4edda; color: #155724;">Export</span></td>
            <td>Data export completed</td>
            <td>192.168.1.89</td>
            <td><span class="badge bg-success">Success</span></td>
            <td><button class="btn btn-sm btn-outline-primary">View</button></td>
          </tr>
          <tr class="log-level-warning">
            <td>2025-10-28 11:23:17</td>
            <td><span class="audit-badge" style="background-color: #fff3cd; color: #856404;">Configuration</span></td>
            <td>System settings updated</td>
            <td>192.168.1.92</td>
            <td><span class="badge bg-success">Success</span></td>
            <td><button class="btn btn-sm btn-outline-primary">View</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
      <div class="text-muted small">Showing 10 of 12,847 records</div>
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


  <!-- System Health Monitoring -->
  <div class="row g-4 mt-4">
    <div class="col-md-6">
      <div class="card audit-card">
        <div class="card-body">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-heart-pulse me-2 text-primary"></i>System Health</h6>
          <div class="row g-3">
            <div class="col-6">
              <div class="text-center">
                <h4 class="fw-bold text-success">99.8%</h4>
                <small class="text-muted">Uptime</small>
                <div class="progress mt-1" style="height: 6px;">
                  <div class="progress-bar bg-success" style="width: 99.8%"></div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="text-center">
                <h4 class="fw-bold text-primary">2.1ms</h4>
                <small class="text-muted">Avg Response Time</small>
                <div class="progress mt-1" style="height: 6px;">
                  <div class="progress-bar bg-primary" style="width: 95%"></div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="text-center">
                <h4 class="fw-bold text-warning">0.2%</h4>
                <small class="text-muted">Error Rate</small>
                <div class="progress mt-1" style="height: 6px;">
                  <div class="progress-bar bg-warning" style="width: 0.2%"></div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="text-center">
                <h4 class="fw-bold text-info">98.5%</h4>
                <small class="text-muted">Log Accuracy</small>
                <div class="progress mt-1" style="height: 6px;">
                  <div class="progress-bar bg-info" style="width: 98.5%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card audit-card">
        <div class="card-body">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-bell me-2 text-primary"></i>Recent Alerts</h6>
          <div class="list-group list-group-flush">
            <div class="list-group-item px-0">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-warning me-2">Warning</span>
                  <small>Multiple failed login attempts detected</small>
                </div>
                <small class="text-muted">10:23 AM</small>
              </div>
            </div>
            <div class="list-group-item px-0">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-info me-2">Info</span>
                  <small>Database backup completed successfully</small>
                </div>
                <small class="text-muted">09:45 AM</small>
              </div>
            </div>
            <div class="list-group-item px-0">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-success me-2">Success</span>
                  <small>All systems operating normally</small>
                </div>
                <small class="text-muted">08:30 AM</small>
              </div>
            </div>
            <div class="list-group-item px-0">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-danger me-2">Critical</span>
                  <small>Unusual API access pattern detected</small>
                </div>
                <small class="text-muted">Yesterday</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Audit Timeline Chart
    new Chart(document.getElementById('auditTimelineChart'), {
      type: 'line',
      data: {
        labels: ['Oct 22', 'Oct 23', 'Oct 24', 'Oct 25', 'Oct 26', 'Oct 27', 'Oct 28'],
        datasets: [
          {
            label: 'Login Events',
            data: [320, 340, 310, 350, 380, 365, 390],
            borderColor: '#1e5aa8',
            backgroundColor: 'rgba(30, 90, 168, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Data Changes',
            data: [180, 195, 210, 190, 220, 240, 245],
            borderColor: '#ffc107',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Security Events',
            data: [45, 38, 52, 48, 55, 60, 65],
            borderColor: '#dc3545',
            backgroundColor: 'rgba(220, 53, 69, 0.1)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Number of Events'
            }
          }
        }
      }
    });

    // Event Type Distribution Chart
    new Chart(document.getElementById('eventTypeChart'), {
      type: 'doughnut',
      data: {
        labels: ['Login Events', 'Data Changes', 'System Events', 'Security Events', 'Reports', 'Other'],
        datasets: [{
          data: [35, 25, 15, 12, 8, 5],
          backgroundColor: [
            '#1e5aa8',
            '#ffc107',
            '#28a745',
            '#dc3545',
            '#6f42c1',
            '#6c757d'
          ],
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

    // User Activity Chart
    new Chart(document.getElementById('userActivityChart'), {
      type: 'bar',
      data: {
        labels: ['Admin', 'Operators', 'Auditors', 'System'],
        datasets: [{
          label: 'Activity Count',
          data: [2450, 1870, 920, 650],
          backgroundColor: '#1e5aa8',
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

    // Peak Hours Chart
    new Chart(document.getElementById('peakHoursChart'), {
      type: 'line',
      data: {
        labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
        datasets: [{
          label: 'Events per Hour',
          data: [120, 80, 450, 620, 580, 380],
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.3,
          fill: true
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

    // Security Alerts Chart
    new Chart(document.getElementById('securityAlertsChart'), {
      type: 'doughnut',
      data: {
        labels: ['Failed Logins', 'Access Denied', 'Suspicious IP', 'Other'],
        datasets: [{
          data: [45, 30, 15, 10],
          backgroundColor: [
            '#dc3545',
            '#ffc107',
            '#fd7e14',
            '#6c757d'
          ],
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
  });
</script>

<script src="JS/index.js"></script>
</body>
</html>