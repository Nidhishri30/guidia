const params = new URLSearchParams(window.location.search);
const destination = params.get("destination") || "hospital";

/* ================= SPEAK ================= */
function speak(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-US";
  window.speechSynthesis.speak(u);
}

/* ================= OPEN MAPS (USER ACTION REQUIRED) ================= */
function openMaps() {
  speak("Opening navigation to " + destination);

  // iOS prefers Apple Maps
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  let mapsUrl;

  if (isIOS) {
    // Apple Maps (BEST for iOS)
    mapsUrl = `https://maps.apple.com/?q=${encodeURIComponent(destination)}`;
  } else {
    // Google Maps for others
    mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
      destination + " near me"
    )}`;
  }

  window.location.href = mapsUrl;
}

/* ================= REQUIRED FOR iOS ================= */
/* Must be triggered by user interaction */
document.body.addEventListener(
  "click",
  () => {
    openMaps();
  },
  { once: true }
);
