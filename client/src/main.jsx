import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Локальные шрифты — не зависим от Google CDN (заблокирован у части РФ-провайдеров)
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/pt-serif/400.css';
import '@fontsource/pt-serif/400-italic.css';
import '@fontsource/pt-serif/700.css';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#fff' }}>
          <div style={{ textAlign: 'center', color: '#888', fontSize: 13 }}>
            <div style={{ marginBottom: 8 }}>Что-то пошло не так</div>
            <button onClick={() => window.location.reload()} style={{ fontSize: 13, cursor: 'pointer', background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '6px 16px' }}>
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
