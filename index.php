<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>NSER | National Self-Exclusion Register</title>

  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Font Awesome -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- JQVMap libraries -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/jqvmap/1.5.1/jqvmap.min.css" rel="stylesheet">
  <!-- Favicon -->
   <link rel="shortcut icon" href="./Media/nser-icon.png" type="image/x-icon">
    <!-- Custom CSS -->
    <link rel="stylesheet" href="./CSS/index.css" />
</head>
<body>

  <?php include 'nav.php'; ?>

  <!-- HERO -->
  <section class="hero-section">
    <div class="hero-text">
      <h1>National Self-Exclusion Register</h1>
      <div class="subtitle">Built on the Bematore Platform for the Gambling Regulatory Authority of Kenya</div>
      <p>The National Self-Exclusion Register (NSER) provides comprehensive protection for Kenyan citizens through self-exclusion options and responsible gambling tools. Our platform integrates with all licensed operators to ensure immediate enforcement across the entire gambling ecosystem.</p>

      <p>With advanced risk assessment modules and AI-powered analytics, we identify gambling risks early and connect individuals with accredited mental health professionals.</p>

      <a href="#" class="btn">Self-Exclude Now</a>
    </div>

    <div class="world-map-container">
      <div id="world-map"></div>
      <div class="map-info">
        <h5 id="country-name">Kenya Implementation</h5>
        <p id="country-info">NSER platform active with full operator integration</p>
      </div>
    </div>
  </section>

<!-- Functionality Spectrum Section -->
<section class="spectrum-section py-5">
  <div class="container">
    <div class="row text-center mb-5">
      <div class="col-12">
        <div class="section-header mb-4">
          <div class="d-flex align-items-center justify-content-center mb-3">
            <div class="header-icon me-3">
              <i class="fa-solid fa-gem"></i>
            </div>
            <h6 class="text-uppercase fw-semibold text-primary mb-0">Complete Protection Platform</h6>
          </div>
          <h2 class="fw-bold mb-3" style="color: var(--nser-dark);">What Our Platform Offers</h2>
          <p class="text-muted mx-auto" style="max-width: 700px;">
            A unified, AI-powered national system designed to protect players, strengthen regulators, and improve fiscal transparency
          </p>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <!-- Feature 1 -->
      <div class="col-md-6 col-lg-3">
        <div class="d-flex align-items-start">
          <div class="feature-icon me-3 mt-1">
            <i class="fa-solid fa-user-lock"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2" style="color: var(--nser-dark);">Self-Exclusion Register</h5>
            <p class="text-muted mb-0 small">Voluntary exclusion with real-time enforcement across all operators</p>
          </div>
        </div>
      </div>

      <!-- Feature 2 -->
      <div class="col-md-6 col-lg-3">
        <div class="d-flex align-items-start">
          <div class="feature-icon me-3 mt-1">
            <i class="fa-solid fa-brain"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2" style="color: var(--nser-dark);">AI Risk Detection</h5>
            <p class="text-muted mb-0 small">Behavioral analysis and clinical screening tools</p>
          </div>
        </div>
      </div>

      <!-- Feature 3 -->
      <div class="col-md-6 col-lg-3">
        <div class="d-flex align-items-start">
          <div class="feature-icon me-3 mt-1">
            <i class="fa-solid fa-sliders"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2" style="color: var(--nser-dark);">Player Controls</h5>
            <p class="text-muted mb-0 small">Personalized limits, alerts, and protective tools</p>
          </div>
        </div>
      </div>

      <!-- Feature 4 -->
      <div class="col-md-6 col-lg-3">
        <div class="d-flex align-items-start">
          <div class="feature-icon me-3 mt-1">
            <i class="fa-solid fa-hand-holding-medical"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2" style="color: var(--nser-dark);">Mental Health Support</h5>
            <p class="text-muted mb-0 small">Instant referral to accredited therapists</p>
          </div>
        </div>
      </div>

      <!-- Feature 5 -->
      <div class="col-md-6 col-lg-3">
        <div class="d-flex align-items-start">
          <div class="feature-icon me-3 mt-1">
            <i class="fa-solid fa-globe"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2" style="color: var(--nser-dark);">Multi-Channel Access</h5>
            <p class="text-muted mb-0 small">USSD, mobile apps, and web platforms</p>
          </div>
        </div>
      </div>

      <!-- Feature 6 -->
      <div class="col-md-6 col-lg-3">
        <div class="d-flex align-items-start">
          <div class="feature-icon me-3 mt-1">
            <i class="fa-solid fa-chart-line"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2" style="color: var(--nser-dark);">Regulatory Oversight</h5>
            <p class="text-muted mb-0 small">Real-time compliance and transaction monitoring</p>
          </div>
        </div>
      </div>

      <!-- Feature 7 -->
      <div class="col-md-6 col-lg-3">
        <div class="d-flex align-items-start">
          <div class="feature-icon me-3 mt-1">
            <i class="fa-solid fa-money-bill-trend-up"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2" style="color: var(--nser-dark);">Tax Integration</h5>
            <p class="text-muted mb-0 small">Automated levy calculation and settlement</p>
          </div>
        </div>
      </div>

      <!-- Feature 8 -->
      <div class="col-md-6 col-lg-3">
        <div class="d-flex align-items-start">
          <div class="feature-icon me-3 mt-1">
            <i class="fa-solid fa-heart-pulse"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2" style="color: var(--nser-dark);">Public Health Analytics</h5>
            <p class="text-muted mb-0 small">National risk mapping and insights</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<!-- Features Section -->
