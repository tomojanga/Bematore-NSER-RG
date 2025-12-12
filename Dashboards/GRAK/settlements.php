<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Settlements | Regulator Dashboard</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/settlements.css">

</head>

<body>

<!-- Sidebar and Topbar -->
<?php include './nav-sidebar.php'; ?>

<!-- Main content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="dashboard-title">Financial Settlements</h4>
      <p class="text-muted mb-0">Monitor compliance-related financial settlements, fines, and reconciliations.</p>
    </div>
    <button class="btn dashboard-btn-secondary">
      <i class="fa-solid fa-download me-2"></i> Export Report
    </button>
  </div>

  <!-- Quick Stats -->
  <div class="row g-3 mb-4">
    <div class="col-md-3">
      <div class="card settlement-card text-center p-3">
        <h3 class="fw-bold" style="color:#1e5aa8;">70</h3>
        <p class="text-muted small mb-0">Total Settlement Cases</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card settlement-card text-center p-3">
        <h3 class="fw-bold text-warning">8</h3>
        <p class="text-muted small mb-0">Pending Settlements</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card settlement-card text-center p-3">
        <h3 class="fw-bold text-success">60</h3>
        <p class="text-muted small mb-0">Resolved Settlements</p>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card settlement-card text-center p-3">
        <h3 class="fw-bold text-danger">2</h3>
        <p class="text-muted small mb-0">Failed / Rejected</p>
      </div>
    </div>
  </div>

  <!-- Charts Section -->
  <div class="row g-4 mb-5">
    <div class="col-md-6">
      <div class="card settlement-card p-3">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-pie me-2 text-primary"></i>Settlements by Status</h6>
        <div class="chart-container">
          <canvas id="settlementStatusChart"></canvas>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card settlement-card p-3">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-line me-2 text-primary"></i>Monthly Settlement Trend</h6>
        <div class="chart-container">
          <canvas id="settlementTrendChart"></canvas>
        </div>
      </div>
    </div>
  </div>

  <!-- Settlement Records Table -->
  <div class="card border-0 shadow-sm">
    <div class="card-body">
      <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-list me-2 text-primary"></i>Recent Settlement Cases</h6>
      <div class="table-responsive">
        <table class="table table-striped align-middle">
          <thead>
            <tr>
              <th>Settlement ID</th>
              <th>Operator / Party</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>ST-1001</td>
              <td>BetSmart Kenya</td>
              <td>$5,000</td>
              <td><span class="badge bg-success">Resolved</span></td>
              <td>Oct 25, 2025</td>
              <td><button class="btn btn-sm btn-outline-primary">View</button></td>
            </tr>
            <tr>
              <td>ST-1002</td>
              <td>GameZone Ltd</td>
              <td>$1,200</td>
              <td><span class="badge bg-warning text-dark">Pending</span></td>
              <td>Oct 28, 2025</td>
              <td><button class="btn btn-sm btn-outline-primary">View</button></td>
            </tr>
            <tr>
              <td>ST-0999</td>
              <td>Play365</td>
              <td>$3,500</td>
              <td><span class="badge bg-danger">Failed</span></td>
              <td>Sep 30, 2025</td>
              <td><button class="btn btn-sm btn-outline-primary">View</button></td>
            </tr>
            <tr>
              <td>ST-0988</td>
              <td>LuckyPlay</td>
              <td>$2,700</td>
              <td><span class="badge bg-success">Resolved</span></td>
              <td>Sep 14, 2025</td>
              <td><button class="btn btn-sm btn-outline-primary">View</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
  //  Settlements by Status Pie Chart
  const statusChart = new Chart(document.getElementById('settlementStatusChart'), {
    type: 'doughnut',
    data: {
      labels: ['Resolved', 'Pending', 'Failed'],
      datasets: [{
        data: [60, 8, 2],
        backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
        borderWidth: 0,
        cutout: '70%'
      }]
    },
    options: {
      plugins: { legend: { position: 'bottom' } },
      maintainAspectRatio: false
    }
  });

  //  Monthly Settlement Trend Line Chart
  const trendChart = new Chart(document.getElementById('settlementTrendChart'), {
    type: 'line',
    data: {
      labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
      datasets: [{
        label: 'Total Settlements',
        data: [40, 45, 50, 60, 65, 70],
        borderColor: '#1e5aa8',
        backgroundColor: 'rgba(30,90,168,0.1)',
        borderWidth: 2,
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#1e5aa8'
      }]
    },
    options: {
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true }
      },
      maintainAspectRatio: false
    }
  });
</script>

<script src="JS/index.js"></script>
</body>
</html>
