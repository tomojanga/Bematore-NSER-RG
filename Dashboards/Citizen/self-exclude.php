<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Self-Exclusion | NSER</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/self-exclude.css">

</head>

<body>

<!-- Sidebar & Nav-->
<?php include 'nav-sidebar.php'; ?>

<!-- Main Content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <h2 class="page-title">Self-Exclusion</h2>
  <p class="page-subtitle">Manage your self-exclusion status and preferences</p>

  <div class="row g-4">
    <!-- Left Column -->
    <div class="col-lg-8">
      <!-- Alert Card -->
      <div class="alert-card">
        <div class="alert-header">
          <div class="alert-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <div class="alert-content">
            <h4>Cannot Register New Exclusion</h4>
            <h5>Active Exclusion Found</h5>
          </div>
        </div>
        <div class="alert-body">
          <p class="mb-0">You already have an active self-exclusion. You cannot register a new exclusion while one is already active.</p>
        </div>
      </div>

      <!-- Active Exclusion Details -->
      <div class="details-card">
        <div class="card-header-custom">
          <h5 class="mb-0">Your Active Exclusion Details</h5>
        </div>
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">Status</span>
            <span class="status-badge">Active</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Start Date</span>
            <span class="detail-value">11/11/2025</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">End Date</span>
            <span class="detail-value">11/11/2026</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Days Remaining</span>
            <span class="detail-value days-remaining">363 days</span>
          </div>
        </div>
      </div>

      <!-- What You Can Do -->
      <div class="actions-card">
        <div class="card-header-custom">
          <h5 class="mb-0">What You Can Do</h5>
        </div>
        <div class="card-body p-4">
          <div class="action-item">
            <i class="fas fa-check-circle action-icon"></i>
            <div class="action-content">
              <strong>View your exclusion details</strong> in the History page
            </div>
          </div>
          <div class="action-item">
            <i class="fas fa-check-circle action-icon"></i>
            <div class="action-content">
              <strong>Contact support</strong> if you need to terminate early (in exceptional cases)
            </div>
          </div>
          <div class="action-item">
            <i class="fas fa-check-circle action-icon"></i>
            <div class="action-content">
              <strong>Once your exclusion expires</strong>, you can register a new one if needed
            </div>
          </div>
          <div class="action-item">
            <i class="fas fa-check-circle action-icon"></i>
            <div class="action-content">
              <strong>Get support resources</strong> at any time
            </div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="button-container">
        <a href="index.php" class="btn btn-primary-custom">
          <i class="fas fa-arrow-left"></i>Back to Dashboard
        </a>
        <a href="history.php" class="btn btn-outline-custom">
          <i class="fas fa-history"></i>View Exclusion History
        </a>
      </div>
    </div>

    <!-- Right Column -->
    <div class="col-lg-4">
      <!-- Progress Chart -->
      <div class="progress-chart">
        <h6 class="chart-title">Exclusion Progress</h6>
        
        <div class="exclusion-timeline">
          <div class="timeline-progress">
            <div class="timeline-marker timeline-start">
              <i class="fas fa-play"></i>
            </div>
            <div class="timeline-marker timeline-current">
              <i class="fas fa-user"></i>
            </div>
            <div class="timeline-marker timeline-end">
              <i class="fas fa-flag"></i>
            </div>
          </div>
        </div>
        
        <div class="timeline-labels">
          <div class="timeline-label">
            <span>Start</span>
            <strong>11/11/2025</strong>
          </div>
          <div class="timeline-label">
            <span>Current</span>
            <strong>85% Complete</strong>
          </div>
          <div class="timeline-label">
            <span>End</span>
            <strong>11/11/2026</strong>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-label">
            <span>Time Completed</span>
            <strong>85%</strong>
          </div>
          <div class="progress-bar-custom">
            <div class="progress-fill progress-completed"></div>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-label">
            <span>Days Remaining</span>
            <strong>363 days</strong>
          </div>
          <div class="progress-bar-custom">
            <div class="progress-fill progress-remaining"></div>
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