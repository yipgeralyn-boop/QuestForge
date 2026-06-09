import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function showErr(msg) {
  const d = document.createElement('div');
  d.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#c0392b;color:#fff;padding:14px 16px;z-index:2147483647;font:13px/1.5 monospace;word-break:break-all;white-space:pre-wrap;max-height:60vh;overflow-y:auto';
  d.textContent = msg;
  document.body.appendChild(d);
}

window.addEventListener('error', e => {
  showErr('ERROR: ' + e.message + '\n' + (e.filename || '') + ':' + e.lineno + '\n' + (e.error?.stack || ''));
});
window.addEventListener('unhandledrejection', e => {
  showErr('UNHANDLED: ' + String(e.reason));
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
