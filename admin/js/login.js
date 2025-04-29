// FIREBASE CONFIGURATION
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

document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("errorMessage");

  // CLEAR FORM FIELDS TO PREVENT BROWSER FROM SAVING
  document.getElementById("email").value = "";
  document.getElementById("password").value = "";

  firebase
    .auth()
    .setPersistence(firebase.auth.Auth.Persistence.SESSION) // USE SESSION PERSISTENCE
    .then(() => {
      return firebase.auth().signInWithEmailAndPassword(email, password);
    })
    .then(() => {
      window.location.href = "dashboard.html";
    })
    .catch((error) => {
      errorMessage.textContent = error.message;
    });
});
