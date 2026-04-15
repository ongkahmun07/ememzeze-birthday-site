const memoryUpload = document.getElementById("memoryUpload");
const memoryGallery = document.getElementById("memoryGallery");
const addMoreMemoriesButton = document.getElementById("addMoreMemoriesButton");
const clearMemoriesButton = document.getElementById("clearMemoriesButton");
const heroPhotoUpload = document.getElementById("heroPhotoUpload");
const heroPhotoPreview = document.getElementById("heroPhotoPreview");
const heroPhotoPlaceholder = document.getElementById("heroPhotoPlaceholder");
const letterTitle = document.getElementById("letterTitle");
const letterMessage = document.getElementById("letterMessage");
const previewTitle = document.getElementById("previewTitle");
const previewMessage = document.getElementById("previewMessage");
const saveLetterButton = document.getElementById("saveLetterButton");
const saveStatus = document.getElementById("saveStatus");

const LETTER_STORAGE_KEY = "bestie-birthday-letter";
const HERO_PHOTO_STORAGE_KEY = "birthday-hero-photo";
const MEMORIES_STORAGE_KEY = "birthday-memory-gallery";
const galleryTilts = ["-3deg", "2deg", "-2deg", "3deg", "-1deg", "1.5deg"];

function updatePreview() {
  const title = letterTitle.value.trim();
  const message = letterMessage.value.trim();

  previewTitle.textContent = title || "Your title will appear here";
  previewMessage.textContent = message || "Start writing and your birthday letter preview will bloom here.";
}

function setSaveStatus(message) {
  saveStatus.textContent = message;
}

function showHeroPhoto(src) {
  if (!src) {
    heroPhotoPreview.removeAttribute("src");
    heroPhotoPreview.style.display = "none";
    heroPhotoPlaceholder.style.display = "grid";
    return;
  }

  heroPhotoPreview.src = src;
  heroPhotoPreview.style.display = "block";
  heroPhotoPlaceholder.style.display = "none";
}

function createMemoryCard(memory, index) {
  const card = document.createElement("article");
  card.className = "memory-card";
  card.style.setProperty("--tilt", galleryTilts[index % galleryTilts.length]);
  card.innerHTML = `
    <img src="${memory.src}" alt="Memory upload ${index + 1}">
    <p class="memory-caption">${memory.name}</p>
  `;
  return card;
}

function showMemoryPlaceholder() {
  memoryGallery.innerHTML = `
    <article class="memory-placeholder">
      <p>No photos yet.</p>
      <span>Your uploaded memories will appear here.</span>
    </article>
  `;
}

function loadSavedMemories() {
  const saved = localStorage.getItem(MEMORIES_STORAGE_KEY);

  if (!saved) {
    showMemoryPlaceholder();
    return;
  }

  try {
    const memories = JSON.parse(saved);
    if (!Array.isArray(memories) || memories.length === 0) {
      showMemoryPlaceholder();
      return;
    }

    memoryGallery.innerHTML = "";
    memories.forEach((memory, index) => {
      if (!memory?.src) {
        return;
      }

      memoryGallery.appendChild(createMemoryCard(memory, index));
    });

    if (!memoryGallery.children.length) {
      showMemoryPlaceholder();
    }
  } catch {
    showMemoryPlaceholder();
  }
}

function saveMemories(memories) {
  localStorage.setItem(MEMORIES_STORAGE_KEY, JSON.stringify(memories));
}

function getSavedMemories() {
  const saved = localStorage.getItem(MEMORIES_STORAGE_KEY);

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadSavedHeroPhoto() {
  const savedPhoto = localStorage.getItem(HERO_PHOTO_STORAGE_KEY);
  showHeroPhoto(savedPhoto || "");
}

function saveLetter() {
  const payload = {
    title: letterTitle.value,
    message: letterMessage.value,
  };

  localStorage.setItem(LETTER_STORAGE_KEY, JSON.stringify(payload));
  setSaveStatus("Letter saved in this browser.");
}

function loadSavedLetter() {
  const saved = localStorage.getItem(LETTER_STORAGE_KEY);

  if (!saved) {
    updatePreview();
    return;
  }

  try {
    const parsed = JSON.parse(saved);
    letterTitle.value = parsed.title || "";
    letterMessage.value = parsed.message || "";
    setSaveStatus("Saved letter loaded.");
  } catch {
    setSaveStatus("Could not load the saved letter.");
  }

  updatePreview();
}

function renderGallery(files) {
  const existingMemories = getSavedMemories();
  const validFiles = files.filter((file) => file.type.startsWith("image/"));

  if (!validFiles.length) {
    return;
  }

  if (!existingMemories.length) {
    memoryGallery.innerHTML = "";
  }

  validFiles.forEach((file) => {
    if (!file.type.startsWith("image/")) {
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      if (!src) {
        return;
      }

      const nextMemories = [...getSavedMemories(), { name: file.name, src }];
      saveMemories(nextMemories);
      const card = createMemoryCard({ name: file.name, src }, nextMemories.length - 1);
      memoryGallery.appendChild(card);
    });

    reader.readAsDataURL(file);
  });
}

memoryUpload.addEventListener("change", (event) => {
  const files = Array.from(event.target.files || []);
  renderGallery(files);
  memoryUpload.value = "";
});

addMoreMemoriesButton.addEventListener("click", () => {
  memoryUpload.click();
});

clearMemoriesButton.addEventListener("click", () => {
  localStorage.removeItem(MEMORIES_STORAGE_KEY);
  showMemoryPlaceholder();
});

heroPhotoUpload.addEventListener("change", (event) => {
  const [file] = Array.from(event.target.files || []);
  if (!file || !file.type.startsWith("image/")) {
    return;
  }

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const result = typeof reader.result === "string" ? reader.result : "";
    localStorage.setItem(HERO_PHOTO_STORAGE_KEY, result);
    showHeroPhoto(result);
  });

  reader.readAsDataURL(file);
});

letterTitle.addEventListener("input", updatePreview);
letterMessage.addEventListener("input", updatePreview);
saveLetterButton.addEventListener("click", saveLetter);

loadSavedHeroPhoto();
loadSavedMemories();
loadSavedLetter();
