<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reports | GRAK Dashboard</title>

  <!-- Bootstrap and Icons -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" rel="stylesheet">
  <link rel="icon" type="image/png" href="../Media/nser-icon.png" />
  <link rel="stylesheet" href="CSS/index.css">
  <link rel="stylesheet" href="CSS/reports.css">
</head>

<body>

<?php include './nav-sidebar.php'; ?>

<div class="main-content p-4 bg-light" id="mainContent">

  <!-- Header -->
  <div class="d-flex justify-content-between align-items-center mb-4">
    <div>
      <h4 class="dashboard-title"> Reports & Analytics</h4>
      <p class="text-muted mb-0">Comprehensive insights across operations, compliance, settlements, and performance.</p>
    </div>
    <button class="btn dashboard-btn-secondary" id="exportAllBtn">
      <i class="fa-solid fa-file-export me-2"></i> Export All Reports
    </button>
  </div>

  <!-- Report Categories Navigation -->
  <div class="card border-0 shadow-sm mb-4">
    <div class="card-body py-3">
      <ul class="nav nav-pills justify-content-center" id="reportTabs">
        <li class="nav-item">
          <a class="nav-link active" href="#" data-tab="overview">Overview</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-tab="compliance">Compliance</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-tab="financial">Financial</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-tab="operators">Operators</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-tab="screening">Screening</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#" data-tab="exclusions">Exclusions</a>
        </li>
      </ul>
    </div>
  </div>

  <!-- Overview Tab Content -->
  <div class="tab-content active" id="overviewTab">
    <div class="tab-header">
      <div>
        <h5 class="fw-bold" style="color:#1e5aa8;">Overview Dashboard</h5>
        <p class="text-muted mb-0">Key metrics and performance indicators across all areas</p>
      </div>
      <button class="btn dashboard-btn-primary export-tab-btn" data-tab="overview">
        <i class="fa-solid fa-download me-2"></i> Export Overview
      </button>
    </div>

    <!-- Quick Stats -->
    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #1e5aa8 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Total Reports Generated</h6>
                <h3 class="fw-bold mb-0" style="color:#1e5aa8;">156</h3>
                <small class="text-muted">This quarter</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(30, 90, 168, 0.1); color: #1e5aa8;">
                <i class="fa-solid fa-chart-bar"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #28a745 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Active Operators</h6>
                <h3 class="fw-bold mb-0 text-success">198</h3>
                <small class="text-muted">91% compliance rate</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(40, 167, 69, 0.1); color: #28a745;">
                <i class="fa-solid fa-building"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #ffc107 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Pending Reviews</h6>
                <h3 class="fw-bold mb-0 text-warning">32</h3>
                <small class="text-muted">Require attention</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(255, 193, 7, 0.1); color: #ffc107;">
                <i class="fa-solid fa-clock"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #dc3545 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Suspended Operators</h6>
                <h3 class="fw-bold mb-0 text-danger">15</h3>
                <small class="text-muted">Under investigation</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545;">
                <i class="fa-solid fa-ban"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Charts Section -->
    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-pie me-2 text-primary"></i>Operator Compliance Status</h6>
          <div class="chart-container">
            <canvas id="complianceChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-line me-2 text-primary"></i>Monthly Operator Growth</h6>
          <div class="chart-container">
            <canvas id="growthChart"></canvas>
          </div>
        </div>
      </div>
    </div>

  
    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-user-slash me-2 text-primary"></i>Self-Exclusions Trend</h6>
          <div class="chart-container">
            <canvas id="exclusionsChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-clipboard-check me-2 text-primary"></i>Screening Results</h6>
          <div class="chart-container">
            <canvas id="screeningChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-money-bill-wave me-2 text-primary"></i>Revenue Collection</h6>
          <div class="chart-container">
            <canvas id="revenueChart"></canvas>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Compliance Tab Content -->
  <div class="tab-content" id="complianceTab">
    <div class="tab-header">
      <div>
        <h5 class="fw-bold" style="color:#1e5aa8;">Compliance Reports</h5>
        <p class="text-muted mb-0">Operator compliance monitoring and audit reports</p>
      </div>
      <button class="btn dashboard-btn-primary export-tab-btn" data-tab="compliance">
        <i class="fa-solid fa-download me-2"></i> Export Compliance
      </button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #1e5aa8 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Compliance Rate</h6>
                <h3 class="fw-bold mb-0" style="color:#1e5aa8;">91%</h3>
                <small class="text-muted">Industry average: 87%</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(30, 90, 168, 0.1); color: #1e5aa8;">
                <i class="fa-solid fa-check-circle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #28a745 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Fully Compliant</h6>
                <h3 class="fw-bold mb-0 text-success">198</h3>
                <small class="text-muted">Operators</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(40, 167, 69, 0.1); color: #28a745;">
                <i class="fa-solid fa-shield-alt"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #ffc107 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Partial Compliance</h6>
                <h3 class="fw-bold mb-0 text-warning">24</h3>
                <small class="text-muted">Need improvements</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(255, 193, 7, 0.1); color: #ffc107;">
                <i class="fa-solid fa-exclamation-triangle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #dc3545 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Non-Compliant</h6>
                <h3 class="fw-bold mb-0 text-danger">15</h3>
                <small class="text-muted">Under investigation</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545;">
                <i class="fa-solid fa-ban"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-bar me-2 text-primary"></i>Compliance Trends</h6>
          <div class="chart-container">
            <canvas id="complianceTrendsChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-map me-2 text-primary"></i>Regional Compliance</h6>
          <div class="chart-container">
            <canvas id="regionalComplianceChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-clock me-2 text-primary"></i>Audit Completion Rate</h6>
          <div class="small-chart-container">
            <canvas id="auditCompletionChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-file-alt me-2 text-primary"></i>Document Compliance</h6>
          <div class="small-chart-container">
            <canvas id="documentComplianceChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-calendar me-2 text-primary"></i>Monthly Violations</h6>
          <div class="small-chart-container">
            <canvas id="violationsChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-file-lines me-2 text-primary"></i>Compliance Reports</h6>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Report Title</th>
                <th>Period</th>
                <th>Date Generated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>COMP-2101</td>
                <td>Monthly Compliance Audit</td>
                <td>October 2025</td>
                <td>Nov 1, 2025</td>
                <td><span class="badge bg-success">Completed</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-sm btn-outline-secondary"><i class="fa-solid fa-download"></i></button>
                </td>
              </tr>
              <tr>
                <td>COMP-2095</td>
                <td>Quarterly Compliance Review</td>
                <td>Q3 2025</td>
                <td>Oct 15, 2025</td>
                <td><span class="badge bg-success">Completed</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-sm btn-outline-secondary"><i class="fa-solid fa-download"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Financial Tab Content -->
  <div class="tab-content" id="financialTab">
    <div class="tab-header">
      <div>
        <h5 class="fw-bold" style="color:#1e5aa8;">Financial Reports</h5>
        <p class="text-muted mb-0">Revenue, settlements, and financial performance analysis</p>
      </div>
      <button class="btn dashboard-btn-primary export-tab-btn" data-tab="financial">
        <i class="fa-solid fa-download me-2"></i> Export Financial
      </button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #1e5aa8 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Total Revenue</h6>
                <h3 class="fw-bold mb-0" style="color:#1e5aa8;">$2.8M</h3>
                <small class="text-muted">This quarter</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(30, 90, 168, 0.1); color: #1e5aa8;">
                <i class="fa-solid fa-money-bill-wave"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #28a745 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Settlements Processed</h6>
                <h3 class="fw-bold mb-0 text-success">1,245</h3>
                <small class="text-muted">This month</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(40, 167, 69, 0.1); color: #28a745;">
                <i class="fa-solid fa-hand-holding-usd"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #ffc107 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Pending Settlements</h6>
                <h3 class="fw-bold mb-0 text-warning">42</h3>
                <small class="text-muted">Require action</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(255, 193, 7, 0.1); color: #ffc107;">
                <i class="fa-solid fa-clock"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #dc3545 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Failed Settlements</h6>
                <h3 class="fw-bold mb-0 text-danger">8</h3>
                <small class="text-muted">Need investigation</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545;">
                <i class="fa-solid fa-exclamation-circle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-line me-2 text-primary"></i>Revenue Trends</h6>
          <div class="chart-container">
            <canvas id="revenueTrendsChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-pie-chart me-2 text-primary"></i>Revenue Distribution</h6>
          <div class="chart-container">
            <canvas id="revenueDistributionChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-coins me-2 text-primary"></i>Levy Collection</h6>
          <div class="small-chart-container">
            <canvas id="levyCollectionChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-wallet me-2 text-primary"></i>Operator Contributions</h6>
          <div class="small-chart-container">
            <canvas id="contributionsChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-bar me-2 text-primary"></i>Settlement Status</h6>
          <div class="small-chart-container">
            <canvas id="settlementStatusChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-file-lines me-2 text-primary"></i>Financial Reports</h6>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Report Title</th>
                <th>Period</th>
                <th>Date Generated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>FIN-2102</td>
                <td>Monthly Revenue Report</td>
                <td>October 2025</td>
                <td>Nov 2, 2025</td>
                <td><span class="badge bg-success">Completed</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-sm btn-outline-secondary"><i class="fa-solid fa-download"></i></button>
                </td>
              </tr>
              <tr>
                <td>FIN-2096</td>
                <td>Quarterly Settlement Analysis</td>
                <td>Q3 2025</td>
                <td>Oct 18, 2025</td>
                <td><span class="badge bg-success">Completed</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-sm btn-outline-secondary"><i class="fa-solid fa-download"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Operators Tab Content -->
  <div class="tab-content" id="operatorsTab">
    <div class="tab-header">
      <div>
        <h5 class="fw-bold" style="color:#1e5aa8;">Operator Reports</h5>
        <p class="text-muted mb-0">Operator performance, registration, and management reports</p>
      </div>
      <button class="btn dashboard-btn-primary export-tab-btn" data-tab="operators">
        <i class="fa-solid fa-download me-2"></i> Export Operators
      </button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #1e5aa8 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Total Operators</h6>
                <h3 class="fw-bold mb-0" style="color:#1e5aa8;">245</h3>
                <small class="text-muted">Registered operators</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(30, 90, 168, 0.1); color: #1e5aa8;">
                <i class="fa-solid fa-building"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #28a745 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Active Operators</h6>
                <h3 class="fw-bold mb-0 text-success">198</h3>
                <small class="text-muted">Currently operating</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(40, 167, 69, 0.1); color: #28a745;">
                <i class="fa-solid fa-check-circle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #ffc107 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">New Applications</h6>
                <h3 class="fw-bold mb-0 text-warning">18</h3>
                <small class="text-muted">Pending review</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(255, 193, 7, 0.1); color: #ffc107;">
                <i class="fa-solid fa-user-plus"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #dc3545 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Suspended</h6>
                <h3 class="fw-bold mb-0 text-danger">15</h3>
                <small class="text-muted">License suspended</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545;">
                <i class="fa-solid fa-ban"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-line me-2 text-primary"></i>Operator Growth</h6>
          <div class="chart-container">
            <canvas id="operatorGrowthChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-pie-chart me-2 text-primary"></i>Operator Types</h6>
          <div class="chart-container">
            <canvas id="operatorTypesChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-map-marker me-2 text-primary"></i>Regional Distribution</h6>
          <div class="small-chart-container">
            <canvas id="regionalDistributionChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-bar me-2 text-primary"></i>License Categories</h6>
          <div class="small-chart-container">
            <canvas id="licenseCategoriesChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-calendar me-2 text-primary"></i>Monthly Registrations</h6>
          <div class="small-chart-container">
            <canvas id="monthlyRegistrationsChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-file-lines me-2 text-primary"></i>Operator Reports</h6>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Report Title</th>
                <th>Period</th>
                <th>Date Generated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>OPR-2103</td>
                <td>Operator Registration Report</td>
                <td>October 2025</td>
                <td>Nov 3, 2025</td>
                <td><span class="badge bg-success">Completed</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-sm btn-outline-secondary"><i class="fa-solid fa-download"></i></button>
                </td>
              </tr>
              <tr>
                <td>OPR-2097</td>
                <td>Operator Performance Analysis</td>
                <td>Q3 2025</td>
                <td>Oct 20, 2025</td>
                <td><span class="badge bg-success">Completed</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-sm btn-outline-secondary"><i class="fa-solid fa-download"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Screening Tab Content -->
  <div class="tab-content" id="screeningTab">
    <div class="tab-header">
      <div>
        <h5 class="fw-bold" style="color:#1e5aa8;">Screening Reports</h5>
        <p class="text-muted mb-0">Background checks and compliance screening reports</p>
      </div>
      <button class="btn dashboard-btn-primary export-tab-btn" data-tab="screening">
        <i class="fa-solid fa-download me-2"></i> Export Screening
      </button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #1e5aa8 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Total Screenings</h6>
                <h3 class="fw-bold mb-0" style="color:#1e5aa8;">520</h3>
                <small class="text-muted">Completed screenings</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(30, 90, 168, 0.1); color: #1e5aa8;">
                <i class="fa-solid fa-clipboard-check"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #28a745 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Approved</h6>
                <h3 class="fw-bold mb-0 text-success">470</h3>
                <small class="text-muted">Successfully verified</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(40, 167, 69, 0.1); color: #28a745;">
                <i class="fa-solid fa-check-circle"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #ffc107 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Pending Review</h6>
                <h3 class="fw-bold mb-0 text-warning">15</h3>
                <small class="text-muted">Awaiting approval</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(255, 193, 7, 0.1); color: #ffc107;">
                <i class="fa-solid fa-clock"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #dc3545 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Flagged</h6>
                <h3 class="fw-bold mb-0 text-danger">35</h3>
                <small class="text-muted">Issues detected</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545;">
                <i class="fa-solid fa-flag"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-line me-2 text-primary"></i>Screening Trends</h6>
          <div class="chart-container">
            <canvas id="screeningTrendsChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-pie-chart me-2 text-primary"></i>Screening Types</h6>
          <div class="chart-container">
            <canvas id="screeningTypesChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-shield-alt me-2 text-primary"></i>Risk Distribution</h6>
          <div class="small-chart-container">
            <canvas id="riskDistributionChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-clock me-2 text-primary"></i>Processing Times</h6>
          <div class="small-chart-container">
            <canvas id="processingTimesChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-bar me-2 text-primary"></i>Screening Results</h6>
          <div class="small-chart-container">
            <canvas id="screeningResultsChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-file-lines me-2 text-primary"></i>Screening Reports</h6>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Report Title</th>
                <th>Period</th>
                <th>Date Generated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>SCR-2104</td>
                <td>Monthly Screening Summary</td>
                <td>October 2025</td>
                <td>Nov 4, 2025</td>
                <td><span class="badge bg-success">Completed</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-sm btn-outline-secondary"><i class="fa-solid fa-download"></i></button>
                </td>
              </tr>
              <tr>
                <td>SCR-2098</td>
                <td>Risk Assessment Report</td>
                <td>Q3 2025</td>
                <td>Oct 22, 2025</td>
                <td><span class="badge bg-success">Completed</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-sm btn-outline-secondary"><i class="fa-solid fa-download"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

  <!-- Exclusions Tab Content -->
  <div class="tab-content" id="exclusionsTab">
    <div class="tab-header">
      <div>
        <h5 class="fw-bold" style="color:#1e5aa8;">Exclusions Reports</h5>
        <p class="text-muted mb-0">Self-exclusion registry and monitoring reports</p>
      </div>
      <button class="btn dashboard-btn-primary export-tab-btn" data-tab="exclusions">
        <i class="fa-solid fa-download me-2"></i> Export Exclusions
      </button>
    </div>

    <div class="row g-3 mb-4">
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #1e5aa8 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Total Exclusions</h6>
                <h3 class="fw-bold mb-0" style="color:#1e5aa8;">845</h3>
                <small class="text-muted">All-time records</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(30, 90, 168, 0.1); color: #1e5aa8;">
                <i class="fa-solid fa-ban"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #28a745 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Active Exclusions</h6>
                <h3 class="fw-bold mb-0 text-success">790</h3>
                <small class="text-muted">Currently in effect</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(40, 167, 69, 0.1); color: #28a745;">
                <i class="fa-solid fa-user-slash"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #ffc107 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">Expired Exclusions</h6>
                <h3 class="fw-bold mb-0 text-warning">55</h3>
                <small class="text-muted">Period elapsed</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(255, 193, 7, 0.1); color: #ffc107;">
                <i class="fa-solid fa-clock"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="card report-card bg-white equal-height" style="border-left-color: #dc3545 !important;">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-muted mb-1">New This Month</h6>
                <h3 class="fw-bold mb-0 text-danger">34</h3>
                <small class="text-muted">Recent submissions</small>
              </div>
              <div class="stats-icon" style="background-color: rgba(220, 53, 69, 0.1); color: #dc3545;">
                <i class="fa-solid fa-chart-line"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-line me-2 text-primary"></i>Exclusion Trends</h6>
          <div class="chart-container">
            <canvas id="exclusionTrendsChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-pie-chart me-2 text-primary"></i>Exclusion Duration</h6>
          <div class="chart-container">
            <canvas id="exclusionDurationChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="row g-4 mb-4">
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-building me-2 text-primary"></i>Operator Distribution</h6>
          <div class="small-chart-container">
            <canvas id="operatorDistributionChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-map me-2 text-primary"></i>Regional Exclusions</h6>
          <div class="small-chart-container">
            <canvas id="regionalExclusionsChart"></canvas>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card report-card p-3 equal-height">
          <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-chart-bar me-2 text-primary"></i>Monthly Exclusions</h6>
          <div class="small-chart-container">
            <canvas id="monthlyExclusionsChart"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <h6 class="fw-semibold text-muted mb-3"><i class="fa-solid fa-file-lines me-2 text-primary"></i>Exclusions Reports</h6>
        <div class="table-responsive">
          <table class="table table-striped align-middle">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Report Title</th>
                <th>Period</th>
                <th>Date Generated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>EXC-2105</td>
                <td>Monthly Exclusions Report</td>
                <td>October 2025</td>
                <td>Nov 5, 2025</td>
                <td><span class="badge bg-success">Completed</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-sm btn-outline-secondary"><i class="fa-solid fa-download"></i></button>
                </td>
              </tr>
              <tr>
                <td>EXC-2099</td>
                <td>Self-Exclusion Analysis</td>
                <td>Q3 2025</td>
                <td>Oct 25, 2025</td>
                <td><span class="badge bg-success">Completed</span></td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1"><i class="fa-solid fa-eye"></i></button>
                  <button class="btn btn-sm btn-outline-secondary"><i class="fa-solid fa-download"></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>

