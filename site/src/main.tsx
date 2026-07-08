import {StrictMode} from 'react';
import {createRoot, hydrateRoot} from 'react-dom/client';

import 'silver-ui/styles.css';
import './styles.css';

import {App} from './App';

const rootElement = document.getElementById('root');
if (rootElement == null) {
  throw new Error('Root element not found');
}

const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// The production build prerenders the app into #root (see prerender.js), so we
// hydrate that markup instead of re-rendering it. In dev there is no prerendered
// content, so fall back to a fresh client render.
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
