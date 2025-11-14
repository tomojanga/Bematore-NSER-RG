<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Webhooks |NSER Portal</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <!-- Favicon -->
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/webhooks.css">

</head>

<body>

<!-- Sidebar and Nav -->
<?php include './nav-sidebar.php'; ?>

  
<!-- Main Content -->
<div class="main-content p-4 bg-light" id="mainContent">
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="fw-bold mb-1 dashboard-title">Webhooks</h4>
      <p class="text-muted mb-0">Receive real-time exclusion notifications</p>
    </div>
    <button class="btn dashboard-btn-primary" data-bs-toggle="modal" data-bs-target="#addWebhookModal">
      <i class="fas fa-plus me-1"></i> Add Webhook
    </button>
  </div>

  <div class="row g-4">
    <!-- Left Column: Webhooks List -->
    <div class="col-lg-8">
      <div class="webhooks-card">
        <h5 class="section-title">Your Webhooks</h5>
        
        <div class="empty-state">
          <div class="empty-state-icon">
            <i class="fas fa-bell-slash"></i>
          </div>
          <h5 class="text-muted mb-3">No webhooks configured yet</h5>
          <p class="text-muted mb-4">Set up webhooks to receive real-time notifications about exclusion updates and other important events.</p>
          <button class="create-webhook-btn" data-bs-toggle="modal" data-bs-target="#addWebhookModal">
            <i class="fas fa-plus me-2"></i>Create Your First Webhook
          </button>
        </div>
      </div>
    </div>
    
    <!-- Right Column : Documentation -->
    <div class="col-lg-4">
      <div class="documentation-card">
        <h5 class="section-title">Webhook Documentation</h5>
        
        <div class="doc-item">
          <div class="doc-bullet">•</div>
          <div class="doc-content">
            <div class="doc-title">HTTP POST Delivery</div>
            <div class="doc-description">Webhooks are delivered via HTTP POST to your specified URL</div>
          </div>
        </div>
        
        <div class="doc-item">
          <div class="doc-bullet">•</div>
          <div class="doc-content">
            <div class="doc-title">Automatic Retries</div>
            <div class="doc-description">Failed deliveries are retried up to 5 times with exponential backoff</div>
          </div>
        </div>
        
        <div class="doc-item">
          <div class="doc-bullet">•</div>
          <div class="doc-content">
            <div class="doc-title">Acknowledge Receipt</div>
            <div class="doc-description">Always respond with HTTP 200 to acknowledge receipt</div>
          </div>
        </div>
        
        <div class="doc-item">
          <div class="doc-bullet">•</div>
          <div class="doc-content">
            <div class="doc-title">Payload Security</div>
            <div class="doc-description">Webhook payloads include a signature for verification</div>
          </div>
        </div>
        
        <div class="doc-item">
          <div class="doc-bullet">•</div>
          <div class="doc-content">
            <div class="doc-title">Testing</div>
            <div class="doc-description">Test webhooks to verify your integration works correctly</div>
          </div>
        </div>
      </div>

      <!-- Webhook Features -->
      <div class="webhooks-card mt-4">
        <h5 class="section-title">Webhook Events</h5>
        
        <div class="webhook-features">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-user-slash"></i>
            </div>
            <div class="feature-title">Exclusion Added</div>
            <div class="feature-description">Notify when a new self-exclusion is registered</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-user-check"></i>
            </div>
            <div class="feature-title">Exclusion Removed</div>
            <div class="feature-description">Alert when an exclusion period expires</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-calendar-plus"></i>
            </div>
            <div class="feature-title">Exclusion Extended</div>
            <div class="feature-description">Notify when an exclusion period is extended</div>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <div class="feature-title">Compliance Updates</div>
            <div class="feature-description">Receive regulatory compliance notifications</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>

<!-- Add Webhook Modal -->
<div class="modal fade" id="addWebhookModal" tabindex="-1" aria-labelledby="addWebhookModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="addWebhookModalLabel">Create New Webhook</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="webhookForm">
          <div class="mb-3">
            <label for="webhookName" class="form-label">Webhook Name</label>
            <input type="text" class="form-control" id="webhookName" placeholder="e.g., Production Webhook" required>
          </div>
          
          <div class="mb-3">
            <label for="webhookUrl" class="form-label">Webhook URL</label>
            <input type="url" class="form-control" id="webhookUrl" placeholder="https://your-domain.com/webhooks/nser" required>
            <div class="form-text">Enter the endpoint URL that will receive webhook payloads</div>
          </div>
          
          <div class="mb-3">
            <label class="form-label">Events to Subscribe To</label>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="eventExclusionAdded" checked>
              <label class="form-check-label" for="eventExclusionAdded">
                Exclusion Added
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="eventExclusionRemoved" checked>
              <label class="form-check-label" for="eventExclusionRemoved">
                Exclusion Removed
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="eventExclusionExtended">
              <label class="form-check-label" for="eventExclusionExtended">
                Exclusion Extended
              </label>
            </div>
            <div class="form-check">
              <input class="form-check-input" type="checkbox" id="eventComplianceUpdate">
              <label class="form-check-label" for="eventComplianceUpdate">
                Compliance Updates
              </label>
            </div>
          </div>
          
          <div class="mb-3">
            <label for="webhookSecret" class="form-label">Webhook Secret (Optional)</label>
            <input type="text" class="form-control" id="webhookSecret" placeholder="Enter a secret for payload verification">
            <div class="form-text">Add a secret to verify webhook payload authenticity</div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn dashboard-btn-primary" onclick="createWebhook()">Create Webhook</button>
      </div>
    </div>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="JS/index.js"></script>

</body>
</html>