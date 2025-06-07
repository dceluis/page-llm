// entrypoints/popup/main.ts
import { storage } from "wxt/storage";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";

// --- UI Elements ---
const instructionInput = document.getElementById("instruction") as HTMLTextAreaElement;
const sendBtn = document.getElementById("send-btn") as HTMLButtonElement;
const outputField = document.getElementById("output") as HTMLTextAreaElement;
const copyBtn = document.getElementById("copy-btn") as HTMLButtonElement;
const promptSelect = document.getElementById("prompt-select") as HTMLSelectElement;
const providerPill = document.getElementById("provider-pill") as HTMLSpanElement;

// --- Prompt Definitions ---
const quickPrompts = [
  { name: "Summarize Page", text: "Summarize the content of this page in a few key bullet points." },
  { name: "Explain Like I'm 5", text: "Explain the main concepts of this page like I'm 5 years old." },
  { name: "Find Key Terms", text: "Identify and define the key technical terms mentioned on this page." },
  { name: "Suggest Improvements", text: "Read the provided text and suggest 3 improvements to make it clearer and more concise." },
];

// --- Initialization ---
function initialize() {
  quickPrompts.forEach((prompt) => {
    const option = document.createElement("option");
    option.value = prompt.text;
    option.textContent = prompt.name;
    promptSelect.appendChild(option);
  });

  storage.getItem<string>("local:instruction").then((savedInstruction) => {
    if (savedInstruction) {
      instructionInput.value = savedInstruction;
    }
  });

  storage.getItem<string>("local:selectedProvider").then((provider) => {
    const providerName = provider || "google";
    if (providerPill) {
      providerPill.textContent = providerName;
    }
  });

  const originalCopyBtnHTML = copyBtn.innerHTML;

  promptSelect.addEventListener("change", () => {
    if (promptSelect.value) {
      instructionInput.value = promptSelect.value;
      instructionInput.focus();
    }
  });

  sendBtn.addEventListener("click", handleSend);

  instructionInput.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  });

  copyBtn.addEventListener("click", async () => {
    if (!outputField.value || copyBtn.textContent === "Copied!") return;
    try {
      await navigator.clipboard.writeText(outputField.value);
      copyBtn.innerHTML = `<span>Copied!</span>`;
      setTimeout(() => { copyBtn.innerHTML = originalCopyBtnHTML; }, 2000);
    } catch (err) {
      copyBtn.innerHTML = `<span>Error</span>`;
      setTimeout(() => { copyBtn.innerHTML = originalCopyBtnHTML; }, 2000);
    }
  });
}

// --- Core Logic ---
async function handleSend() {
  const instruction = instructionInput.value.trim();
  if (!instruction || sendBtn.disabled) return;

  sendBtn.disabled = true;
  outputField.value = "Processing...";

  try {
    await storage.setItem("local:instruction", instruction);

    const provider = await storage.getItem<string>("local:selectedProvider") || "google";
    let apiKey: string | undefined | null;
    let modelName: string | undefined | null;
    let aiProvider: any;
    let model: any;

    if (provider === "google") {
        apiKey = await storage.getItem<string>("local:googleApiKey");
        modelName = await storage.getItem<string>("local:googleModel");
        if (!apiKey || !modelName) throw new Error("Google API Key or Model not set in options.");
        aiProvider = createGoogleGenerativeAI({ apiKey });
        model = aiProvider.chat(modelName as any);

    } else if (provider === "openai") {
        apiKey = await storage.getItem<string>("local:openaiApiKey");
        modelName = await storage.getItem<string>("local:openaiModel");
        if (!apiKey || !modelName) throw new Error("OpenAI API Key or Model not set in options.");
        aiProvider = createOpenAI({ apiKey });
        model = aiProvider.chat(modelName as any);
    } else {
        throw new Error("No valid AI provider selected in options.");
    }
    
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tabs?.[0]?.id) throw new Error("Could not find an active tab.");
    
    const response = await browser.tabs.sendMessage(tabs[0].id, { type: "GET_PAGE_CONTENT" });
    const pageContent = (response as { content: string })?.content ?? "";

    const fullPrompt = `${instruction}\n\nPage Content:\n${pageContent}`;
    
    const { text } = await generateText({ model, prompt: fullPrompt });
    outputField.value = text;

  } catch (err: any) {
    console.error(err);
    outputField.value = "Error: " + (err.message || "An unknown error occurred.");
  } finally {
    sendBtn.disabled = false;
  }
}

// Run the app
document.addEventListener("DOMContentLoaded", initialize);
