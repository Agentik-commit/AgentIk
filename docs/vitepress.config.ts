import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Agentik Documentation',
  description: 'Complete documentation for the Agentik artificial life simulation platform',
  
  // Base path for GitHub Pages deployment
  base: process.env.DOCS_BASE || '/',
  
  // Ignore dead links for localhost URLs and internal links
  ignoreDeadLinks: [
    /^http:\/\/localhost/,
    /^\/guide\//,
    /^\/spec\//
  ],
  
  // Theme configuration
  themeConfig: {
    // Site navigation
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Reference', link: '/reference/api' },
      { text: 'Specs', link: '/spec/openapi' }
    ],

    // Sidebar navigation
    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/getting-started' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Simulation Engine', link: '/guide/simulation-engine' }
          ]
        },
        {
          text: 'Features',
          items: [
            { text: 'Maps and Assets', link: '/guide/maps-and-assets' },
            { text: 'Persistence', link: '/guide/persistence' },
            { text: 'Multiverse', link: '/guide/multiverse' }
          ]
        },
        {
          text: 'Deployment',
          items: [
            { text: 'Environment', link: '/guide/environment' },
            { text: 'Deployment', link: '/guide/deployment' },
            { text: 'Troubleshooting', link: '/guide/troubleshooting' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'API Reference',
          items: [
            { text: 'REST API', link: '/reference/api' },
            { text: 'Database', link: '/reference/db' },
            { text: 'Events', link: '/reference/events' },
            { text: 'Configuration', link: '/reference/config' }
          ]
        }
      ],
      '/spec/': [
        {
          text: 'Specifications',
          items: [
            { text: 'OpenAPI', link: '/spec/openapi' },
            { text: 'Database Schema', link: '/spec/db-schema' }
          ]
        }
      ]
    },

    // Social links
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Agentik-commit/AgentIk' }
    ],

    // Footer
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present Agentik Team'
    },

    // Search
    search: {
      provider: 'local'
    }
  },

  // Markdown configuration
  markdown: {
    // Enable Mermaid diagrams
    config: (md) => {
      // Add Mermaid support
      md.use(require('markdown-it-mermaid'))
    }
  },

  // Vite configuration
  vite: {
    // Optimize dependencies
    optimizeDeps: {
      include: ['vitepress']
    }
  }
})
