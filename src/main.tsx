import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { validateEnvironment } from "./lib/env";
import { logger } from "./lib/logger";

// Validate environment variables before starting the app
try {
  validateEnvironment();
  logger.info('Application starting', { 
    mode: import.meta.env.MODE,
    version: import.meta.env.VITE_APP_VERSION || '1.0.0'
  });
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : 'Environment validation failed';
  document.getElementById("root")!.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="max-width: 600px; text-align: center;">
        <h1 style="color: #dc2626; margin-bottom: 16px;">Configuration Error</h1>
        <p style="color: #4b5563; margin-bottom: 24px;">${errorMessage}</p>
        <p style="color: #6b7280; font-size: 14px;">
          Please check your environment configuration and try again.
          See <code>.env.example</code> for required variables.
        </p>
      </div>
    </div>
  `;
  throw error;
}

createRoot(document.getElementById("root")!).render(<App />);
