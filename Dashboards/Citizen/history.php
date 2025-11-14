<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>History | NSER</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/history.css">

</head>

<body>

<!-- Sidebar & Nav-->
<?php include 'nav-sidebar.php'; ?>

<!-- Main Content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <h2 class="page-title">Self-Exclusion History</h2>
  <p class="page-subtitle">View your past and current self-exclusion periods</p>

  <div class="history-container">
    <div class="history-header">
      <h5>Exclusion History</h5>
    </div>

    <!-- Table Header -->
    <div class="history-row header">
      <div>Type</div>
      <div>Status</div>
      <div>Period</div>
      <div>Duration</div>
      <div>Progress</div>
    </div>

    <!-- Active Exclusion -->
    <div class="history-row">
      <div>
        <strong>Self-Exclusion</strong>
        <div class="small text-muted">11/11/2025 - 11/11/2026</div>
      </div>
      <div>
        <span class="status-badge status-active">Active</span>
      </div>
      <div>
        <span class="period-badge">1 YEAR</span>
      </div>
      <div>365 days</div>
      <div class="progress-text">363 days remaining</div>
    </div>

    <!-- Pending Exclusion 1 -->
    <div class="history-row">
      <div>
        <strong>Self-Exclusion</strong>
        <div class="small text-muted">09/11/2025 - 08/05/2026</div>
      </div>
      <div>
        <span class="status-badge status-pending">Pending</span>
      </div>
      <div>
        <span class="period-badge">6 MONTHS</span>
      </div>
      <div>180 days</div>
      <div class="text-muted">-</div>
    </div>

    <!-- Pending Exclusion 2 -->
    <div class="history-row">
      <div>
        <strong>Self-Exclusion</strong>
        <div class="small text-muted">09/11/2025 - 08/05/2026</div>
      </div>
      <div>
        <span class="status-badge status-pending">Pending</span>
      </div>
      <div>
        <span class="period-badge">6 MONTHS</span>
      </div>
      <div>180 days</div>
      <div class="text-muted">-</div>
    </div>

    <!-- Pending Exclusion 3 -->
    <div class="history-row">
      <div>
        <strong>Self-Exclusion</strong>
        <div class="small text-muted">09/11/2025 - 08/05/2026</div>
      </div>
      <div>
        <span class="status-badge status-pending">Pending</span>
      </div>
      <div>
        <span class="period-badge">6 MONTHS</span>
      </div>
      <div>180 days</div>
      <div class="text-muted">-</div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="JS/index.js"></script>

</body>
</html>