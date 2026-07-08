import {StrictMode} from 'react';
import {renderToString} from 'react-dom/server';

import {App} from './App';

/**
 * Server entry used only at build time by `prerender.js` to snapshot the app
 * into static HTML. The client still hydrates from `main.tsx` at runtime; this
 * exists so crawlers and link unfurlers receive real body content instead of an
 * empty `#root`.
 */
export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
