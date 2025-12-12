<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Operators | Regulator Admin Dashboard</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/operators.css">

</head>

<body>

<!-- Sidebar and Nav -->
<?php include './nav-sidebar.php'; ?>

<!-- Main content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold dashboard-title" style="color:#1e5aa8;">Operator Management</h4>
      <p class="text-muted mb-0">Monitor licensed operators, compliance activity, and self-exclusion enforcement.</p>
    </div>
    <div>
      <button class="btn dashboard-btn-secondary">
        <i class="fa-solid fa-download me-2"></i>Export Data
      </button>
    </div>
  </div>

  <!-- Quick Stats -->
  <div class="row g-3 mb-4">
    <div class="col-md-3">
      <div class="card shadow-sm border-0 text-center bg-white">
        <div class="card-body p-3">
          <h3 class="fw-bold" style="color:#1e5aa8;">42</h3>
          <p class="text-muted small mb-0">Total Operators</p>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm border-0 text-center bg-white">
        <div class="card-body p-3">
          <h3 class="fw-bold text-warning">3</h3>
          <p class="text-muted small mb-0">Pending Reviews</p>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm border-0 text-center bg-white">
        <div class="card-body p-3">
          <h3 class="fw-bold text-danger">5</h3>
          <p class="text-muted small mb-0">Suspended Operators</p>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card shadow-sm border-0 text-center bg-white">
        <div class="card-body p-3">
          <h3 class="fw-bold text-success">89%</h3>
          <p class="text-muted small mb-0">Compliance Rate</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Tabs for operator views -->
  <ul class="nav nav-tabs mb-3" id="operatorTabs">
    <li class="nav-item">
      <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#all">All Operators</button>
    </li>
    <li class="nav-item">
      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#pending">Pending Reviews</button>
    </li>
    <li class="nav-item">
      <button class="nav-link" data-bs-toggle="tab" data-bs-target="#suspended">Suspended</button>
    </li>
  </ul>

  <div class="tab-content">
    <!-- All Operators -->
    <div class="tab-pane fade show active" id="all">
      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead style="background:#1e5aa8; color:white;">
            <tr>
              <th>Operator Name</th>
              <th>License ID</th>
              <th>Status</th>
              <th>Compliance</th>
              <th>Last Audit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>BetSmart Kenya</td>
              <td>LIC-0478</td>
              <td><span class="badge bg-success">Active</span></td>
              <td>95%</td>
              <td>Oct 2025</td>
              <td>
                <button class="btn btn-sm btn-outline-primary">View</button>
                <button class="btn btn-sm btn-outline-danger">Suspend</button>
              </td>
            </tr>
            <tr>
              <td>GameZone Ltd</td>
              <td>LIC-0532</td>
              <td><span class="badge bg-warning text-dark">Under Review</span></td>
              <td>72%</td>
              <td>Sep 2025</td>
              <td>
                <button class="btn btn-sm btn-outline-primary">View</button>
                <button class="btn btn-sm btn-outline-danger">Suspend</button>
              </td>
            </tr>
            <tr>
              <td>Play365</td>
              <td>LIC-0591</td>
              <td><span class="badge bg-success">Active</span></td>
              <td>88%</td>
              <td>Oct 2025</td>
              <td>
                <button class="btn btn-sm btn-outline-primary">View</button>
                <button class="btn btn-sm btn-outline-danger">Suspend</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

 <!-- Pending Reviews -->
<div class="tab-pane fade" id="pending">
  <div class="alert alert-warning">3 operators pending compliance review.</div>
  <div class="table-responsive">
    <table class="table table-striped align-middle">
      <thead style="background:#1e5aa8; color:white;">
        <tr>
          <th>Operator</th>
          <th>License Application ID</th>
          <th>Status</th>
          <th>Submitted On</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>GameZone Ltd</td>
          <td>APP-2158</td>
          <td><span class="badge bg-warning text-dark">Review Ongoing</span></td>
          <td>Sept 25, 2025</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-2">View Application</button>
            <button class="btn btn-sm btn-success">Approve</button>
          </td>
        </tr>
        <tr>
          <td>WinKing Sports</td>
          <td>APP-2240</td>
          <td><span class="badge bg-warning text-dark">Awaiting Docs</span></td>
          <td>Sept 29, 2025</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-2">View Application</button>
            <button class="btn btn-sm btn-success">Approve</button>
          </td>
        </tr>
        <tr>
          <td>BetSavvy</td>
          <td>APP-2285</td>
          <td><span class="badge bg-warning text-dark">Internal Review</span></td>
          <td>Oct 2, 2025</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-2">View Application</button>
            <button class="btn btn-sm btn-success">Approve</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
 

    <!-- Suspended Operators -->
    <div class="tab-pane fade" id="suspended">
      <div class="alert alert-danger">5 operators are currently suspended.</div>
      <table class="table table-striped align-middle">
        <thead style="background:#1e5aa8; color:white;">
          <tr>
            <th>Operator</th>
            <th>License ID</th>
            <th>Reason</th>
            <th>Suspended Since</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>LuckyPlay</td>
            <td>LIC-0322</td>
            <td>Repeated Self-Exclusion Violations</td>
            <td>Aug 2025</td>
          </tr>
          <tr>
            <td>FastBet Africa</td>
            <td>LIC-0209</td>
            <td>Data Non-Compliance</td>
            <td>Jul 2025</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>


<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
// Compliance Distribution Chart
new Chart(document.getElementById('complianceDistributionChart'), {
  type: 'polarArea',
  data: {
    labels: ['Fully Compliant', 'Partial Compliance', 'Non-Compliant'],
    datasets: [{
      data: [24, 12, 6],
      backgroundColor: [
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
    },
    scales: {
      r: {
        ticks: {
          display: false
        }
      }
    }
  }
});

// API Connection Status Chart
new Chart(document.getElementById('apiStatusChart'), {
  type: 'doughnut',
  data: {
    labels: ['Connected', 'Not Connected'],
    datasets: [{
      data: [28, 14],
      backgroundColor: [
        getComputedStyle(document.documentElement).getPropertyValue('--success-green').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--danger-red').trim()
      ],
      borderWidth: 0,
      cutout: '70%'
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

// Risk Level Distribution Chart
new Chart(document.getElementById('riskDistributionChart'), {
  type: 'bar',
  data: {
    labels: ['Low', 'Medium', 'High'],
    datasets: [{
      data: [28, 10, 4],
      backgroundColor: [
        getComputedStyle(document.documentElement).getPropertyValue('--success-green').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--warning-yellow').trim(),
        getComputedStyle(document.documentElement).getPropertyValue('--danger-red').trim()
      ],
      borderRadius: 6,
      borderSkipped: false,
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
        ticks: {
          stepSize: 5
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