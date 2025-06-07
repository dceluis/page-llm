// entrypoints/options/main.ts
import { storage } from "wxt/storage";

// --- Constants ---
// UPDATED: Focused on Gemini 2.0 and 2.5 models.
const GOOGLE_MODELS = [
  'gemini-2.0-flash',
  'gemini-2.5-pro-preview-06-05', // Latest 2.5 Pro preview
  'gemini-2.5-flash-preview-05-20' // Latest 2.5 Flash preview
];
// UPDATED: Focused on GPT-4o models and specific O3/O4-mini models.
const OPENAI_MODELS = [
  'gpt-4o',
  'gpt-4o-mini',
  'o4-mini',
  'o4-mini-2025-04-16',
  'o3',
  'o3-2025-04-16'
];

// --- UI Elements ---
const providerSelect = document.getElementById("provider-select") as HTMLSelectElement;
const googleSettings = document.getElementById("google-settings") as HTMLDivElement;
const openaiSettings = document.getElementById("openai-settings") as HTMLDivElement;
const googleApiKeyInput = document.getElementById("google-api-key") as HTMLInputElement;
const openaiApiKeyInput = document.getElementById("openai-api-key") as HTMLInputElement;
const toggleGoogleApiKeyBtn = document.getElementById("toggle-google-api-key") as HTMLButtonElement;
const toggleOpenAIApiKeyBtn = document.getElementById("toggle-openai-api-key") as HTMLButtonElement;
const googleModelSelect = document.getElementById("google-model-select") as HTMLSelectElement;
const openaiModelSelect = document.getElementById("openai-model-select") as HTMLSelectElement;
const saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLParagraphElement;

// --- Helper Functions ---
function populateSelect(selectElement: HTMLSelectElement, items: string[]) {
  selectElement.innerHTML = ''; // Clear existing options
  items.forEach(item => {
    const option = document.createElement("option");
    option.value = item;
    option.textContent = item;
    selectElement.appendChild(option);
  });
}

function updateVisibleSettings() {
  const selectedProvider = providerSelect.value;

  googleSettings.style.display = selectedProvider === "google" ? "block" : "none";
  openaiSettings.style.display = selectedProvider === "openai" ? "block" : "none";
}

function togglePasswordVisibility(input: HTMLInputElement, button: HTMLButtonElement) {
    if (input.type === "password") {
        input.type = "text";
        button.textContent = "HIDE";
    } else {
        input.type = "password";
        button.textContent = "SHOW";
    }
}

// --- Initialization and Event Listeners ---
async function initialize() {
  // 1. Populate model dropdowns
  populateSelect(googleModelSelect, GOOGLE_MODELS);
  populateSelect(openaiModelSelect, OPENAI_MODELS);

  // 2. Load saved settings from storage
  // 2. Load saved settings from storage
  const [
    selectedProvider,
    googleApiKey,
    googleModel,
    openaiApiKey,
    openaiModel
  ] = await Promise.all([
    storage.getItem<string>("local:selectedProvider"),
    storage.getItem<string>("local:googleApiKey"),
    storage.getItem<string>("local:googleModel"),
    storage.getItem<string>("local:openaiApiKey"),
    storage.getItem<string>("local:openaiModel"),
  ]);

  // Use the fetched values to populate the form
  providerSelect.value = selectedProvider || "google";
  googleApiKeyInput.value = googleApiKey || "";
  googleModelSelect.value = googleModel || GOOGLE_MODELS[0];
  openaiApiKeyInput.value = openaiApiKey || "";
  openaiModelSelect.value = openaiModel || OPENAI_MODELS[0];

  // 3. Set initial UI state
  updateVisibleSettings();

  // 4. Add event listeners
  providerSelect.addEventListener("change", updateVisibleSettings);

  toggleGoogleApiKeyBtn.addEventListener("click", () => togglePasswordVisibility(googleApiKeyInput, toggleGoogleApiKeyBtn));
  toggleOpenAIApiKeyBtn.addEventListener("click", () => togglePasswordVisibility(openaiApiKeyInput, toggleOpenAIApiKeyBtn));

  saveBtn.addEventListener("click", async () => {
    await Promise.all([
      storage.setItem("local:selectedProvider", providerSelect.value),
      storage.setItem("local:googleApiKey", googleApiKeyInput.value.trim()),
      storage.setItem("local:googleModel", googleModelSelect.value),
      storage.setItem("local:openaiApiKey", openaiApiKeyInput.value.trim()),
      storage.setItem("local:openaiModel", openaiModelSelect.value)
    ]);
    statusEl.textContent = "Settings saved!";
    setTimeout(() => {
      statusEl.textContent = "";
    }, 3000);
  });
}

document.addEventListener("DOMContentLoaded", initialize);
