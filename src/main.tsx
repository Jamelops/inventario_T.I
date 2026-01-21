import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Debug logging
if (import.meta.env.DEV) {
  console.log('🚀 [App] Starting initialization...');
  console.log('📦 [App] Supabase Config:', {
    url: import.meta.env.VITE_SUPABASE_URL ? '✅ Configured' : '⚠️ Missing',
    key: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Configured' : '⚠️ Missing',
    environment: import.meta.env.MODE,
  });
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found. Make sure index.html has <div id="root"></div>');
}

const root = createRoot(rootElement);

try {
  root.render(<App />);
  if (import.meta.env.DEV) {
    console.log('✅ [App] Successfully rendered');
  }
} catch (error) {
  console.error('❌ [App] Failed to render:', error);
  rootElement.innerHTML = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background: #f5f5f5;
      font-family: system-ui, -apple-system, sans-serif;
    ">
      <div style="
        text-align: center;
        padding: 40px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        max-width: 500px;
      ">
        <h1 style="color: #d32f2f; margin-top: 0;">⚠️ Erro na Inicialização</h1>
        <p style="color: #666; margin-bottom: 20px;">
          Houve um erro ao inicializar a aplicação. Verifique o console para mais detalhes.
        </p>
        <button onclick="location.reload()" style="
          padding: 10px 20px;
          background: #1976d2;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        ">Recarregar Página</button>
      </div>
    </div>
  `;
  throw error;
}
