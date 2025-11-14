<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Citizen Login | NSER</title>

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
            <i class="fas fa-user-shield"></i>
          </div>
          <h1 class="portal-title">Citizen Portal</h1>
          <p class="portal-subtitle">Access your self-exclusion account</p>
          <p>Manage your self-exclusion preferences and protect yourself from gambling harm.</p>
        </div>
      </div>

      <!-- Right Side -->
      <div class="col-lg-7 right-side">
        <div class="form-container">
          <h2 class="form-title">Sign In</h2>
          <p class="form-subtitle">Enter your credentials to access your account</p>
          
          <form id="loginForm">
            <div class="mb-4">
              <label class="form-label">Phone Number *</label>
              <input type="tel" class="form-control" placeholder="+254712345678" required>
            </div>
            
            <div class="mb-4">
              <label class="form-label">Password *</label>
              <input type="password" class="form-control" placeholder="••••••••" required>
            </div>
            
            <button type="submit" class="btn btn-primary">Sign In</button>
            
            <div class="form-footer">
              <a href="signup.php" class="signup-link">Don't have an account? Sign up</a>
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
      const phone = this.querySelector('input[type="tel"]').value;
      const password = this.querySelector('input[type="password"]').value;
      
      // Basic validation
      if (!phone || !password) {
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