import { defineConfig } from "wxt";

export default defineConfig({
  manifestVersion: 3,
  manifest: ({ browser, manifestVersion, mode, command }) => (
    {
      name: "Page LLM",
      version: "1.0",
      description: "A simple extension to talk with the current page",
      permissions: ['storage'],
      commands: {},
      options_ui: {
        page: "entrypoints/options/index.html",
        open_in_tab: true
      },
      // Conditionally add Firefox-specific settings
      ...(browser === "firefox" && {
        browser_specific_settings: {
          gecko: {
            id: "page-llm@dceluis",
            strict_min_version: "109.0"
          }
        }
      })
    }
  ),
  runner: {
    startUrls: ["https://x.com/dceluis/"]
  },
  outDirTemplate: "{{browser}}-mv{{manifestVersion}}{{modeSuffix}}"
});
