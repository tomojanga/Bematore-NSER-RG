<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Assessments | NSER</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/assessments.css">


</head>

<body>

<!-- Sidebar & Navbar-->
<?php include 'nav-sidebar.php'; ?>

<!-- Main Content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <h2 class="page-title">Risk Assessments</h2>
  <p class="page-subtitle">Complete screening tests to evaluate your gambling behavior and risk level</p>

  <!-- Stats Cards  -->
  <div class="row g-3 mb-4">
    <div class="col-md-4">
      <div class="stats-card">
        <div class="stats-icon">
          <i class="fas fa-clipboard-list"></i>
        </div>
        <h4>12</h4>
        <p>Total Assessments</p>
        <small>Completed screenings</small>
      </div>
    </div>
    
    <div class="col-md-4">
      <div class="stats-card">
        <div class="stats-icon">
          <i class="fas fa-chart-line"></i>
        </div>
        <h4>N/A</h4>
        <p>Latest Risk Level</p>
        <small>Current risk profile</small>
      </div>
    </div>
    
    <div class="col-md-4">
      <div class="stats-card">
        <div class="stats-icon">
          <i class="fas fa-calendar-check"></i>
        </div>
        <h4>11/11/2025</h4>
        <p>Last Assessment</p>
        <small>Most recent screening</small>
      </div>
    </div>
  </div>

  <!-- Assessments  -->
  <div class="assessments-row">
    <!-- LIEBET Assessment -->
    <div class="assessment-card">
      <div class="assessment-icon">
        <i class="fas fa-file-medical"></i>
      </div>
      <h6 class="fw-bold mb-2">LIEBET Assessment</h6>
      <p class="text-muted small mb-2">Brief assessment of gambling behavior</p>
      <div class="time-badge">5-10 min</div>
      <button class="btn btn-primary-custom">
        Start Assessment
      </button>
    </div>

    <!-- PGSI Assessment -->
    <div class="assessment-card">
      <div class="assessment-icon">
        <i class="fas fa-chart-bar"></i>
      </div>
      <h6 class="fw-bold mb-2">PGSI Assessment</h6>
      <p class="text-muted small mb-2">Problem Gambling Severity Index</p>
      <div class="time-badge">10-15 min</div>
      <button class="btn btn-primary-custom">
        Start Assessment
      </button>
    </div>

    <!-- DSM-5 Assessment -->
    <div class="assessment-card">
      <div class="assessment-icon">
        <i class="fas fa-stethoscope"></i>
      </div>
      <h6 class="fw-bold mb-2">DSM-5 Criteria</h6>
      <p class="text-muted small mb-2">Clinical diagnostic criteria</p>
      <div class="time-badge">15-20 min</div>
      <button class="btn btn-primary-custom">
        Start Assessment
      </button>
    </div>
  </div>

  <!-- Assessment History  -->
  <div class="history-table">
    <div class="table-header d-flex justify-content-between align-items-center">
      <h5 class="mb-0">Assessment History</h5>
      <a href="history.php" class="small text-primary">View All</a>
    </div>

    <!-- Table Header -->
    <div class="table-row header">
      <div>Assessment</div>
      <div>Date</div>
      <div>Score</div>
      <div>Action</div>
    </div>

    <!-- Table Rows -->
    <div class="table-row">
      <div class="fw-bold">PGSI</div>
      <div class="text-muted">11/11/2025</div>
      <div><span class="risk-badge risk-na">N/A</span></div>
      <div><button class="btn btn-outline-custom">View Details</button></div>
    </div>

    <div class="table-row">
      <div class="fw-bold">LIE_BET</div>
      <div class="text-muted">11/11/2025</div>
      <div><span class="risk-badge risk-na">N/A</span></div>
      <div><button class="btn btn-outline-custom">View Details</button></div>
    </div>

    <div class="table-row">
      <div class="fw-bold">LIE_BET</div>
      <div class="text-muted">09/11/2025</div>
      <div><span class="risk-badge risk-na">N/A</span></div>
      <div><button class="btn btn-outline-custom">View Details</button></div>
    </div>

    <div class="table-row">
      <div class="fw-bold">LIE_BET</div>
      <div class="text-muted">09/11/2025</div>
      <div><span class="risk-badge risk-na">N/A</span></div>
      <div><button class="btn btn-outline-custom">View Details</button></div>
    </div>

    <div class="table-row">
      <div class="fw-bold">LIE_BET</div>
      <div class="text-muted">09/11/2025</div>
      <div><span class="risk-badge risk-na">N/A</span></div>
      <div><button class="btn btn-outline-custom">View Details</button></div>
    </div>

    <div class="table-row">
      <div class="fw-bold">LIE_BET</div>
      <div class="text-muted">09/11/2025</div>
      <div><span class="risk-badge risk-na">N/A</span></div>
      <div><button class="btn btn-outline-custom">View Details</button></div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="JS/index.js"></script>

</body>
</html>