</div>

<!-- Chart.js -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<script>
  // Tab switching
  document.addEventListener('DOMContentLoaded', function() {
    const tabLinks = document.querySelectorAll('#reportTabs .nav-link');
    
    // Switch tabs
    tabLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all tabs
        tabLinks.forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked tab
        this.classList.add('active');
        const tabName = this.getAttribute('data-tab');
        document.getElementById(tabName + 'Tab').classList.add('active');
      });
    });
    
    // Export functionality
    document.querySelectorAll('.export-tab-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const tabName = this.getAttribute('data-tab');
        alert(`Exporting ${tabName.charAt(0).toUpperCase() + tabName.slice(1)} reports...`);
      });
    });
    
    // Export all functionality
    document.getElementById('exportAllBtn').addEventListener('click', function() {
      alert('Exporting all reports...');
    });

    // Initialize all charts
    initializeAllCharts();
  });

  function initializeAllCharts() {
    // Overview Tab Charts
    new Chart(document.getElementById('complianceChart'), {
      type: 'doughnut',
      data: {
        labels: ['Compliant', 'Pending', 'Suspended'],
        datasets: [{
          data: [198, 32, 15],
          backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
          borderWidth: 0,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('growthChart'), {
      type: 'line',
      data: {
        labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'New Operators',
          data: [10, 18, 25, 30, 28, 34],
          borderColor: '#1e5aa8',
          backgroundColor: 'rgba(30,90,168,0.15)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('exclusionsChart'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'Self-Exclusions',
          data: [620, 650, 680, 710, 730, 750, 780, 800, 820, 845],
          borderColor: '#1e5aa8',
          backgroundColor: 'rgba(30,90,168,0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('screeningChart'), {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Pending', 'Flagged'],
        datasets: [{
          data: [468, 15, 37],
          backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('revenueChart'), {
      type: 'bar',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Revenue (Millions)',
          data: [2.1, 2.3, 2.6, 2.8],
          backgroundColor: '#28a745',
          borderRadius: 6
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // Compliance Tab Charts
    new Chart(document.getElementById('complianceTrendsChart'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'Compliance Rate',
          data: [85, 86, 87, 88, 89, 90, 90, 91, 91, 91],
          borderColor: '#1e5aa8',
          backgroundColor: 'rgba(30,90,168,0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('regionalComplianceChart'), {
      type: 'bar',
      data: {
        labels: ['Nairobi', 'Coast', 'Central', 'Rift Valley', 'Western'],
        datasets: [{
          label: 'Compliance Rate',
          data: [94, 84, 92, 84, 83],
          backgroundColor: '#1e5aa8',
          borderRadius: 6,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('auditCompletionChart'), {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'In Progress', 'Pending'],
        datasets: [{
          data: [78, 15, 7],
          backgroundColor: ['#28a745', '#ffc107', '#6c757d'],
          borderWidth: 0
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('documentComplianceChart'), {
      type: 'bar',
      data: {
        labels: ['KYC', 'AML', 'Licenses', 'Financial', 'Operational'],
        datasets: [{
          label: 'Compliance Rate',
          data: [95, 92, 88, 85, 90],
          backgroundColor: '#1e5aa8',
          borderRadius: 6,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('violationsChart'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'Violations',
          data: [45, 42, 38, 35, 32, 30, 28, 26, 25, 24],
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220,53,69,0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // Financial Tab Charts
    new Chart(document.getElementById('revenueTrendsChart'), {
      type: 'line',
      data: {
        labels: ['Q1', 'Q2', 'Q3', 'Q4'],
        datasets: [{
          label: 'Revenue (Millions)',
          data: [2.1, 2.3, 2.6, 2.8],
          borderColor: '#28a745',
          backgroundColor: 'rgba(40,167,69,0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('revenueDistributionChart'), {
      type: 'doughnut',
      data: {
        labels: ['Online Betting', 'Land Casinos', 'Lottery', 'Other'],
        datasets: [{
          data: [45, 35, 15, 5],
          backgroundColor: ['#1e5aa8', '#28a745', '#ffc107', '#6c757d'],
          borderWidth: 0,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('levyCollectionChart'), {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'Levy Collected ($)',
          data: [450000, 480000, 520000, 550000, 580000, 600000, 620000, 650000, 680000, 700000],
          backgroundColor: '#1e5aa8',
          borderRadius: 6,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('contributionsChart'), {
      type: 'pie',
      data: {
        labels: ['Top 10 Operators', 'Medium Operators', 'Small Operators'],
        datasets: [{
          data: [65, 25, 10],
          backgroundColor: ['#1e5aa8', '#28a745', '#ffc107'],
          borderWidth: 0,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('settlementStatusChart'), {
      type: 'doughnut',
      data: {
        labels: ['Successful', 'Pending', 'Failed'],
        datasets: [{
          data: [86, 11, 3],
          backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
          borderWidth: 0,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    // Operators Tab Charts
    new Chart(document.getElementById('operatorGrowthChart'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'Total Operators',
          data: [180, 190, 200, 210, 220, 230, 235, 240, 242, 245],
          borderColor: '#1e5aa8',
          backgroundColor: 'rgba(30,90,168,0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('operatorTypesChart'), {
      type: 'pie',
      data: {
        labels: ['Online Betting', 'Land Casinos', 'Lottery', 'Other'],
        datasets: [{
          data: [58, 24, 12, 6],
          backgroundColor: ['#1e5aa8', '#28a745', '#ffc107', '#6c757d'],
          borderWidth: 0,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('regionalDistributionChart'), {
      type: 'bar',
      data: {
        labels: ['Nairobi', 'Coast', 'Central', 'Rift Valley', 'Western'],
        datasets: [{
          label: 'Operators',
          data: [98, 45, 52, 38, 12],
          backgroundColor: '#1e5aa8',
          borderRadius: 6,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('licenseCategoriesChart'), {
      type: 'doughnut',
      data: {
        labels: ['Class A', 'Class B', 'Class C', 'Special'],
        datasets: [{
          data: [45, 30, 20, 5],
          backgroundColor: ['#1e5aa8', '#28a745', '#ffc107', '#6c757d'],
          borderWidth: 0,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('monthlyRegistrationsChart'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'New Registrations',
          data: [8, 12, 15, 18, 22, 25, 20, 18, 15, 12],
          borderColor: '#28a745',
          backgroundColor: 'rgba(40,167,69,0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    // Screening Tab Charts
    new Chart(document.getElementById('screeningTrendsChart'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'Screenings Completed',
          data: [400, 420, 450, 480, 510, 520, 515, 518, 519, 520],
          borderColor: '#1e5aa8',
          backgroundColor: 'rgba(30,90,168,0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('screeningTypesChart'), {
      type: 'doughnut',
      data: {
        labels: ['KYC', 'AML', 'License Review', 'Other'],
        datasets: [{
          data: [45, 30, 15, 10],
          backgroundColor: ['#1e5aa8', '#28a745', '#ffc107', '#6c757d'],
          borderWidth: 0,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('riskDistributionChart'), {
      type: 'pie',
      data: {
        labels: ['Low Risk', 'Medium Risk', 'High Risk'],
        datasets: [{
          data: [70, 20, 10],
          backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
          borderWidth: 0,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('processingTimesChart'), {
      type: 'bar',
      data: {
        labels: ['KYC', 'AML', 'License', 'Background'],
        datasets: [{
          label: 'Days',
          data: [1.2, 2.5, 3.8, 5.2],
          backgroundColor: '#1e5aa8',
          borderRadius: 6,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('screeningResultsChart'), {
      type: 'doughnut',
      data: {
        labels: ['Approved', 'Conditional', 'Rejected'],
        datasets: [{
          data: [85, 10, 5],
          backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
          borderWidth: 0,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    // Exclusions Tab Charts
    new Chart(document.getElementById('exclusionTrendsChart'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'Self-Exclusions',
          data: [620, 650, 680, 710, 730, 750, 780, 800, 820, 845],
          borderColor: '#1e5aa8',
          backgroundColor: 'rgba(30,90,168,0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('exclusionDurationChart'), {
      type: 'pie',
      data: {
        labels: ['6 Months', '1 Year', '2 Years', 'Permanent'],
        datasets: [{
          data: [62, 24, 10, 4],
          backgroundColor: ['#1e5aa8', '#28a745', '#ffc107', '#dc3545'],
          borderWidth: 0,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('operatorDistributionChart'), {
      type: 'bar',
      data: {
        labels: ['BetPawa', 'SportyBet', 'Casino Nairobi', 'Kenya Lottery', 'Others'],
        datasets: [{
          label: 'Exclusions',
          data: [245, 198, 156, 123, 123],
          backgroundColor: '#1e5aa8',
          borderRadius: 6,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });

    new Chart(document.getElementById('regionalExclusionsChart'), {
      type: 'doughnut',
      data: {
        labels: ['Nairobi', 'Coast', 'Central', 'Rift Valley', 'Western'],
        datasets: [{
          data: [45, 20, 15, 12, 8],
          backgroundColor: ['#1e5aa8', '#28a745', '#ffc107', '#6c757d', '#dc3545'],
          borderWidth: 0,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    new Chart(document.getElementById('monthlyExclusionsChart'), {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
        datasets: [{
          label: 'New Exclusions',
          data: [25, 28, 32, 30, 35, 38, 40, 42, 38, 34],
          borderColor: '#dc3545',
          backgroundColor: 'rgba(220,53,69,0.1)',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
        }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
    });
  }
</script>

<script src="JS/index.js"></script>
</body>
</html>