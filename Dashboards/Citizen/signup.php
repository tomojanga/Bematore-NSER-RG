<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Citizen Portal | NSER</title>

  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Font Awesome -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Custom CSS -->
   <link rel="stylesheet" href="./CSS/signup.css">
   <!-- Favicon -->
    <link rel="shortcut icon" href="../Media/nser-icon.png" type="image/x-icon">
</head>
<body>

  <div class="registration-container">
    <div class="row g-0 h-80">
      <!-- Left Side  -->
      <div class="col-lg-5 left-side">
        <div class="portal-content">
          <div class="portal-icon">
            <i class="fas fa-user-shield"></i>
          </div>
          <h1 class="portal-title">Citizen Portal</h1>
          <p class="portal-subtitle">Take control of your gambling habits with the National Self-Exclusion Register</p>
          <p>Protect yourself and your loved ones by registering for self-exclusion from all licensed gambling operators in Kenya.</p>
        </div>
      </div>

      <!-- Right Side -->
      <div class="col-lg-7 right-side">
        <div class="form-container">
          <h2 class="form-title">Create Account</h2>
          <p class="form-subtitle">Register for self-exclusion</p>
          
          <form id="citizenForm">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">First Name *</label>
                <input type="text" class="form-control" placeholder="John" required>
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Last Name *</label>
                <input type="text" class="form-control" placeholder="Doe" required>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Phone Number *</label>
              <input type="tel" class="form-control" placeholder="+254712345678" required>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Email *</label>
              <input type="email" class="form-control" placeholder="your.email@example.com" required>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Password *</label>
              <input type="password" class="form-control" placeholder="••••••••" required oninput="checkPasswordStrength(this.value)">
              <small class="text-muted">Minimum 8 characters, with numbers and symbols</small>
              <div class="password-strength">
                <div class="password-strength-bar" id="passwordStrength"></div>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Confirm Password *</label>
              <input type="password" class="form-control" placeholder="••••••••" required>
            </div>
            
            <div class="terms-section">
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="termsCheck" required>
                <label class="form-check-label" for="termsCheck">
                  I accept the <a href="#">terms and conditions</a>
                </label>
              </div>
              
              <div class="form-check">
                <input class="form-check-input" type="checkbox" id="privacyCheck" required>
                <label class="form-check-label" for="privacyCheck">
                  I accept the <a href="#">privacy policy</a>
                </label>
              </div>
            </div>
            
            <button type="submit" class="btn btn-primary mt-4">Create Account</button>
            
            <div class="login-link">
              Already have an account? <a href="login.php">Sign in</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>

  <script>
    // Password strength indicator
    function checkPasswordStrength(password) {
      const strengthBar = document.getElementById('passwordStrength');
      let strength = 0;
      
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;
      
      strengthBar.style.width = strength + '%';
      
      if (strength < 50) {
        strengthBar.style.background = '#dc3545';
      } else if (strength < 75) {
        strengthBar.style.background = '#ffc107';
      } else {
        strengthBar.style.background = '#28a745';
      }
    }

    // Form submission handling
    document.getElementById('citizenForm').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form values
      const firstName = this.querySelector('input[placeholder="John"]').value;
      const lastName = this.querySelector('input[placeholder="Doe"]').value;
      const phone = this.querySelector('input[type="tel"]').value;
      const email = this.querySelector('input[type="email"]').value;
      const password = this.querySelectorAll('input[type="password"]')[0].value;
      const confirmPassword = this.querySelectorAll('input[type="password"]')[1].value;
      const termsChecked = document.getElementById('termsCheck').checked;
      const privacyChecked = document.getElementById('privacyCheck').checked;
      
      // Basic validation
      if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
        alert('Please fill in all required fields');
        return;
      }
      
      // Phone number validation 
      const phoneRegex = /^(\+?254|0)[17]\d{8}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        alert('Please enter a valid Kenyan phone number');
        return;
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
      }
      
      // Password validation
      if (password.length < 8) {
        alert('Password must be at least 8 characters long');
        return;
      }
      
      // Confirm password
      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      
      // Check terms and privacy policy
      if (!termsChecked || !privacyChecked) {
        alert('Please accept both the terms and conditions and privacy policy');
        return;
      }
      

  </script>

</body>
</html>