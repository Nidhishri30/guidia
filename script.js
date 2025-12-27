/* ================= ELEMENTS ================= */
const video = document.getElementById("video");
const statusText = document.getElementById("status");
const destinationInput = document.getElementById("destinationInput");

/* ================= STATE ================= */
let model = null;
let isSpeaking = false;
let welcomeSpoken = false;
let lastObstacleTime = 0;

/* ================= IMPORTANT OBJECTS ================= */
const IMPORTANT_OBJECTS = [
  "person",
  "car",
  "chair",
  "table",
  "door",
  "bench",
  "bottle"
];

/* ================= SPEAK ================= */
function speak(text, type = "info") {
  statusText.innerText = text;
  statusText.className = "";

  if (type === "danger") statusText.classList.add("alert-danger");
  if (type === "clear") statusText.classList.add("alert-clear");

  if (!window.speechSynthesis) return;

  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  isSpeaking = true;
  u.onend = () => (isSpeaking = false);
  window.speechSynthesis.speak(u);
}

/* ================= WELCOME (TAP REQUIRED) ================= */
document.body.addEventListener(
  "click",
  () => {
    if (welcomeSpoken) return;

    speak(
      "Hello. Welcome to Guidia. Say take me to school, hospital, auto stand, or bus stop."
    );
    welcomeSpoken = true;

    startCamera();
  },
  { once: true }
);

/* ================= CAMERA ================= */
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false
    });

    video.srcObject = stream;
    video.setAttribute("playsinline", true);
    await video.play();

    speak("Camera started");
  } catch (err) {
    console.error(err);
    speak("Camera access failed. Please allow camera permission.", "danger");
  }
}

/* ================= LOAD MODEL ================= */
async function loadModel() {
  model = await cocoSsd.load();
}

/* ================= OBJECT DETECTION ================= */
async function detectEnvironment() {
  if (!model || !video.videoWidth) return;

  const predictions = await model.detect(video);
  const now = Date.now();

  for (let p of predictions) {
    if (IMPORTANT_OBJECTS.includes(p.class)) {
      if (now - lastObstacleTime > 4000) {
        lastObstacleTime = now;
        speak("Obstacle detected ahead", "danger");
        if (navigator.vibrate) navigator.vibrate(300);
      }
      return;
    }
  }

  speak("Path is clear", "clear");
}

setInterval(detectEnvironment, 3000);

/* ================= NAVIGATION ================= */
function navigateToSchool() {
  speak("Taking you to the special school");

  window.location.href = "map.html?destination=school";
}

function navigateNearby(place) {
  speak("Opening nearby " + place);

  window.location.href =
    "map.html?destination=" + encodeURIComponent(place);
}

/* ================= TEXT INPUT ================= */
destinationInput.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;

  const text = destinationInput.value.toLowerCase();

  if (text.includes("school")) navigateToSchool();
  else if (text.includes("hospital")) navigateNearby("hospital");
  else if (text.includes("auto")) navigateNearby("auto stand");
  else if (text.includes("bus")) navigateNearby("bus stop");
  else speak("Please enter school, hospital, auto stand, or bus stop");
});

/* ================= SPEECH RECOGNITION ================= */
const SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition;

if (SpeechRecognition) {
  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    if (isSpeaking) return;

    const transcript =
      event.results[event.results.length - 1][0].transcript.toLowerCase();

    statusText.innerText = "Heard: " + transcript;

    if (transcript.includes("emergency")) {
      navigateToSchool();
      return;
    }

    if (transcript.includes("school")) navigateToSchool();
    else if (transcript.includes("hospital")) navigateNearby("hospital");
    else if (transcript.includes("auto")) navigateNearby("auto stand");
    else if (transcript.includes("bus")) navigateNearby("bus stop");
  };

  recognition.onend = () => recognition.start();
  recognition.start();
}

/* ================= INIT ================= */
window.onload = () => {
  loadModel();
};
