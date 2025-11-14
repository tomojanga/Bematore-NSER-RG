<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>User Management | GRAK Dashboard</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/users.css">
</head>

<body>

<?php include './nav-sidebar.php'; ?>

<div class="main-content p-4 bg-light" id="mainContent">

  <!-- Header -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="dashboard-title">User Management</h4>
      <p class="text-muted mb-0">Manage system users, permissions, and access controls</p>
    </div>
    <div>
      <button class="btn dashboard-btn-secondary me-2">
        <i class="fa-solid fa-download me-2"></i> Export Users
      </button>

    </div>
  </div>

  <!-- Quick Stats -->
  <div class="row g-3 mb-4">
    <div class="col-md-3">
      <div class="card user-card bg-white equal-height" style="border-left-color: #1e5aa8 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Total Users</h6>
              <h3 class="fw-bold mb-0" style="color:#1e5aa8;">15</h3>
              <small class="text-muted">Registered in system</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(30, 90, 168, 0.1); color: #1e5aa8;">
              <i class="fa-solid fa-users"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card user-card bg-white equal-height" style="border-left-color: #28a745 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Active Users</h6>
              <h3 class="fw-bold mb-0 text-success">12</h3>
              <small class="text-muted">Currently active</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(40, 167, 69, 0.1); color: #28a745;">
              <i class="fa-solid fa-user-check"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card user-card bg-white equal-height" style="border-left-color: #ffc107 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h6 class="text-muted mb-1">Pending Activation</h6>
              <h3 class="fw-bold mb-0 text-warning">2</h3>
              <small class="text-muted">Awaiting approval</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(255, 193, 7, 0.1); color: #ffc107;">
              <i class="fa-solid fa-user-clock"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-3">
      <div class="card user-card bg-white equal-height" style="border-left-color: #dc3545 !important;">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h6 class="text-muted mb-1">Suspended Users</h6>
              <h3 class="fw-bold mb-0 text-danger">3</h3>
              <small class="text-muted">Accounts deactivated</small>
            </div>
            <div class="stats-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545;">
              <i class="fa-solid fa-user-slash"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Filters and Search -->
  <div class="card user-card mb-4">
    <div class="card-body py-3">
      <div class="row g-3 align-items-end">
        <div class="col-md-4">
          <div class="search-box-custom">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search users by name, email, or role...">
          </div>
        </div>
        <div class="col-md-2">
          <label class="form-label small text-muted mb-1">Status</label>
          <select class="form-select form-select-sm">
            <option selected>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Suspended</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small text-muted mb-1">Role</label>
          <select class="form-select form-select-sm">
            <option selected>All Roles</option>
            <option>Administrator</option>
            <option>Compliance Officer</option>
            <option>Auditor</option>
            <option>Operator Manager</option>
          </select>
        </div>
        <div class="col-md-2">
          <label class="form-label small text-muted mb-1">Department</label>
          <select class="form-select form-select-sm">
            <option selected>All Departments</option>
            <option>Compliance</option>
            <option>Operations</option>
            <option>IT</option>
            <option>Finance</option>
          </select>
        </div>
        <div class="col-md-2">
          <button class="btn btn-sm dashboard-btn-primary w-100">
            <i class="fa-solid fa-filter me-1"></i> Apply
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Users Table -->
 <div class="card user-card">
  <div class="card-body">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h6 class="fw-semibold text-muted mb-0">
        <i class="fa-solid fa-list me-2 text-primary"></i>System Users
      </h6>
      <div class="text-muted small">Showing 10 of 15 users</div>
    </div>

    <div class="table-responsive">
      <table class="table table-striped align-middle">
        <thead>
          <tr>
            <th>Last Login</th>
            <th>IP Address</th>
            <th>Login Count</th>
            <th>Device / Browser</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="fw-semibold">Today, 14:23</div>
              <small class="text-muted">28 Oct 2025</small>
            </td>
            <td>192.168.1.45</td>
            <td>1,247</td>
            <td><i class="fa-brands fa-chrome text-success me-1"></i> Chrome (Windows)</td>
          </tr>

          <tr>
            <td>
              <div class="fw-semibold">Today, 13:45</div>
              <small class="text-muted">28 Oct 2025</small>
            </td>
            <td>192.168.1.67</td>
            <td>892</td>
            <td><i class="fa-brands fa-apple text-dark me-1"></i> Safari (Mac)</td>
          </tr>

          <tr>
            <td>
              <div class="fw-semibold">Yesterday, 16:30</div>
              <small class="text-muted">27 Oct 2025</small>
            </td>
            <td>192.168.1.89</td>
            <td>1,045</td>
            <td><i class="fa-brands fa-firefox-browser text-warning me-1"></i> Firefox (Linux)</td>
          </tr>

          <tr>
            <td>
              <div class="fw-semibold">15 Oct 2025, 09:15</div>
              <small class="text-muted">2 weeks ago</small>
            </td>
            <td>192.168.1.92</td>
            <td>567</td>
            <td><i class="fa-solid fa-mobile-screen text-primary me-1"></i> Mobile (Android)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-footer bg-white border-0 d-flex justify-content-between align-items-center">
      <div class="text-muted small">Showing 10 of 15 users</div>
      <nav>
        <ul class="pagination pagination-sm mb-0">
          <li class="page-item disabled"><a class="page-link" href="#">Previous</a></li>
          <li class="page-item active"><a class="page-link" href="#">1</a></li>
          <li class="page-item"><a class="page-link" href="#">2</a></li>
          <li class="page-item"><a class="page-link" href="#">Next</a></li>
        </ul>
      </nav>
    </div>
  </div>
