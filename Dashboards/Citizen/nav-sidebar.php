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
        <div class="section-title">Self-Exclusion</div>
        <a href="index.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'index.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-border-all"></i> Dashboard
        </a>
        <a href="self-exclude.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'self-exclude.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-user-slash"></i> Self-Exclude
        </a>
        <a href="assessments.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'assessments.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-clipboard-check"></i> Assessments
        </a>
        <a href="history.php" class="nav-link <?php echo basename($_SERVER['PHP_SELF']) == 'history.php' ? 'active' : ''; ?>">
            <i class="fa-solid fa-clock-rotate-left"></i> History
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
                    <div class="role">Citizen</div>
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