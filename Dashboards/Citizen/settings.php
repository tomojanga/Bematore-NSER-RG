<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Settings | NSER Portal</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/settings.css">

</head>

<body>

<?php include './nav-sidebar.php'; ?>

<div class="main-content p-4 bg-light" id="mainContent">

  <!-- Header -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="dashboard-title">Account Settings</h4>
      <p class="text-muted mb-0">Manage your profile, security, and preferences</p>
    </div>
  </div>

  <div class="row">
    <!-- Settings Navigation -->
    <div class="col-lg-3 mb-4">
      <div class="card settings-card">
        <div class="card-body">
          <h6 class="fw-semibold text-muted mb-3">Settings</h6>
          <ul class="nav nav-pills flex-column">
            <li class="nav-item">
              <a class="nav-link active" href="#account" data-bs-toggle="tab">
                <i class="fa-solid fa-user me-2"></i> Account
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#profile" data-bs-toggle="tab">
                <i class="fa-solid fa-id-card me-2"></i> Profile
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#security" data-bs-toggle="tab">
                <i class="fa-solid fa-shield-halved me-2"></i> Security
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#notifications" data-bs-toggle="tab">
                <i class="fa-solid fa-bell me-2"></i> Notifications
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#general" data-bs-toggle="tab">
                <i class="fa-solid fa-gear me-2"></i> General
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#multilingual" data-bs-toggle="tab">
                <i class="fa-solid fa-language me-2"></i> Language
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Settings Content -->
    <div class="col-lg-9">
      <div class="tab-content">
        
        <!-- Account Tab -->
        <div class="tab-pane fade show active" id="account">
          <!-- Account Information -->
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-circle-info"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:var(--primary-blue);">Account Information</h5>
                  <p class="text-muted mb-0">Your account details and status</p>
                </div>
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Account Created</span>
                  <span class="info-value">08/11/2025</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Last Login</span>
                  <span class="info-value">14/11/2025</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Account Status</span>
                  <span class="verification-badge badge-active">Active</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Verification Status</span>
                  <span class="verification-badge badge-pending">Pending</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Verification Status -->
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-shield-check"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:var(--primary-blue);">Verification Status</h5>
                  <p class="text-muted mb-0">Complete verification for full account access</p>
                </div>
              </div>

              <div class="verification-item">
                <div class="verification-content">
                  <h6 class="fw-bold mb-1">Email Verification</h6>
                  <p class="text-muted mb-0 small">Confirm your email address</p>
                </div>
                <div class="d-flex align-items-center gap-3">
                  <span class="verification-badge badge-verified">Verified</span>
                </div>
              </div>

              <div class="verification-item">
                <div class="verification-content">
                  <h6 class="fw-bold mb-1">Phone Verification</h6>
                  <p class="text-muted mb-0 small">Confirm your phone number</p>
                </div>
                <div class="d-flex align-items-center gap-3">
                  <span class="verification-badge badge-verified">Verified</span>
                </div>
              </div>

              <div class="verification-item">
                <div class="verification-content">
                  <h6 class="fw-bold mb-1">ID Verification</h6>
                  <p class="text-muted mb-0 small">Verify your national ID</p>
                </div>
                <div class="d-flex align-items-center gap-3">
                  <span class="verification-badge badge-pending">Pending</span>
                  <button class="btn btn-primary-custom btn-sm">Verify Now</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Tab -->
        <div class="tab-pane fade" id="profile">
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-user-edit"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:var(--primary-blue);">Profile Information</h5>
                  <p class="text-muted mb-0">Update your personal details</p>
                </div>
              </div>

              <div class="settings-section">
                <h6 class="fw-semibold mb-3">Personal Details</h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">First Name</label>
                    <input type="text" class="form-control" value="John">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Last Name</label>
                    <input type="text" class="form-control" value="Doe">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Phone Number</label>
                    <input type="tel" class="form-control" value="+254712345678">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Email Address</label>
                    <input type="email" class="form-control" value="john.doe@example.com">
                  </div>
                </div>
              </div>

              <div class="settings-section">
                <h6 class="fw-semibold mb-3">Identification (Read-only)</h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">National ID</label>
                    <input type="text" class="form-control" value="12345678" readonly>
                    <small class="text-muted">ID number cannot be changed</small>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Date of Birth</label>
                    <input type="text" class="form-control" value="15/03/1985" readonly>
                    <small class="text-muted">Date of birth cannot be changed</small>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <button class="btn btn-primary-custom">
                  <i class="fa-solid fa-floppy-disk me-2"></i> Save Changes
                </button>
                <button class="btn btn-outline-custom ms-2">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Security Tab -->
        <div class="tab-pane fade" id="security">
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-lock"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:var(--primary-blue);">Security Settings</h5>
                  <p class="text-muted mb-0">Manage your password and security preferences</p>
                </div>
              </div>

              <div class="settings-section">
                <h6 class="fw-semibold mb-3">Change Password</h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Current Password</label>
                    <input type="password" class="form-control" placeholder="Enter current password">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">New Password</label>
                    <input type="password" class="form-control" placeholder="Enter new password">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Confirm New Password</label>
                    <input type="password" class="form-control" placeholder="Confirm new password">
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <button class="btn btn-primary-custom">
                  <i class="fa-solid fa-key me-2"></i> Update Password
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Notifications Tab -->
        <div class="tab-pane fade" id="notifications">
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-bell"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:var(--primary-blue);">Notification Preferences</h5>
                  <p class="text-muted mb-0">Choose how you want to receive notifications</p>
                </div>
              </div>

              <div class="settings-section">
                <h6 class="fw-semibold mb-3">Email Notifications</h6>
                <div class="form-check form-switch mb-3">
                  <input class="form-check-input" type="checkbox" id="emailAlerts" checked>
                  <label class="form-check-label" for="emailAlerts">
                    Self-exclusion reminders
                  </label>
                </div>
                <div class="form-check form-switch mb-3">
                  <input class="form-check-input" type="checkbox" id="assessmentReminders" checked>
                  <label class="form-check-label" for="assessmentReminders">
                    Risk assessment reminders
                  </label>
                </div>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="systemUpdates">
                  <label class="form-check-label" for="systemUpdates">
                    System updates and news
                  </label>
                </div>
              </div>

              <div class="settings-section">
                <h6 class="fw-semibold mb-3">SMS Notifications</h6>
                <div class="form-check form-switch">
                  <input class="form-check-input" type="checkbox" id="smsAlerts" checked>
                  <label class="form-check-label" for="smsAlerts">
                    Important alerts via SMS
                  </label>
                </div>
              </div>

              <div class="mt-4">
                <button class="btn btn-primary-custom">
                  <i class="fa-solid fa-save me-2"></i> Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- General Settings Tab -->
        <div class="tab-pane fade" id="general">
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-gear"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:var(--primary-blue);">General Settings</h5>
                  <p class="text-muted mb-0">System configuration and preferences</p>
                </div>
              </div>

              <div class="settings-section">
                <h6 class="fw-semibold mb-3">System Information</h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">System Name</label>
                    <input type="text" class="form-control" value="NSER Self-Exclusion System">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Support Email</label>
                    <input type="email" class="form-control" value="support@nser.go.ke">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Contact Phone</label>
                    <input type="text" class="form-control" value="+254 700 123 456">
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <button class="btn btn-primary-custom">
                  <i class="fa-solid fa-floppy-disk me-2"></i> Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Multilingual Tab -->
        <div class="tab-pane fade" id="multilingual">
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-language"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:var(--primary-blue);">Language Settings</h5>
                  <p class="text-muted mb-0">Select your preferred language</p>
                </div>
              </div>

              <div class="settings-section">
                <div class="row">
                  <div class="col-md-8">
                    <label class="form-label fw-semibold">Select Language</label>
                    <select class="form-select">
                      <option value="en" selected>
                        <div class="language-option">
                          <img src="../Media/flags/kenya.png" class="language-flag" alt="Kenya Flag">
                          English (Kenya)
                        </div>
                      </option>
                      <option value="sw">
                        <div class="language-option">
                          <img src="../Media/flags/kenya.png" class="language-flag" alt="Kenya Flag">
                          Swahili (Kiswahili)
                        </div>
                      </option>
                      <option value="fr">
                        <div class="language-option">
                          <img src="../Media/flags/france.png" class="language-flag" alt="France Flag">
                          French (Français)
                        </div>
                      </option>
                      <option value="am">
                        <div class="language-option">
                          <img src="../Media/flags/ethiopia.png" class="language-flag" alt="Ethiopia Flag">
                          Amharic (አማርኛ)
                        </div>
                      </option>
                      <option value="ha">
                        <div class="language-option">
                          <img src="../Media/flags/nigeria.png" class="language-flag" alt="Nigeria Flag">
                          Hausa
                        </div>
                      </option>
                      <option value="so">
                        <div class="language-option">
                          <img src="../Media/flags/somalia.png" class="language-flag" alt="Somalia Flag">
                          Somali
                        </div>
                      </option>
                      <option value="yo">
                        <div class="language-option">
                          <img src="../Media/flags/nigeria.png" class="language-flag" alt="Nigeria Flag">
                          Yoruba
                        </div>
                      </option>
                      <option value="zu">
                        <div class="language-option">
                          <img src="../Media/flags/south-africa.png" class="language-flag" alt="South Africa Flag">
                          Zulu
                        </div>
                      </option>
                    </select>
                    <small class="text-muted">Click the dropdown to see all available languages</small>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <button class="btn btn-primary-custom">
                  <i class="fa-solid fa-floppy-disk me-2"></i> Save Language Settings
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>

</div>

<!-- Bootstrap JS -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="JS/index.js"></script>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    // Tab functionality 
    const triggerTabList = document.querySelectorAll('.nav-pills .nav-link')
    triggerTabList.forEach(triggerEl => {
      triggerEl.addEventListener('click', function (e) {
        e.preventDefault()
        const tabTrigger = new bootstrap.Tab(this)
        tabTrigger.show()
      })
    })
  });
</script>

</body>
</html>