</div>

  <!-- User Activity Summary -->
  <div class="row g-4 mt-4">
    <div class="col-md-6">
      <div class="card user-card">
        <div class="card-body">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-bar me-2 text-primary"></i>User Activity Summary</h6>
          <div class="row g-3">
            <div class="col-6">
              <div class="text-center">
                <h4 class="fw-bold text-primary">80%</h4>
                <small class="text-muted">Active This Week</small>
                <div class="progress mt-1" style="height: 6px;">
                  <div class="progress-bar bg-primary" style="width: 80%"></div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="text-center">
                <h4 class="fw-bold text-success">12</h4>
                <small class="text-muted">Logins Today</small>
                <div class="progress mt-1" style="height: 6px;">
                  <div class="progress-bar bg-success" style="width: 60%"></div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="text-center">
                <h4 class="fw-bold text-warning">3</h4>
                <small class="text-muted">Password Resets</small>
                <div class="progress mt-1" style="height: 6px;">
                  <div class="progress-bar bg-warning" style="width: 15%"></div>
                </div>
              </div>
            </div>
            <div class="col-6">
              <div class="text-center">
                <h4 class="fw-bold text-info">67%</h4>
                <small class="text-muted">2FA Enabled</small>
                <div class="progress mt-1" style="height: 6px;">
                  <div class="progress-bar bg-info" style="width: 67%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card user-card">
        <div class="card-body">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-clock-rotate-left me-2 text-primary"></i>Recent User Activities</h6>
          <div class="list-group list-group-flush">
            <div class="list-group-item px-0">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-success me-2">Login</span>
                  <small>John Doe logged in from 192.168.1.45</small>
                </div>
                <small class="text-muted">2 min ago</small>
              </div>
            </div>
            <div class="list-group-item px-0">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-warning me-2">Password</span>
                  <small>Lisa Thompson reset password</small>
                </div>
                <small class="text-muted">15 min ago</small>
              </div>
            </div>
            <div class="list-group-item px-0">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-info me-2">Profile</span>
                  <small>Sarah Wilson updated profile information</small>
                </div>
                <small class="text-muted">1 hour ago</small>
              </div>
            </div>
            <div class="list-group-item px-0">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="badge bg-danger me-2">Suspended</span>
                  <small>Robert Kim account suspended by Admin</small>
                </div>
                <small class="text-muted">2 hours ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</div>

<!-- Charts.js -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="JS/index.js"></script>

</body>
</html>