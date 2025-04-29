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
const database = firebase.database();
const auth = firebase.auth();

// SESSION MANAGEMENT VARIABLES
let inactivityTimer;
const INACTIVITY_TIMEOUT = 300000; // 5 MINUTES (MILLISECONDS)

// DOM ELEMENTS
const projectsList = document.getElementById("projectsList");
const projectForm = document.getElementById("projectForm");
const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formTitle = document.getElementById("formTitle");
const projectSearch = document.getElementById("projectSearch");
const logoutBtn = document.getElementById("logoutBtn");
let editId = null;

// SESSION MANAGEMENT

function resetInactivityTimer() {
  // CLEAR EXISTING TIMER
  clearTimeout(inactivityTimer);

  // SET NEW TIMER
  inactivityTimer = setTimeout(() => {
    auth.signOut().then(() => {
      window.location.href = "login.html";
    });
  }, INACTIVITY_TIMEOUT);
}

function setupActivityListeners() {
  // EVENTS THAT SHOULD RESET THE INACTIVITY TIMER
  const activityEvents = [
    "mousedown",
    "mousemove",
    "keypress",
    "scroll",
    "touchstart",
    "click",
  ];

  activityEvents.forEach((event) => {
    document.addEventListener(event, resetInactivityTimer);
  });
}

function initializeSession() {
  resetInactivityTimer();
  setupActivityListeners();

  // CLEAR SESSION WHEN TAB IS CLOSED
  window.addEventListener("beforeunload", () => {
    clearTimeout(inactivityTimer);
  });
}

// AUTHENTICATION HANDLING

function checkAuthState() {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      // REDIRECT TO LOGIN IF NOT AUTHENTICATED
      window.location.href = "login.html";
    } else {
      // INITIALIZE SESSION MANAGEMENT
      initializeSession();

      // UPDATE UI WITH USER INFO
      document.getElementById("adminEmail").textContent = user.email;

      // LOAD PROJECTS
      loadProjects();
    }
  });
}

//,PROJECT MANAGEMENT

function loadProjects() {
  const projectsRef = database.ref("portfolio/projects");

  projectsRef.on("value", (snapshot) => {
    projectsList.innerHTML = ""; // CLEAR CURRENT LIST

    const projects = snapshot.val();

    if (projects) {
      // CONVERT OBJECT TO ARRAY AND SORT BY CREATION DATE (NEWEST FIRST)
      const projectsArray = Object.entries(projects)
        .map(([id, project]) => ({ id, ...project }))
        .sort((a, b) => b.createdAt - a.createdAt);

      // RENDER EACH PROJECT
      projectsArray.forEach((project) => {
        renderProject(project);
      });
    } else {
      projectsList.innerHTML =
        '<li class="no-projects">No projects found. Add your first project!</li>';
    }
  });
}

function renderProject(project) {
  const projectItem = document.createElement("li");
  projectItem.className = "project-item";
  projectItem.dataset.id = project.id;

  projectItem.innerHTML = `
    <div class="project-image">
      <img src="${project.image}" alt="${project.title}">
    </div>
    <div class="project-info">
      <h4>${project.title}</h4>
      <p>${project.description.substring(0, 60)}...</p>
      <div class="project-tech">
        ${project.technologies.map((tech) => `<span>${tech}</span>`).join("")}
      </div>
    </div>
    <div class="project-actions">
      <button class="edit-btn" data-id="${project.id}">
        <i class="fas fa-edit"></i>
      </button>
      <button class="delete-btn" data-id="${project.id}">
        <i class="fas fa-trash"></i>
      </button>
    </div>
  `;

  projectsList.appendChild(projectItem);

  // ADD EVENT LISTENERS TO THE BUTTONS
  projectItem
    .querySelector(".edit-btn")
    .addEventListener("click", () => editProject(project));
  projectItem
    .querySelector(".delete-btn")
    .addEventListener("click", () => deleteProject(project.id));
}

