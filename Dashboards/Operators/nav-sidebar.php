<!-- Sidebar Overlay for Mobile -->
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<!-- Sidebar -->
<div class="sidebar" id="sidebar">
    <div class="logo">
        <div class="logo-icon">
            <i class="fa-solid fa-shield-alt"></i>
        </div>
        <span>NSER Portal</span>
    </div>

    <div class="section">
        <div class="section-title">Core</div>
        <a href="index.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-border-all"></i> Dashboard
        </a>
        <a href="exclusion-lookup.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'exclusion-lookup.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-magnifying-glass"></i> Exclusion Lookup
        </a>
        <a href="api-keys.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'api-keys.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-key"></i> API Keys
        </a>
        <a href="webhooks.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'webhooks.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-link"></i> Webhooks
        </a>
   
    </div>

    <div class="divider"></div>

    <div class="section">
        <div class="section-title">Simulator</div>
        <a href="simulator.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'simulator.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-sliders"></i> Simulator
        </a>
        <a href="integration-guide.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'integration-guide.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-book"></i> Integration Guide
        </a>
        <a href="api-reference.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'api-reference.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-code"></i> API Reference
        </a>
    </div>

    <div class="divider"></div>

    <div class="section">
        <div class="section-title">Insights</div>
        <a href="statistics.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'statistics.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-chart-line"></i> Statistics
        </a>
        <a href="compliance.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'compliance.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-file-contract"></i> Compliance
        </a>
    </div>

    <div class="divider"></div>

    <div class="section">
        <div class="section-title">Account</div>
        <a href="settings.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'settings.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-gear"></i> Settings
        </a>
        <a href="logout.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'logout.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-right-from-bracket"></i> Logout
        </a>
    </div>
</div>

<!-- Topbar -->
<div class="topbar" id="topbar">
    <div class="d-flex align-items-center">
        <button class="toggle-sidebar" id="toggleSidebar">
            <i class="fa-solid fa-bars"></i>
        </button>
        <div class="search-box">
            <i class="fa-solid fa-magnifying-glass"></i>
            <input type="text" placeholder="Search">
        </div>
    </div>

    <div class="d-flex align-items-center">
        <div class="topbar-icons">
            <i class="fa-regular fa-bell"></i>
            <!-- <i class="fa-regular fa-envelope"></i> -->
        </div>
        <div class="dropdown ms-3">
            <div class="user-profile" data-bs-toggle="dropdown" aria-expanded="false">
                <img src="../Media/new-logo.jpg" alt="User">
                <div>
                    <div class="name">NSER User</div>
                    <div class="role">Operator</div>
                </div>
                <i class="fa-solid fa-angle-down ms-2 text-muted"></i>
            </div>
            <ul class="dropdown-menu dropdown-menu-end">
                <li><a class="dropdown-item" href="#"><i class="fa-solid fa-user"></i> Profile</a></li>
                <li><a class="dropdown-item" href="#"><i class="fa-solid fa-gear"></i> Settings</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-danger" href="#"><i class="fa-solid fa-right-from-bracket"></i> Logout</a></li>
            </ul>
        </div>
    </div>
</div>