<section class="features-section py-5">
  <div class="container">

    <!-- Section Header  -->
    <div class="row text-center mb-5">
      <div class="col-12">
        <div class="section-header mb-4">
          <div class="d-flex align-items-center justify-content-center mb-2">
            <div class="header-icon me-3">
              <i class="fa-solid fa-shield-heart"></i>
            </div>
            <h6 class="text-uppercase fw-semibold text-primary mb-0">Protection & Support</h6>
          </div>
          <h2 class="fw-bold mb-3">Your Path to Responsible Gambling</h2>
          <p class="text-muted mx-auto" style="max-width: 600px;">
            Take control with tools designed to protect your financial security, mental health, and personal wellbeing
          </p>
        </div>
      </div>
    </div>

    <div class="row align-items-center">
      
      <!-- LEFT -->
      <div class="col-lg-6 mb-4 mb-lg-0">
        <div class="image-composition">
          <div class="tall-image">
            <img src="./Media/p1.jpg" alt="Main Feature">
            <div class="label-box">
              <i class="fa-solid fa-star me-2"></i>
              Featured Protection
            </div>
          </div>
          <div class="side-images">
            <div class="side-img top">
              <img src="./Media/hands.webp" alt="Team Work">
            </div>
            <div class="side-img bottom">
              <img src="./Media/g2.webp" alt="Support">
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT-->
      <div class="col-lg-6 right-text">
        <div class="d-flex mb-4">
          <div class="icon-box me-3">
            <i class="fa-solid fa-user-lock"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2">Take Control with Self-Exclusion</h5>
            <p class="text-muted mb-0">Choose exclusion periods that work for you - 6 months, 1 year, or 5 years with auto-renewal options.</p>
          </div>
        </div>

        <div class="d-flex mb-4">
          <div class="icon-box me-3">
            <i class="fa-solid fa-brain"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2">Early Risk Detection</h5>
            <p class="text-muted mb-0">Our AI system identifies potential gambling patterns before they become problematic.</p>
          </div>
        </div>

        <div class="d-flex mb-4">
          <div class="icon-box me-3">
           <i class="fa-solid fa-shield-virus"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2">Universal Protection</h5>
            <p class="text-muted mb-0">Your exclusion applies instantly across all licensed gambling operators in Kenya.</p>
          </div>
        </div>

        <div class="d-flex">
          <div class="icon-box me-3">
            <i class="fa-solid fa-hand-holding-heart"></i>
          </div>
          <div>
            <h5 class="fw-semibold mb-2">Professional Support Access</h5>
            <p class="text-muted mb-0">Connect with accredited mental health professionals and SHIF-supported clinics.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>


