<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>GRAK Portal | NSER</title>

  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Font Awesome -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Custom CSS -->
   <link rel="stylesheet" href="./CSS/login.css">
   <!-- Favicon -->
    <link rel="shortcut icon" href="../Media/nser-icon.png" type="image/x-icon">
</head>
<body>

  <div class="registration-container">
    <div class="row g-0 h-80">
      <!-- Left Side -->
      <div class="col-lg-5 left-side">
        <div class="portal-content">
          <div class="portal-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <h1 class="portal-title">GRAK Portal</h1>
          <p class="portal-subtitle">Access regulatory dashboard and analytics</p>
          <p>Monitor compliance statistics, view operator reports, and manage regulatory oversight.</p>
        </div>
      </div>

      <!-- Right Side -->
      <div class="col-lg-7 right-side">
        <div class="form-container">
          <h2 class="form-title">Administrator Login</h2>
          <p class="form-subtitle">Enter your credentials to access the regulatory dashboard</p>
          
          <form id="loginForm">
            <div class="mb-4">
              <label class="form-label">Username *</label>
              <input type="text" class="form-control" placeholder="Enter your username" required>
            </div>
            
            <div class="mb-4">
              <label class="form-label">Password *</label>
              <input type="password" class="form-control" placeholder="••••••••" required>
            </div>
            
            <button type="submit" class="btn btn-primary">Access Dashboard</button>
            
            <div class="form-footer">
              <a href="forgot-password.php" class="forgot-link">Forgot Password?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Form submission handling
    document.getElementById('loginForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const username = this.querySelector('input[type="text"]').value;
      const password = this.querySelector('input[type="password"]').value;
      
      // Basic validation
      if (!username || !password) {
        alert('Please fill in all required fields');
        return;
      }
      
    });

    // Real-time validation
    document.querySelectorAll('input[required]').forEach(input => {
      input.addEventListener('blur', function() {
        if (!this.value.trim()) {
          this.classList.add('is-invalid');
        } else {
          this.classList.remove('is-invalid');
        }
      });
    });
  </script>

</body>
</html>