function handleFormSubmit(e) {
  e.preventDefault();

  // GET FORM VALUES
  const projectData = {
    title: document.getElementById("projectTitle").value,
    description: document.getElementById("projectDescription").value,
    image: document.getElementById("projectImage").value,
    technologies: document
      .getElementById("projectTechnologies")
      .value.split(",")
      .map((tech) => tech.trim())
      .filter((tech) => tech),
    demoUrl: document.getElementById("projectDemoUrl").value || null,
    codeUrl: document.getElementById("projectCodeUrl").value || null,
    createdAt: firebase.database.ServerValue.TIMESTAMP,
  };

  // VALIDATE REQUIRED FIELDS
  if (
    !projectData.title ||
    !projectData.description ||
    !projectData.image ||
    projectData.technologies.length === 0
  ) {
    showError("Please fill in all required fields");
    return;
  }

  const projectsRef = database.ref("portfolio/projects");

  if (editId) {
    // UPDATE EXISTING PROJECT
    projectsRef
      .child(editId)
      .update(projectData)
      .then(() => {
        showSuccess("Project updated successfully!");
        resetForm();
      })
      .catch((error) => showError(error.message));
  } else {
    // ADD NEW PROJECT
    projectsRef
      .push(projectData)
      .then(() => {
        showSuccess("Project added successfully!");
        resetForm();
      })
      .catch((error) => showError(error.message));
  }
}

function editProject(project) {
  // SET FORM TO EDIT MODE
  editId = project.id;
  formTitle.textContent = "Edit Project";
  submitBtn.textContent = "Update Project";
  cancelBtn.style.display = "inline-block";

  // FILL FORM WITH PROJECT DATA
  document.getElementById("projectId").value = project.id;
  document.getElementById("projectTitle").value = project.title;
  document.getElementById("projectDescription").value = project.description;
  document.getElementById("projectImage").value = project.image;
  document.getElementById("projectTechnologies").value =
    project.technologies.join(", ");
  document.getElementById("projectDemoUrl").value = project.demoUrl || "";
  document.getElementById("projectCodeUrl").value = project.codeUrl || "";

  // SCROLL TO FORM
  document.getElementById("projectForm").scrollIntoView({ behavior: "smooth" });
}

function cancelEdit() {
  resetForm();
}

function resetForm() {
  editId = null;
  projectForm.reset();
  formTitle.textContent = "Add New Project";
  submitBtn.textContent = "Add Project";
  cancelBtn.style.display = "none";
  document.getElementById("projectId").value = "";
}

function deleteProject(projectId) {
  if (
    confirm(
      "Are you sure you want to delete this project? This action cannot be undone."
    )
  ) {
    database
      .ref(`portfolio/projects/${projectId}`)
      .remove()
      .then(() => showSuccess("Project deleted successfully!"))
      .catch((error) => showError(error.message));
  }
}

function filterProjects() {
  const searchTerm = projectSearch.value.toLowerCase();
  const projectItems = projectsList.querySelectorAll(".project-item");

  projectItems.forEach((item) => {
    const title = item.querySelector("h4").textContent.toLowerCase();
    const description = item.querySelector("p").textContent.toLowerCase();
    const technologies = item
      .querySelector(".project-tech")
      .textContent.toLowerCase();

    if (
      title.includes(searchTerm) ||
      description.includes(searchTerm) ||
      technologies.includes(searchTerm)
    ) {
      item.style.display = "flex";
    } else {
      item.style.display = "none";
    }
  });
}

// EVENT HANDLERS

function handleLogout() {
  auth
    .signOut()
    .then(() => {
      window.location.href = "login.html";
    })
    .catch((error) => showError(error.message));
}

// UTILITY FUNCTIONS

function showSuccess(message) {
  alert(message);
}

function showError(message) {
  console.error("Error:", message);
  alert(`Error: ${message}`);
}

// INITIALIZATION

document.addEventListener("DOMContentLoaded", () => {
  // CHECK AUTHENTICATION STATE
  checkAuthState();

  // FORM SUBMISSION HANDLER
  projectForm.addEventListener("submit", handleFormSubmit);

  // CANCEL EDIT BUTTON HANDLER
  cancelBtn.addEventListener("click", cancelEdit);

  // LOGOUT BUTTON HANDLER
  logoutBtn.addEventListener("click", handleLogout);

  // SEARCH FUNCTIONALITY
  projectSearch.addEventListener("input", filterProjects);
});
