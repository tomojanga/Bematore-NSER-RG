<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>FAQ | NSER - National Self-Exclusion Register</title>

  <!-- Bootstrap 5 -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <!-- Font Awesome -->
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Google Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Open+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <!-- Favicon -->
  <link rel="shortcut icon" href="./Media/nser-icon.png" type="image/x-icon">
    <!-- Custom CSS -->
     <link rel="stylesheet" href="./CSS/index.css">
     <link rel="stylesheet" href="./CSS/faq.css">

</head>
<body>

  <!-- Navigation -->
  <?php include 'nav.php'; ?>

  <!-- FAQ Hero Section -->
  <section class="faq-hero">
    <div class="container">
      <h1>Frequently Asked Questions</h1>
      <div class="subtitle">Find answers to common questions about self-exclusion and responsible gambling</div>
      <p class="text-muted mx-auto" style="max-width: 600px;">
        Everything you need to know about the National Self-Exclusion Register and how it protects you
      </p>
    </div>
  </section>

  <!-- FAQ Categories -->
  <section class="faq-categories">
    <div class="container">
      <div class="row g-4">
        <div class="col-md-4">
          <div class="category-card">
            <div class="category-icon">
              <i class="fa-solid fa-user-lock"></i>
            </div>
            <h3>Self-Exclusion</h3>
            <p>Questions about registering, periods, and how self-exclusion works across all operators</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="category-card">
            <div class="category-icon">
              <i class="fa-solid fa-shield-alt"></i>
            </div>
            <h3>Privacy & Security</h3>
            <p>How your data is protected and what information operators can access</p>
          </div>
        </div>
        <div class="col-md-4">
          <div class="category-card">
            <div class="category-icon">
              <i class="fa-solid fa-hand-holding-heart"></i>
            </div>
            <h3>Support & Resources</h3>
            <p>Available support services and resources for responsible gambling</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ Accordion -->
  <section class="faq-section">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-lg-10">
          <h2 class="text-center mb-5 fw-bold" style="color: var(--nser-dark);">Common Questions</h2>
          
          <div class="faq-accordion accordion" id="faqAccordion">
            
            <!-- Self-Exclusion Questions -->
            <div class="accordion-item">
              <h3 class="accordion-header">
                <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                  What is self-exclusion and how does it work?
                </button>
              </h3>
              <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                  Self-exclusion is a voluntary process where you choose to be excluded from all licensed gambling operators in Kenya for a specific period. Once registered, your details are added to the National Self-Exclusion Register, and all operators are legally required to prevent you from gambling with them during your chosen exclusion period.
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h3 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                  What exclusion periods are available?
                </button>
              </h3>
              <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                  You can choose from three exclusion periods: 6 months, 1 year, or 5 years. The 5-year option includes an auto-renewal feature to ensure continuous protection unless you actively choose to remove your exclusion.
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h3 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                  How quickly does self-exclusion take effect?
                </button>
              </h3>
              <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                  Self-exclusion takes effect immediately after successful registration and verification. Your exclusion is instantly enforced across all licensed gambling operators through our real-time API integration.
                </div>
              </div>
            </div>

            <!-- Privacy & Security Questions -->
            <div class="accordion-item">
              <h3 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                  Is my personal information secure?
                </button>
              </h3>
              <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                  Yes, your privacy and data security are our top priorities. We use AES-256 encryption, comply with Kenya's Data Protection Act 2019, and operators only see whether you are "allowed" or "excluded" - no personal details are shared.
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h3 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq5">
                  What information do gambling operators see?
                </button>
              </h3>
              <div id="faq5" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                  Operators only see a binary status: either "allowed" or "excluded." They cannot access your personal information, contact details, or the specific reason for your exclusion. This protects your privacy while ensuring compliance.
                </div>
              </div>
            </div>

            <!-- Support Questions -->
            <div class="accordion-item">
              <h3 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq6">
                  What support is available during my exclusion period?
                </button>
              </h3>
              <div id="faq6" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                  We provide access to accredited mental health professionals, SHIF-supported clinics, and regular check-ins to support your journey. Our platform also offers educational resources and tools to help maintain your commitment to responsible gambling.
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h3 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq7">
                  Can I cancel my self-exclusion early?
                </button>
              </h3>
              <div id="faq7" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                  Self-exclusion is designed to be a commitment to help you maintain control. Early cancellation is generally not permitted to ensure the effectiveness of the program. However, you can contact our support team to discuss your specific situation and available options.
                </div>
              </div>
            </div>

            <div class="accordion-item">
              <h3 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq8">
                  What happens if I try to gamble while excluded?
                </button>
              </h3>
              <div id="faq8" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                <div class="accordion-body">
                  Our system will immediately block any gambling attempts across all licensed operators. You'll receive a notification about the blocked attempt, and our support team may reach out to offer additional assistance and resources to help you maintain your commitment.
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </section>



  <!-- Footer  -->
  <?php include 'footer.php'; ?>

  <!-- Scripts -->
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>