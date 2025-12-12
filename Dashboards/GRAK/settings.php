<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Settings | Regulator Dashboard</title>

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
      <h4 class="dashboard-title">System Settings</h4>
      <p class="text-muted mb-0">Configure system preferences, security, and integration settings</p>
    </div>
    <div>
      <button class="btn dashboard-btn-secondary me-2">
        <i class="fa-solid fa-download me-2"></i> Export Config
      </button>

    </div>
  </div>

  <div class="row">
    <!-- Settings Navigation -->
    <div class="col-lg-3 mb-4">
      <div class="card settings-card">
        <div class="card-body">
          <h6 class="fw-semibold text-muted mb-3">Configuration Sections</h6>
          <ul class="nav nav-pills flex-column">
            <li class="nav-item">
              <a class="nav-link active" href="#general" data-bs-toggle="tab">
                <i class="fa-solid fa-gear me-2"></i> General Settings
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#notifications" data-bs-toggle="tab">
                <i class="fa-solid fa-bell me-2"></i> Notifications
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" href="#multilingual" data-bs-toggle="tab">
                <i class="fa-solid fa-language me-2"></i> Multilingual
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Settings Content -->
    <div class="col-lg-9">
      <div class="tab-content">
        
        <!-- General Settings -->
        <div class="tab-pane fade show active" id="general">
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-gear"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:#1e5aa8;">General System Settings</h5>
                  <p class="text-muted mb-0">Basic system configuration and preferences</p>
                </div>
              </div>

              <div class="settings-section">
                <h6 class="fw-semibold mb-3">System Information</h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">System Name</label>
                    <input type="text" class="form-control" value="GRAK Compliance System">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Support Email</label>
                    <input type="email" class="form-control" value="support@grak.go.ke">
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Contact Phone</label>
                    <input type="text" class="form-control" value="+254 700 123 456">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Notification Settings -->
        <div class="tab-pane fade" id="notifications">
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-bell"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:#1e5aa8;">Notification Settings</h5>
                  <p class="text-muted mb-0">Configure alerts and notification preferences</p>
                </div>
              </div>

              <div class="settings-section">
                <h6 class="fw-semibold mb-3">Email Notifications</h6>
                <div class="row g-3">
                  <div class="col-12">
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" id="emailAlerts" checked>
                      <label class="form-check-label" for="emailAlerts">
                        Enable Email Alerts
                      </label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Admin Email</label>
                    <input type="email" class="form-control" value="admin@grak.go.ke">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Multilingual Support -->
        <div class="tab-pane fade" id="multilingual">
          <div class="card settings-card">
            <div class="card-body">
              <div class="d-flex align-items-center mb-4">
                <div class="settings-icon">
                  <i class="fa-solid fa-language"></i>
                </div>
                <div>
                  <h5 class="fw-bold mb-0" style="color:#1e5aa8;">Language Settings</h5>
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
                <button class="btn dashboard-btn-primary">
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
    // Initialize tab functionality
    const triggerTabList = document.querySelectorAll('#myTab button')
    triggerTabList.forEach(triggerEl => {
      const tabTrigger = new bootstrap.Tab(triggerEl)
      triggerEl.addEventListener('click', event => {
        event.preventDefault()
        tabTrigger.show()
      })
    })
  });
</script>

</body>
</html>