<!-- How Self Exlclusion Works -->
<section class="py-5 bg-light">
  <div class="container text-center">
    <p class="text-uppercase text-primary fw-semibold mb-2">How It Works</p>
    <h2 class="fw-bold mb-5">The Self-Exclusion Process<br>Made Simple</h2>

    <div class="row align-items-center">
      <!-- Left side -->
      <div class="col-md-4 text-start">
        <div class="mb-4 d-flex">
          <div class="number-box me-3">1</div>
          <div>
            <h5 class="fw-bold">Register Your Details</h5>
            <p class="text-muted mb-0">
              Provide your basic information and choose your preferred exclusion period - 6 months, 1 year, or 5 years.
            </p>
          </div>
        </div>

        <div class="d-flex">
          <div class="number-box me-3">2</div>
          <div>
            <h5 class="fw-bold">Identity Verification</h5>
            <p class="text-muted mb-0">
              Secure verification process to ensure your identity and protect your privacy throughout the exclusion period.
            </p>
          </div>
        </div>
      </div>

      <!-- Center image -->
      <div class="col-md-4 text-center my-4 my-md-0">
        <img src="./Media/p4.jpg" alt="Self Exclusion Process" class="img-fluid rounded-circle shadow-sm" style="max-width: 250px; object-fit: cover; height: 250px;">
      </div>

      <!-- Right side -->
      <div class="col-md-4 text-start text-md-start">
        <div class="mb-4 d-flex">
          <div class="number-box me-3">3</div>
          <div>
            <h5 class="fw-bold">Instant Enforcement</h5>
            <p class="text-muted mb-0">
              Your exclusion is immediately activated across all licensed gambling operators in Kenya.
            </p>
          </div>
        </div>

        <div class="d-flex">
          <div class="number-box me-3">4</div>
          <div>
            <h5 class="fw-bold">Support & Monitoring</h5>
            <p class="text-muted mb-0">
              Access professional support services and regular check-ins to help maintain your exclusion commitment.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<?php include 'footer.php'; ?>


  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jqvmap/1.5.1/jquery.vmap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jqvmap/1.5.1/maps/jquery.vmap.world.js"></script>

  <script>
    $(document).ready(function(){
      // Vector map
      $('#world-map').vectorMap({
        map: 'world_en',
        backgroundColor: 'transparent',
        borderColor: '#fff',
        borderOpacity: 0.25,
        borderWidth: 1,
        color: '#e9ecef',
        hoverColor: '#1e5aa8',
        hoverOpacity: 0.7,
        selectedColor: '#0d3d7a',
        enableZoom: true,
        showTooltip: true,
        scaleColors: ['#C8EEFF', '#1e5aa8'],
        normalizeFunction: 'polynomial',
        onRegionClick: function(event, code) {
          var countryName = $('#world-map').vectorMap('get','mapObject').getRegionName(code);
          $('#country-name').text(countryName);
          if(countryName === 'Kenya'){
            $('#country-info').text('NSER fully operational with 100+ licensed operators integrated');
          } else {
            $('#country-info').text('Regional compliance framework under development');
          }
          $('.map-info').fadeIn();
        }
      });

      // close info box when clicking outside
      $(document).click(function(event){
        if(!$(event.target).closest('.map-info, .jqvmap-region, .vm-clickable').length){
          $('.map-info').fadeOut();
        }
      });

      // update map size on resize
      $(window).resize(function(){
        if($('#world-map').length){
          $('#world-map').vectorMap('get','mapObject').updateSize();
        }
      });
    });
  </script>
</body>
</html>
