<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NSER Citizen Dashboard</title>

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
  <h4 class="fw-bold mb-4 dashboard-title">Self-Exclusion Dashboard</h4>

  <div class="row g-3">
    <!-- Left Column -->
    <div class="col-lg-8">
      <div class="row g-3">
        <!-- Top Stats Cards -->
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 text-white equal-height-card dashboard-card-blue">
            <div class="card-body">
              <i class="fas fa-user-slash fa-2x mb-2 stats-card-text-white"></i>
              <h6 class="opacity-75 stats-card-text-white">Active Exclusions</h6>
              <h4 class="fw-bold stats-card-text-white">1</h4>
              <small class="stats-card-text-white">Self-exclusions currently active</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 text-white equal-height-card dashboard-card-green">
            <div class="card-body">
              <i class="fas fa-calendar-alt fa-2x mb-2 stats-card-text-white"></i>
              <h6 class="opacity-75 stats-card-text-white">Total Duration</h6>
              <h4 class="fw-bold stats-card-text-white">365 days</h4>
              <small class="stats-card-text-white">Combined exclusion duration</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 text-white equal-height-card dashboard-card-red">
            <div class="card-body">
              <i class="fas fa-clock fa-2x mb-2 stats-card-text-white"></i>
              <h6 class="opacity-75 stats-card-text-white">Days Remaining</h6>
              <h4 class="fw-bold stats-card-text-white">363</h4>
              <small class="stats-card-text-white">Until next exclusion expires</small>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-center shadow-sm border-0 equal-height-card dashboard-card-yellow">
            <div class="card-body">
              <i class="fas fa-chart-line fa-2x mb-2 stats-card-text-dark"></i>
              <h6 class="opacity-75 stats-card-text-dark">Risk Level</h6>
              <h4 class="fw-bold stats-card-text-dark">LOW</h4>
              <small class="stats-card-text-dark">Current assessment status</small>
            </div>
          </div>
        </div>

        <!-- Self-Exclusion Status -->
        <div class="col-md-6">
          <div class="card shadow-sm border-0 equal-height-card dashboard-card-light">
            <div class="card-header bg-white border-0 d-flex align-items-center">
              <i class="fas fa-exclamation-triangle text-warning me-2"></i>
              <h6 class="mb-0">Self-Exclusion Active</h6>
            </div>
            <div class="card-body">
              <p class="small text-muted mb-3">You currently have an active self-exclusion. You are excluded from all licensed gambling operators during this period.</p>
              <div class="row">
                <div class="col-6 mb-2">
                  <small class="text-muted">Start Date:</small>
                  <div class="fw-bold">11/11/2025</div>
                </div>
                <div class="col-6 mb-2">
                  <small class="text-muted">End Date:</small>
                  <div class="fw-bold">11/11/2026</div>
                </div>
                <div class="col-6 mb-2">
                  <small class="text-muted">Days Remaining:</small>
                  <div class="fw-bold">363 days</div>
                </div>
                <div class="col-6 mb-2">
                  <small class="text-muted">Duration:</small>
                  <div class="fw-bold">365 days</div>
                </div>
                <div class="col-12 mb-3">
                  <small class="text-muted">Reason:</small>
                  <div class="fw-bold">Self-exclusion</div>
                </div>
              </div>
              <div class="d-flex gap-2">
                <button class="btn btn-sm dashboard-btn-primary flex-fill">
                  <i class="fas fa-info-circle me-1"></i> View Details
                </button>
                <button class="btn btn-sm dashboard-btn-success flex-fill">
                  <i class="fas fa-headset me-1"></i> Get Support
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Quick Actions -->
<div class="col-md-6">
  <div class="card shadow-sm border-0 equal-height-card dashboard-card-light">
    <div class="card-header bg-white border-0">
      <h6 class="mb-0">Quick Actions</h6>
    </div>
    <div class="card-body p-0">
      <div class="quick-actions-container p-3">
        <div class="quick-actions-grid w-100">
          <button class="btn dashboard-btn-primary" disabled>
            <i class="fas fa-user-slash"></i>
            Self-Exclude
            <small>Already excluded</small>
          </button>
          <button class="btn dashboard-btn-success">
            <i class="fas fa-clipboard-check"></i>
            Risk Assessment
            <small>Take a screening test</small>
          </button>
          <button class="btn dashboard-btn-secondary">
            <i class="fas fa-user-cog"></i>
            Account Settings
            <small>Manage your profile</small>
          </button>
          <button class="btn dashboard-btn-info">
            <i class="fas fa-question-circle"></i>
            Get Help
            <small>Support & resources</small>
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

        <!-- Account Status -->
        <div class="col-md-6">
          <div class="card shadow-sm border-0 dashboard-card-light">
            <div class="card-header bg-white border-0">
              <h6 class="mb-0">Account Status</h6>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span>Status</span>
                <span class="badge badge-dashboard-success">Active</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span><i class="fas fa-check-circle text-success me-2"></i>Email Verified</span>
                <i class="fas fa-check text-success"></i>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span><i class="fas fa-check-circle text-success me-2"></i>Phone Verified</span>
                <i class="fas fa-check text-success"></i>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span><i class="fas fa-clock text-warning me-2"></i>ID Pending</span>
                <i class="fas fa-times text-warning"></i>
              </div>
              <button class="btn btn-sm dashboard-btn-primary w-100">
                <i class="fas fa-id-card me-1"></i> Complete Verification
              </button>
            </div>
          </div>
        </div>

        <!-- Helpful Resources -->
        <div class="col-md-6">
          <div class="card shadow-sm border-0 dashboard-card-light">
            <div class="card-header bg-white border-0">
              <h6 class="mb-0">Helpful Resources</h6>
            </div>
            <div class="card-body">
              <ul class="list-group list-group-dashboard">
                <li class="list-group-item border-0">
                  <i class="fas fa-arrow-right text-primary me-2"></i>How Self-Exclusion Works
                </li>
                <li class="list-group-item border-0">
                  <i class="fas fa-arrow-right text-primary me-2"></i>Frequently Asked Questions
                </li>
                <li class="list-group-item border-0">
                  <i class="fas fa-arrow-right text-primary me-2"></i>Contact Support
                </li>
                <li class="list-group-item border-0">
                  <i class="fas fa-arrow-right text-primary me-2"></i>Gambling Resources
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column -->
    <div class="col-lg-4">
      <!-- Your Exclusions -->
      <div class="card shadow-sm border-0 mb-3 dashboard-card-light">
        <div class="card-header bg-white border-0 d-flex justify-content-between align-items-center">
          <h6 class="mb-0">Your Exclusions</h6>
          <a href="#" class="small text-primary">View All →</a>
        </div>
        <div class="card-body">
          <div class="exclusion-card">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h6 class="mb-1">Active Exclusion</h6>
                <small class="text-muted">Self-Exclusion #4ce8ac94</small>
              </div>
              <span class="badge badge-dashboard-success">self</span>
            </div>
            
            <div class="row small mb-3">
              <div class="col-6 mb-2">
                <div class="text-muted">Start Date</div>
                <div class="fw-bold">11/11/2025</div>
              </div>
              <div class="col-6 mb-2">
                <div class="text-muted">End Date</div>
                <div class="fw-bold">11/11/2026</div>
              </div>
              <div class="col-6 mb-2">
                <div class="text-muted">Duration</div>
                <div class="fw-bold">365 days</div>
              </div>
              <div class="col-6 mb-2">
                <div class="text-muted">Days Remaining</div>
                <div class="fw-bold">363</div>
              </div>
              <div class="col-12">
                <div class="text-muted">Reason</div>
                <div class="fw-bold">Self-exclusion</div>
              </div>
            </div>
            
            <div class="d-flex gap-2">
              <button class="btn btn-sm dashboard-btn-warning flex-fill">
                <i class="fas fa-calendar-plus me-1"></i> Extend Period
              </button>
              <button class="btn btn-sm dashboard-btn-info flex-fill">
                <i class="fas fa-headset me-1"></i> Get Support
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
            <i class="fas fa-check-circle me-2"></i>Self-Exclusion Status — Active
          </div>
          <div class="alert alert-dashboard-success py-2 mb-2">
            <i class="fas fa-check-circle me-2"></i>Account Verification — Pending ID
          </div>
          <div class="alert alert-dashboard-success py-2 mb-2">
            <i class="fas fa-check-circle me-2"></i>Support Access — Available
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