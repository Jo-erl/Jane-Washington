document.addEventListener("DOMContentLoaded", function () {
  // FIREBASE CONFIG
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

  // INITIALIZE FIREBASE
  firebase.initializeApp(firebaseConfig);
  console.log("Firebase initialized successfully");

  // NOW THAT FIREBASE IS INITIALIZED, LOAD THE PROJECTS
  loadProjects();
});

/**
 * LOADS PROJECTS FROM FIREBASE AND RENDERS THEM
 */
function loadProjects() {
  console.log("Loading projects function called");
  const database = firebase.database();
  const projectsRef = database.ref("portfolio/projects");
  const projectsContainer = document.getElementById("projectsContainer");

  if (!projectsContainer) {
    console.error("projectsContainer element not found in the DOM");
    return;
  }

  projectsRef.on(
    "value",
    (snapshot) => {
      console.log("Firebase data received:", snapshot.val());
      projectsContainer.innerHTML = ""; // CLEAR CURRENT CONTENT

      const projects = snapshot.val();

      if (projects) {
        // CONVERT OBJECT TO ARRAY AND SORT BY CREATION DATE (NEWEST FIRST)
        const projectsArray = Object.entries(projects)
          .map(([id, project]) => ({
            id,
            ...project,
          }))
          .sort((a, b) => b.createdAt - a.createdAt);

        // RENDER EACH PROJECT
        projectsArray.forEach((project) => {
          renderProject(project);
        });
        console.log("All projects rendered");
      } else {
        projectsContainer.innerHTML = `
                        <div class="no-projects">
                            <p>No projects found. Check back later!</p>
                        </div>
                    `;
        console.log("No projects found in database");
      }
    },
    (error) => {
      console.error("Error loading projects:", error);
      projectsContainer.innerHTML = `
                    <div class="error-message">
                        <p>Error loading projects: ${error.message}</p>
                    </div>
                `;
    }
  );
}

/**
 * RENDERS A SINGLE PROJECT CARD
 * @param {Object} project - THE PROJECT DATA
 */
function renderProject(project) {
  console.log("Rendering project:", project.title);
  const projectsContainer = document.getElementById("projectsContainer");

  if (!projectsContainer) {
    console.error("projectsContainer element not found");
    return;
  }

  const projectCard = document.createElement("div");
  projectCard.className = "project-card";

  projectCard.innerHTML = `
                <div class="project-image">
                    <img src="${project.image}" alt="${project.title}">
                </div>
                <div class="project-info">
                    <h3>${project.title}</h3>
                    <p>${project.description}</p>
                    <div class="project-tech">
                        ${project.technologies
                          .map((tech) => `<span>${tech}</span>`)
                          .join("")}
                    </div>
                    <div class="project-links">
                        ${
                          project.demoUrl
                            ? `<a href="${project.demoUrl}" class="btn small" target="_blank">Live Demo</a>`
                            : ""
                        }
                        ${
                          project.codeUrl
                            ? `<a href="${project.codeUrl}" class="btn small secondary" target="_blank">Code</a>`
                            : ""
                        }
                    </div>
                </div>
            `;

  projectsContainer.appendChild(projectCard);
}
