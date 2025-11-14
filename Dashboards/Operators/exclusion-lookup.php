<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Exclusion Lookup | NSER Portal</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/exclusion-lookup.css">
</head>

<body>

<!-- Sidebar and Nav -->
<?php include './nav-sidebar.php'; ?>

  
<!-- Main Content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-1 dashboard-title">Exclusion Lookup</h4>
      <p class="text-muted mb-0">Real-time exclusion status check</p>
    </div>
    <button class="btn dashboard-btn-primary">
      <i class="fas fa-history me-1"></i> Lookup History
    </button>
  </div>

  <div class="row g-4">
    <!-- Left Column: Search Form -->
    <div class="col-lg-8">
      <div class="search-parameter-card">
        <h5 class="section-title">Search Parameters</h5>
        
        <div class="parameter-group">
          <div class="parameter-label">
            <i class="fas fa-phone me-2 text-primary"></i>Phone Number
          </div>
          <input type="text" class="form-control form-control-custom" placeholder="+254712345678" id="phoneNumber">
          <div class="parameter-hint">E.164 format (e.g., +254712345678)</div>
        </div>
        
        <div class="parameter-group">
          <div class="parameter-label">
            <i class="fas fa-id-card me-2 text-primary"></i>National ID
          </div>
          <input type="text" class="form-control form-control-custom" placeholder="National identification number" id="nationalId">
          <div class="parameter-hint">ID/Passport number</div>
        </div>
        
        <div class="parameter-group">
          <div class="parameter-label">
            <i class="fas fa-link me-2 text-primary"></i>BST Token
          </div>
          <input type="text" class="form-control form-control-custom" placeholder="Blockchain Secure Token" id="bstToken">
          <div class="parameter-hint">Optional blockchain token</div>
        </div>
        
        <div class="requirement-note">
          <i class="fas fa-info-circle me-2"></i>At least one search field is required
        </div>
        
        <button class="lookup-btn mt-4" id="checkStatusBtn">
          <i class="fas fa-search me-2"></i>Check Exclusion Status
        </button>
      </div>
      
      <!-- Results Section -->
      <div class="search-parameter-card">
        <h5 class="section-title">Lookup Results</h5>
        <div class="result-placeholder">
          <i class="fas fa-search"></i>
          <h6 class="mt-3">No search performed yet</h6>
          <p class="mb-0">Enter search parameters and click "Check Exclusion Status" to see results</p>
        </div>
      </div>
    </div>
    
    <!-- Right Column: How It Works -->
    <div class="col-lg-4">
      <div class="info-card">
        <h5 class="section-title mb-4">How It Works</h5>
        
        <div class="info-item">
          <div class="info-icon">
            <i class="fas fa-keyboard"></i>
          </div>
          <div class="info-content">
            <div class="info-title">Enter Identifiers</div>
            <div class="info-description">Enter at least one identifier (phone number, national ID, or BST token)</div>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-icon">
            <i class="fas fa-bolt"></i>
          </div>
          <div class="info-content">
            <div class="info-title">Instant Check</div>
            <div class="info-description">The system instantly checks against the exclusion register</div>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-icon">
            <i class="fas fa-tachometer-alt"></i>
          </div>
          <div class="info-content">
            <div class="info-title">Fast Response</div>
            <div class="info-description">Response times are typically under 100ms</div>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-icon">
            <i class="fas fa-database"></i>
          </div>
          <div class="info-content">
            <div class="info-title">Cached Results</div>
            <div class="info-description">Results are cached for performance and compliance audit trails</div>
          </div>
        </div>
        
        <div class="info-item">
          <div class="info-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <div class="info-content">
            <div class="info-title">Local Storage</div>
            <div class="info-description">Lookup history is stored locally in your browser (not on our servers)</div>
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