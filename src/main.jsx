import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Error al iniciar Escuela de la Verdad:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <main className="auth-shell">
          <section className="auth-card">
            <p className="eyebrow">SISTEMA DE GESTIÓN · HONDURAS</p>
            <h1>Escuela de la Verdad</h1>
            <h2>No pudimos cargar la aplicación</h2>
            <p className="auth-description">Detectamos un error al iniciar. Tus registros no se han modificado.</p>
            <p className="auth-error" role="alert">{String(this.state.error?.message || this.state.error)}</p>
            <button className="login-button" type="button" onClick={() => window.location.reload()}>Volver a intentar</button>
          </section>
        </main>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </React.StrictMode>,
);
