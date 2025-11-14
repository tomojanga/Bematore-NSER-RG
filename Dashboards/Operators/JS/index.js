    // Toggle sidebar functionality
    
    const toggleBtn = document.getElementById('toggleSidebar');
    const sidebar = document.getElementById('sidebar');
    const topbar = document.getElementById('topbar');
    const mainContent = document.getElementById('mainContent');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    // Function to check screen size and apply correct state
    function checkScreenSize() {
      if (window.innerWidth <= 992) {
        sidebar.classList.remove('active');
        sidebar.classList.add('collapsed');
        topbar.classList.add('collapsed');
        mainContent.classList.add('collapsed');
      } else {
        sidebar.classList.remove('collapsed', 'active');
        topbar.classList.remove('collapsed');
        mainContent.classList.remove('collapsed');
        sidebarOverlay.classList.remove('active');
        document.body.style.overflow = '';
      }
    }

    // Initial check
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Sidebar toggle
    toggleBtn.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        sidebar.classList.toggle('active');
        sidebarOverlay.classList.toggle('active');

        if (sidebar.classList.contains('active')) {
          document.body.style.overflow = 'hidden';
        } else {
          document.body.style.overflow = '';
        }
      } else {
        sidebar.classList.toggle('collapsed');
        topbar.classList.toggle('collapsed');
        mainContent.classList.toggle('collapsed');
      }
    });

    // Close sidebar when overlay is clicked (mobile)
    sidebarOverlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
      document.body.style.overflow = '';
    });