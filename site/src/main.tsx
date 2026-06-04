import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';

import 'silver-ui/styles.css';
import './styles.css';

import {App} from './App';

const rootElement = document.getElementById('root');
if (rootElement == null) {
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
