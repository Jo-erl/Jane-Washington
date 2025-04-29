document.addEventListener("DOMContentLoaded", function () {
  // MOBILE NAVIGATION
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  hamburger.addEventListener("click", function () {
    this.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  // CLOSE MOBILE MENU WHEN CLICKING ON A LINK
  document.querySelectorAll(".nav-links a").forEach((link) => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });

  // NAVBAR SCROLL EFFECT
  window.addEventListener("scroll", function () {
    const navbar = document.querySelector(".navbar");
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // SMOOTH SCROLLING FOR ANCHOR LINKS
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetElement = document.querySelector(targetId);

      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: "smooth",
      });
    });
  });

  // TRACK WHICH ELEMENTS ARE CURRENTLY IN VIEW
  const inViewElements = new Set();

  // ANIMATE ELEMENTS WHEN THEY COME INTO VIEW
  const animateOnScroll = function () {
    const elements = document.querySelectorAll(
      ".section, .project-card, .skill-bar, .stat-item, .icon-item, .contact-item"
    );

    elements.forEach((element) => {
      const elementPosition = element.getBoundingClientRect().top;
      const elementBottom = element.getBoundingClientRect().bottom;
      const windowHeight = window.innerHeight;

      // CHECK IF ELEMENT IS IN VIEW
      const isInView =
        elementPosition < windowHeight - 100 && elementBottom > 0;

      // ELEMENT HAS ENTERED THE VIEW
      if (isInView && !inViewElements.has(element)) {
        inViewElements.add(element);
        element.classList.add("animated");

        // SPECIAL ANIMATION FOR STATS COUNTING UP
        if (element.classList.contains("stat-item")) {
          const numberElement = element.querySelector(".stat-number");
          const target = parseInt(numberElement.getAttribute("data-count"));

          // RESET TO 0 BEFORE ANIMATING
          numberElement.textContent = "0";

          const duration = 1500;
          const startTime = performance.now();

          const animateCount = (timestamp) => {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const value = Math.floor(progress * target);
            numberElement.textContent = value;

            if (progress < 1) {
              requestAnimationFrame(animateCount);
            } else {
              numberElement.textContent = target; // ENSURE FINAL VALUE IS EXACT
            }
          };

          requestAnimationFrame(animateCount);
        }

        // SPECIAL ANIMATION FOR SKILL BARS
        if (element.classList.contains("skill-bar")) {
          const progress = element.querySelector(".progress");
          const skillInfo = element.querySelector(".skill-info");
          const width = skillInfo.lastElementChild.textContent.replace("%", "");

          // RESET TO 0 AND THEN ANIMATE TO TARGET WIDTH
          progress.style.width = "0";
          setTimeout(() => {
            progress.style.width = width + "%";
          }, 300); // SMALL DELAY TO ALLOW OTHER ANIMATIONS TO START
        }
      }
      // ELEMENT HAS LEFT THE VIEW
      else if (!isInView && inViewElements.has(element)) {
        inViewElements.delete(element);
        element.classList.remove("animated");

        // RESET STATS TO ZERO WHEN OUT OF VIEW
        if (element.classList.contains("stat-item")) {
          const numberElement = element.querySelector(".stat-number");
          numberElement.textContent = "0";
        }

        // RESET SKILL BARS WHEN OUT OF VIEW
        if (element.classList.contains("skill-bar")) {
          const progress = element.querySelector(".progress");
          progress.style.width = "0";
        }
      }
    });
  };

  // USE INTERSECTIONOBSERVER FOR BETTER PERFORMANCE
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting || !entry.isIntersecting) {
          animateOnScroll();
        }
      });
    },
    {
      threshold: [0, 0.1, 0.5],
      rootMargin: "-100px 0px",
    }
  );

  // OBSERVE ALL ANIMATABLE ELEMENTS
  document
    .querySelectorAll(
      ".section, .project-card, .skill-bar, .stat-item, .icon-item, .contact-item"
    )
    .forEach((el) => observer.observe(el));

  // INITIAL CHECK IN CASE ELEMENTS ARE ALREADY VISIBLE
  animateOnScroll();

  // ALSO CHECK ON SCROLL FOR BETTER RESPONSIVENESS
  window.addEventListener("scroll", animateOnScroll);
});

// INITIALIZE FIREBASE (SAME CONFIG)
const firebaseConfig = {
  apiKey: "AIzaSyAIMzrF0mBTIXU4qU57whDwm6m8r3Tp-TU",
  authDomain: "portfolio-8080.firebaseapp.com",
  projectId: "portfolio-8080",
  databaseURL: "https://portfolio-8080-default-rtdb.firebaseio.com",
  storageBucket: "portfolio-8080.firebasestorage.app",
  messagingSenderId: "186957560813",
  appId: "1:186957560813:web:e0d5f76c816042163485e4",
  measurementId: "G-VSJF1VRMVN",
};

firebase.initializeApp(firebaseConfig);

// LOAD PORTFOLIO DATA
function loadPortfolioData() {
  const database = firebase.database();

  // LOAD HERO SECTION
  database
    .ref("portfolio/hero")
    .once("value")
    .then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const heroTitle = document.querySelector(".hero h1");
        const heroSubtitle = document.querySelector(".hero h2");
        const heroDescription = document.querySelector(".hero p");

        if (data.title)
          heroTitle.innerHTML = data.title.replace(
            "Jane Doe",
            '<span class="highlight">Jane Doe</span>'
          );
        if (data.subtitle) heroSubtitle.textContent = data.subtitle;
        if (data.description) heroDescription.textContent = data.description;
      }
    });
}

document.addEventListener("DOMContentLoaded", loadPortfolioData);
