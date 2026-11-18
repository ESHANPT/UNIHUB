import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './store/ThemeContext';
import { AuthProvider } from './store/AuthContext';
import { ClassDataProvider } from './store/ClassDataContext';
import { PwaProvider } from './store/PwaContext';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/Confirm';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ToastProvider>
      <ConfirmProvider>
        <PwaProvider>
          <BrowserRouter>
            <ThemeProvider>
              <AuthProvider>
                <ClassDataProvider>
                  <App />
                </ClassDataProvider>
              </AuthProvider>
            </ThemeProvider>
          </BrowserRouter>
        </PwaProvider>
      </ConfirmProvider>
    </ToastProvider>
  </StrictMode>,
);
