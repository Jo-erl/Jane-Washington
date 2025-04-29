// ADMIN DASHBOARD MOBILE-NAV.JS
document.addEventListener("DOMContentLoaded", function () {
  // GET DOM ELEMENTS
  const sidebar = document.querySelector(".sidebar");
  const sidebarToggle = document.querySelector(".sidebar-toggle");

  // OVERLAY ELEMENT
  const overlay = document.createElement("div");
  overlay.classList.add("mobile-nav-overlay");
  document.body.appendChild(overlay);

  // TOGGLE SIDEBAR FUNCTION
  function toggleSidebar() {
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    document.body.classList.toggle("no-scroll");
  }

  // TOGGLE SIDEBAR ON BUTTON CLICK
  if (sidebarToggle) {
    sidebarToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleSidebar();
    });
  }

  // CLOSE SIDEBAR WHEN CLICKING ON OVERLAY
  overlay.addEventListener("click", function () {
    toggleSidebar();
  });

  // CLOSE SIDEBAR WHEN CLICKING OUTSIDE ON LARGER SCREENS
  function handleResize() {
    if (window.innerWidth >= 992) {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
      document.body.classList.remove("no-scroll");
    }
  }

  // RESIZE EVENT LISTENER WITH DEBOUNCE
  let resizeTimer;
  window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 100);
  });

  // CLOSE SIDEBAR WHEN A NAV LINK IS CLICKED 
  const navLinks = document.querySelectorAll(".sidebar-nav a");
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (window.innerWidth < 992) {
        toggleSidebar();
      }
    });
  });

  // CLOSE SIDEBAR WHEN CLICKING OUTSIDE (ON MOBILE ONLY)
  document.addEventListener("click", function (event) {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickOnToggle =
      sidebarToggle && sidebarToggle.contains(event.target);

    if (
      !isClickInsideSidebar &&
      !isClickOnToggle &&
      window.innerWidth < 992 &&
      sidebar.classList.contains("active")
    ) {
      toggleSidebar();
    }
  });
});
