<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Operators Portal | NSER</title>

  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Font Awesome -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Custom CSS -->
   <link rel="stylesheet" href="./CSS/signup.css">
   <!-- Favicon -->
    <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
</head>
<body>

  <div class="registration-container">
    <div class="row g-0">
      <!-- Left Side  -->
      <div class="col-lg-5 left-side">
        <div class="portal-content">
          <div class="portal-icon">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h1 class="portal-title">Operators Portal</h1>
          <p class="portal-subtitle">Register your gambling business with the National Self-Exclusion Register</p>
          <p>Join Kenya's premier responsible gambling ecosystem and ensure compliance with regulatory requirements.</p>
        </div>
      </div>

      <!-- Right Side  -->
      <div class="col-lg-7 right-side">
        <div class="form-container">
          <!-- Step Indicator -->
          <div class="step-indicator">
            <div class="step active" id="step1">1</div>
            <div class="step" id="step2">2</div>
            <div class="step" id="step3">3</div>
          </div>

          <!-- Step 1: Business Information -->
          <form class="form-step active" id="step1-form">
            <div class="form-section">
              <h3 class="section-title">Business Information</h3>
              
              <div class="mb-3">
                <label class="form-label">Operator Name *</label>
                <input type="text" class="form-control" placeholder="e.g., ABC Gaming Ltd" required>
                <div class="error-message">Operator name is required</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Business Registration Number *</label>
                <input type="text" class="form-control" placeholder="e.g., REG-2024-12345" required>
                <div class="error-message">Business registration number is required</div>
              </div>

              <div class="mb-3">
                <label class="form-label">License Type *</label>
                <select class="form-control" required>
                  <option value="">Select License Type</option>
                  <option value="online">Online Betting</option>
                  <option value="casino">Land-Based Casino</option>
                  <option value="lottery">Lottery Operator</option>
                  <option value="sports">Sports Betting</option>
                </select>
                <div class="error-message">Please select a license type</div>
              </div>

              <div class="mb-3">
                <label class="form-label">License Number *</label>
                <input type="text" class="form-control" placeholder="e.g., LIC-2024-001" required>
                <div class="error-message">License number is required</div>
              </div>

              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">License Issued Date *</label>
                  <input type="date" class="form-control" required>
                  <div class="error-message">Issued date is required</div>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">License Expiry Date *</label>
                  <input type="date" class="form-control" required>
                  <div class="error-message">Expiry date is required</div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Website URL</label>
                <input type="url" class="form-control" placeholder="https://youroperator.com">
              </div>

              <div class="mb-3">
                <label class="form-label">Physical Address *</label>
                <textarea class="form-control" rows="3" placeholder="Enter complete physical address" required></textarea>
                <div class="error-message">Physical address is required</div>
              </div>
            </div>

            <div class="button-group">
              <button type="button" class="btn btn-primary" onclick="validateStep1()">Next</button>
            </div>
          </form>

          <!-- Step 2: Contact Information -->
          <form class="form-step" id="step2-form">
            <div class="form-section">
              <h3 class="section-title">Contact Information</h3>
              
              <div class="mb-3">
                <label class="form-label">Email Address *</label>
                <input type="email" class="form-control" placeholder="operator@company.com" required>
                <div class="error-message">Valid email address is required</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Phone Number *</label>
                <input type="tel" class="form-control" placeholder="+254712345678" required>
                <div class="error-message">Phone number is required</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Contact Person Name *</label>
                <input type="text" class="form-control" placeholder="John Doe" required>
                <div class="error-message">Contact person name is required</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Contact Person Phone *</label>
                <input type="tel" class="form-control" placeholder="+254712345678" required>
                <div class="error-message">Contact person phone is required</div>
              </div>
            </div>

            <div class="button-group">
              <button type="button" class="btn btn-outline-primary" onclick="prevStep(1)">Previous</button>
              <button type="button" class="btn btn-primary" onclick="validateStep2()">Next</button>
            </div>
          </form>

          <!-- Step 3: Account Credentials -->
          <form class="form-step" id="step3-form">
            <div class="form-section">
              <h3 class="section-title">Create Your Account</h3>
              
              <div class="mb-3">
                <label class="form-label">Password *</label>
                <input type="password" class="form-control" placeholder="••••••••" required oninput="checkPasswordStrength(this.value)">
                <small class="text-muted">Minimum 8 characters, with numbers and symbols</small>
                <div class="password-strength">
                  <div class="password-strength-bar" id="passwordStrength"></div>
                </div>
                <div class="error-message">Password must meet requirements</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Confirm Password *</label>
                <input type="password" class="form-control" placeholder="••••••••" required>
                <div class="error-message">Passwords must match</div>
              </div>

              <div class="form-check terms-check">
                <input class="form-check-input" type="checkbox" id="termsCheck" required>
                <label class="form-check-label" for="termsCheck">
                  I agree to the <a href="#">Terms and Conditions</a> and confirm all information is accurate
                </label>
                <div class="error-message">You must agree to the terms</div>
              </div>
            </div>

            <div class="button-group">
              <button type="button" class="btn btn-outline-primary" onclick="prevStep(2)">Previous</button>
              <button type="submit" class="btn btn-primary" id="submitBtn">Create Account</button>
            </div>
          </form>

          <!-- Login Link -->
          <div class="login-link">
            Already have an account? <a href="login.php">Sign in here</a>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    let currentStep = 1;

    function validateStep1() {
      const form = document.getElementById('step1-form');
      const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
      let isValid = true;

      inputs.forEach(input => {
        const error = input.parentElement.querySelector('.error-message');
        if (!input.value.trim()) {
          input.classList.add('is-invalid');
          error.style.display = 'block';
          isValid = false;
        } else {
          input.classList.remove('is-invalid');
          error.style.display = 'none';
        }
      });

      if (isValid) {
        nextStep(2);
      }
    }

    function validateStep2() {
      const form = document.getElementById('step2-form');
      const inputs = form.querySelectorAll('input[required]');
      let isValid = true;

      inputs.forEach(input => {
        const error = input.parentElement.querySelector('.error-message');
        if (!input.value.trim()) {
          input.classList.add('is-invalid');
          error.style.display = 'block';
          isValid = false;
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
          input.classList.add('is-invalid');
          error.style.display = 'block';
          isValid = false;
        } else {
          input.classList.remove('is-invalid');
          error.style.display = 'none';
        }
      });

      if (isValid) {
        nextStep(3);
      }
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function nextStep(step) {
      currentStep = step;
      
      // Hide all steps
      document.querySelectorAll('.form-step').forEach(form => {
        form.classList.remove('active');
      });
      
      // Show current step
      document.getElementById(`step${step}-form`).classList.add('active');
      
      // Update step indicator
      document.querySelectorAll('.step').forEach((stepEl, index) => {
        stepEl.classList.remove('active', 'completed');
        if (index + 1 < step) {
          stepEl.classList.add('completed');
        } else if (index + 1 === step) {
          stepEl.classList.add('active');
        }
      });
    }

    function prevStep(step) {
      nextStep(step);
    }

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

    // Real-time validation
    document.querySelectorAll('input[required], select[required], textarea[required]').forEach(input => {
      input.addEventListener('blur', function() {
        const error = this.parentElement.querySelector('.error-message');
        if (!this.value.trim()) {
          this.classList.add('is-invalid');
          error.style.display = 'block';
        } else {
          this.classList.remove('is-invalid');
          error.style.display = 'none';
        }
      });
    });
  </script>

</body>
</html>