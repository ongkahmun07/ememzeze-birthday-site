const memoryUpload = document.getElementById("memoryUpload");
const memoryGallery = document.getElementById("memoryGallery");
const addMoreMemoriesButton = document.getElementById("addMoreMemoriesButton");
const clearMemoriesButton = document.getElementById("clearMemoriesButton");
const sectionButtons = Array.from(document.querySelectorAll(".section-button"));
const panels = Array.from(document.querySelectorAll(".content-stack .panel"));
const letterTitle = document.getElementById("letterTitle");
const letterMessage = document.getElementById("letterMessage");
const previewTitle = document.getElementById("previewTitle");
const previewMessage = document.getElementById("previewMessage");
const saveLetterButton = document.getElementById("saveLetterButton");
const saveStatus = document.getElementById("saveStatus");

const LETTER_STORAGE_KEY = "bestie-birthday-letter";
const MEMORIES_STORAGE_KEY = "birthday-memory-gallery";
const galleryTilts = ["-3deg", "2deg", "-2deg", "3deg", "-1deg", "1.5deg"];
const sharedMemories = Array.from({ length: 28 }, (_, index) => ({
  name: index === 0 ? "one of many bouquets in school" : `memory ${String(index + 1).padStart(2, "0")}`,
  src: `assets/memories/memory-${String(index + 1).padStart(2, "0")}.jpeg`,
}));

function openPanel(targetId) {
  sectionButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.target === targetId);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("is-visible", panel.id === targetId);
  });
}

function updatePreview() {
  const title = letterTitle.value.trim();
  const message = letterMessage.value.trim();

  previewTitle.textContent = title || "Your title will appear here";
  previewMessage.textContent = message || "Start writing and your DEAR HUAN preview will bloom here.";
}

function setSaveStatus(message) {
  saveStatus.textContent = message;
}

function createMemoryCard(memory, index) {
  const card = document.createElement("article");
  card.className = "memory-card";
  card.style.setProperty("--tilt", galleryTilts[index % galleryTilts.length]);
  card.innerHTML = `
    <img src="${memory.src}" alt="${memory.name}">
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

function renderMemoryGallery() {
  const allMemories = [...sharedMemories, ...getSavedMemories()];

  if (!allMemories.length) {
    showMemoryPlaceholder();
    return;
  }

  memoryGallery.innerHTML = "";
  allMemories.forEach((memory, index) => {
    if (!memory?.src) {
      return;
    }

    memoryGallery.appendChild(createMemoryCard(memory, index));
  });

  if (!memoryGallery.children.length) {
    showMemoryPlaceholder();
  }
}

function loadSavedMemories() {
  renderMemoryGallery();
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
  const validFiles = files.filter((file) => file.type.startsWith("image/"));

  if (!validFiles.length) {
    return;
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
      renderMemoryGallery();
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
  renderMemoryGallery();
});

sectionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openPanel(button.dataset.target);
  });
});

letterTitle.addEventListener("input", updatePreview);
letterMessage.addEventListener("input", updatePreview);
saveLetterButton.addEventListener("click", saveLetter);

loadSavedMemories();
loadSavedLetter();
