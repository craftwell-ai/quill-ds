import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'
import { managerTheme } from '../src/tokens/generated/manager-theme.mjs'

addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Quill Design System',
    brandImage: '/quill-lockup-sm-light.svg',
    brandUrl: '/',
    brandTarget: '_self',
    fontBase: '"Raleway", -apple-system, BlinkMacSystemFont, sans-serif',
    fontCode: 'ui-monospace, "SF Mono", Menlo, monospace',
    ...managerTheme,
  }),

  // Sidebar panel config
  sidebar: {
    showRoots: true,
  },
})

// Inject custom CSS into the manager chrome
const style = document.createElement('style')
style.textContent = `
  /* Load brand fonts */
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..900;1,9..144,300..900&family=Raleway:wght@400;500;600&display=swap');

  /* Sidebar brand logo area */
  #storybook-explorer-menu a[href="/"] {
    padding: 16px;
  }

  /* Nav root group labels (e.g. "UI", "Docs") */
  [data-nodetype="root"] button,
  [data-nodetype="root"] span {
    font-family: "Fraunces", Georgia, serif;
    font-weight: 400;
    font-size: 11px;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #675F58 !important;
    font-variation-settings: "opsz" 14, "SOFT" 100;
  }

  /* Story + component nav items */
  [data-nodetype="story"] button,
  [data-nodetype="component"] button,
  [data-nodetype="document"] button {
    font-family: "Raleway", -apple-system, BlinkMacSystemFont, sans-serif;
    font-size: 13px;
    border-radius: 6px;
  }

  /* Active story highlight */
  [data-nodetype="story"] button[data-selected="true"],
  [data-nodetype="document"] button[data-selected="true"] {
    background: rgba(196, 104, 75, 0.1) !important;
    color: #944A33 !important;
    font-weight: 500;
  }

  /* Sidebar scrollbar */
  #storybook-explorer-menu::-webkit-scrollbar {
    width: 4px;
  }
  #storybook-explorer-menu::-webkit-scrollbar-track {
    background: transparent;
  }
  #storybook-explorer-menu::-webkit-scrollbar-thumb {
    background: rgba(42, 38, 34, 0.15);
    border-radius: 2px;
  }
`
document.head.appendChild(style)
