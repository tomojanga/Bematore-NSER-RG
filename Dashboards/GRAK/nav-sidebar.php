<!-- Sidebar Overlay for Mobile -->
<div class="sidebar-overlay" id="sidebarOverlay"></div>

<!-- Sidebar -->
<div class="sidebar" id="sidebar">
    <div class="logo">
        <div class="logo-icon">
            <i class="fa-solid fa-shield-alt"></i>
        </div>
        <span>REGULATOR</span>
    </div>

    <div class="section">
        <div class="section-title">Compliance Monitoring</div>
        <a href="index.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-border-all"></i> Dashboard
        </a>
        <a href="operators.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'operators.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-building"></i> Operators
        </a>
        <a href="exclusions.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'exclusions.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-user-slash"></i> Exclusions
        </a>
        <a href="screening.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'screening.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-clipboard-check"></i> Screening
        </a>
        <a href="settlements.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'settlements.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-money-bill-wave"></i> Settlements
        </a>
    </div>

    <div class="divider"></div>

    <div class="section">
        <div class="section-title">Analytics & Reports</div>
        <a href="reports.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'reports.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-chart-line"></i> Reports
        </a>
 
        <a href="audit.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'audit.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-search"></i> Audit Trail
        </a>
    </div>

    <div class="divider"></div>

    <div class="section">
        <div class="section-title">System Management</div>
        <a href="settings.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'settings.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-gear"></i> Settings
        </a>
        <a href="users.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'users.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-users"></i> User Management
        </a>

    </div>

    <div class="divider"></div>

    <div class="section">
        <div class="section-title">Account</div>

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
                    <div class="name">REGULATOR</div>
                    <div class="role">Admin</div>
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