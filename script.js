const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lbImg = document.getElementById("lb-img");
const lbDownload = document.getElementById("lb-download");
const toast = document.getElementById("toast");

const downloadIcon =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0l-5-5m5 5l5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

let photos = [];
let current = 0;
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 3500);
}

function onDownload() {
  showToast("Your download has started. Check your Downloads or Photos.");
}

function render() {
  photos.forEach((photo, i) => {
    const num = String(i + 1).padStart(2, "0");
    const li = document.createElement("li");
    li.className = "card";
    li.style.animationDelay = `${i * 90}ms`;
    li.innerHTML = `
      <button class="frame" type="button" aria-label="View photo ${num} larger">
        <img src="thumbs/${photo.file}" width="${photo.width}" height="${photo.height}"
             alt="Convocation photo ${num}" ${i < 3 ? "" : 'loading="lazy"'}>
      </button>
      <div class="meta">
        <a class="btn" href="photos/${photo.file}" download="${photo.file}" aria-label="Download photo ${num}">${downloadIcon}<span>Download</span></a>
      </div>`;
    li.querySelector(".frame").addEventListener("click", () => open(i));
    li.querySelector(".btn").addEventListener("click", onDownload);
    gallery.appendChild(li);
  });
}

function show(i) {
  current = (i + photos.length) % photos.length;
  const photo = photos[current];
  lbImg.src = `view/${photo.file}`;
  lbImg.alt = `Convocation photo ${current + 1}`;
  lbDownload.href = `photos/${photo.file}`;
  lbDownload.setAttribute("download", photo.file);
}

function open(i) {
  show(i);
  lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function close() {
  lightbox.hidden = true;
  document.body.style.overflow = "";
}

lightbox.querySelector(".lb-close").addEventListener("click", close);
lightbox.querySelector(".lb-prev").addEventListener("click", () => show(current - 1));
lightbox.querySelector(".lb-next").addEventListener("click", () => show(current + 1));
lbDownload.addEventListener("click", onDownload);
lightbox.addEventListener("click", (e) => { if (e.target === lightbox || e.target.tagName === "FIGURE") close(); });

document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") close();
  if (e.key === "ArrowLeft") show(current - 1);
  if (e.key === "ArrowRight") show(current + 1);
});

let touchX = null;
lightbox.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 60) show(current + (dx < 0 ? 1 : -1));
  touchX = null;
});

fetch("photos.json")
  .then((r) => r.json())
  .then((data) => { photos = data; render(); })
  .catch(() => { gallery.innerHTML = "<li>Sorry, the photos could not be loaded. Please refresh the page.</li>"; });
