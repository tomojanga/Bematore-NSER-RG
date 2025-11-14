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
      <h4 class="dashboard-title">Settings</h4>
      <p class="text-muted mb-0">Manage your account and integration preferences</p>
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
              <a class="nav-link" href="#integration" data-bs-toggle="tab">
                <i class="fa-solid fa-plug me-2"></i> Integration
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

          <!-- Account Details -->
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-building"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:var(--primary-blue);">Account Information</h5>
                  <p class="text-muted mb-0">Your operator account details</p>
                </div>
              </div>

              <div class="profile-info">
                <div class="profile-field">
                  <div class="profile-label">Operator Name</div>
                  <div class="profile-value">ABC GAMING LTD</div>
                </div>
                <div class="profile-field">
                  <div class="profile-label">Email</div>
                  <div class="profile-value">operator@abcgamingltd.com</div>
                  <small class="text-muted">Email cannot be changed</small>
                </div>
                <div class="profile-field">
                  <div class="profile-label">Phone</div>
                  <div class="profile-value">+254708914028</div>
                </div>
                <div class="profile-field">
                  <div class="profile-label">Website</div>
                  <div class="profile-value">https://www.abcgamingltd.com</div>
                </div>
                <div class="profile-field">
                  <div class="profile-label">Timezone</div>
                  <div class="profile-value">UTC</div>
                </div>
                <div class="profile-field">
                  <div class="profile-label">Country</div>
                  <div class="profile-value">Kenya</div>
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
                  <h5 class="fw-bold mb-0" style="color:var(--primary-blue);">Profile</h5>
                  <p class="text-muted mb-0">View and manage your profile information</p>
                </div>
                <button class="btn btn-primary-custom ms-auto">
                  <i class="fa-solid fa-pen me-2"></i> Edit Profile
                </button>
              </div>

              <div class="text-center mb-4">
                <div class="profile-avatar">A</div>
                <h4 class="fw-bold mb-1">ABC GAMING LTD</h4>
                <p class="text-muted">Operator</p>
              </div>

              <div class="profile-info">
                <div class="profile-field">
                  <div class="profile-label">Email</div>
                  <div class="profile-value">operator@abcgamingltd.com</div>
                </div>
                <div class="profile-field">
                  <div class="profile-label">Phone</div>
                  <div class="profile-value">+254708914028</div>
                </div>
                <div class="profile-field">
                  <div class="profile-label">Member Since</div>
                  <div class="profile-value">12/11/2025</div>
                </div>
              </div>

              <div class="settings-section mt-4">
                <h6 class="fw-semibold mb-3">Operator Information</h6>
                <div class="profile-info">
                  <div class="profile-field">
                    <div class="profile-label">Operator Name</div>
                    <div class="profile-value">ABC GAMING LTD</div>
                  </div>
                  <div class="profile-field">
                    <div class="profile-label">License Status</div>
                    <div class="profile-value">
                      <span class="verification-badge badge-active">Active</span>
                    </div>
                  </div>
                  <div class="profile-field">
                    <div class="profile-label">License Expiry</div>
                    <div class="profile-value">0</div>
                  </div>
                </div>
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

        <!-- Integration Tab -->
        <div class="tab-pane fade" id="integration">
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-plug"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:var(--primary-blue);">Integration Settings</h5>
                  <p class="text-muted mb-0">Configure your API and integration preferences</p>
                </div>
              </div>

              <div class="settings-section">
                <div class="integration-field">
                  <label class="integration-label">API Rate Limit (requests/second)</label>
                  <input type="number" class="form-control" value="100">
                  <div class="integration-hint">Default: 100 requests/second</div>
                </div>

                <div class="integration-field">
                  <label class="integration-label">Webhook Retry Count</label>
                  <input type="number" class="form-control" value="5">
                  <div class="integration-hint">Failed webhooks will be retried this many times</div>
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