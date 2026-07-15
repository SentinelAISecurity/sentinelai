import { defineConfig } from "vitepress";

export default defineConfig({
  title: "SentinelAI",
  description: "AI-Powered Web3 Security Platform Documentation",
  lang: "en-US",
  base: "/",

  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "SentinelAI",

    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
      { text: "Plugins", link: "/plugins/" },
      {
        text: "GitHub",
        link: "https://github.com/sentinelai/sentinelai",
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/guide/" },
            { text: "Installation", link: "/guide/installation" },
            { text: "Quick Start", link: "/guide/quick-start" },
            { text: "Configuration", link: "/guide/configuration" },
          ],
        },
        {
          text: "Core Concepts",
          items: [
            { text: "Architecture", link: "/guide/architecture" },
            { text: "Plugin System", link: "/guide/plugin-system" },
            { text: "AI Engine", link: "/guide/ai-engine" },
            { text: "Security Model", link: "/guide/security-model" },
          ],
        },
        {
          text: "Features",
          items: [
            { text: "Smart Contract Analysis", link: "/guide/analysis" },
            { text: "Vulnerability Detection", link: "/guide/vulnerabilities" },
            { text: "Monitoring", link: "/guide/monitoring" },
            { text: "Report Generation", link: "/guide/reports" },
          ],
        },
      ],
      "/api/": [
        {
          text: "API Reference",
          items: [
            { text: "Overview", link: "/api/" },
            { text: "Authentication", link: "/api/auth" },
            { text: "Audits", link: "/api/audits" },
            { text: "Contracts", link: "/api/contracts" },
            { text: "Monitoring", link: "/api/monitoring" },
            { text: "Alerts", link: "/api/alerts" },
            { text: "Plugins", link: "/api/plugins" },
            { text: "AI", link: "/api/ai" },
            { text: "Reports", link: "/api/reports" },
            { text: "Dashboard", link: "/api/dashboard" },
          ],
        },
      ],
      "/plugins/": [
        {
          text: "Plugin Development",
          items: [
            { text: "Overview", link: "/plugins/" },
            { text: "Getting Started", link: "/plugins/getting-started" },
            { text: "Plugin Interface", link: "/plugins/interface" },
            { text: "Manifest", link: "/plugins/manifest" },
            { text: "Testing", link: "/plugins/testing" },
            { text: "Publishing", link: "/plugins/publishing" },
          ],
        },
        {
          text: "Built-in Plugins",
          items: [
            { text: "Reentrancy Scanner", link: "/plugins/reentrancy" },
            { text: "Access Control", link: "/plugins/access-control" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/sentinelai/sentinelai" },
      { icon: "twitter", link: "https://twitter.com/sentinelai" },
    ],

    search: {
      provider: "local",
    },

    footer: {
      message: "Released under the Apache 2.0 License.",
      copyright: "Copyright © 2024 SentinelAI Contributors",
    },

    editLink: {
      pattern: "https://github.com/sentinelai/sentinelai/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
  },
});
