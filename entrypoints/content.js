import { browser } from "wxt/browser";

export default defineContentScript({
  matches: ["<all_urls>"],
  main() {
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "GET_PAGE_CONTENT") {
        sendResponse({ content: document.body.innerText });
      }
    });
  }
});
