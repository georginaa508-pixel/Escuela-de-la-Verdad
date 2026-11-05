import React, { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';

const modules = [
  { number: '01', title: 'Iglesias', description: 'Registro y consulta de iglesias participantes.' },
  { number: '02', title: 'Participantes', description: 'Datos y seguimiento de cada participante.' },
  { number: '03', title: 'Inscripciones', description: 'Inscripciones, niveles y estado de participación.' },
  { number: '04', title: 'Ofrendas y pagos', description: 'Ofrendas, cuotas y abonos registrados.' },
  { number: '05', title: 'Reportes', description: 'Consultas y resúmenes para coordinación.' },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setCheckingSession(false);
      return undefined;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!mounted) return;
      if (sessionError) setError('No pudimos comprobar tu sesión. Intenta actualizar la página.');
      setSession(data?.session ?? null);
      setCheckingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setCheckingSession(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleLogin(event) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (loginError) {
      setError('No se pudo iniciar sesión. Revisa el correo y la contraseña e inténtalo de nuevo.');
    }
    setSubmitting(false);
  }

  async function handleLogout() {
    setError('');
    const { error: logoutError } = await supabase.auth.signOut();
    if (logoutError) setError('No se pudo cerrar la sesión. Intenta de nuevo.');
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <img className="auth-logo" src="/logo-escuela-verdad.png" alt="Logo oficial de Escuela de la Verdad" />
          <p className="eyebrow">SISTEMA DE GESTIÓN · HONDURAS</p>
          <h1>Escuela de la Verdad</h1>
          <p className="motto">DIOS <span>·</span> EDUCACIÓN <span>·</span> CARÁCTER</p>
          <p className="auth-message">La conexión con la base de datos está pendiente de configuración.</p>
        </section>
      </main>
    );
  }

  if (checkingSession) {
    return <main className="auth-shell"><p className="loading-text">Comprobando sesión…</p></main>;
  }

  if (!session) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <img className="auth-logo" src="/logo-escuela-verdad.png" alt="Logo oficial de Escuela de la Verdad" />
          <p className="eyebrow">SISTEMA DE GESTIÓN · HONDURAS</p>
          <h1>Escuela de la Verdad</h1>
          <p className="motto">DIOS <span>·</span> EDUCACIÓN <span>·</span> CARÁCTER</p>
          <div className="auth-divider" />
          <h2>Iniciar sesión</h2>
          <p className="auth-description">Ingresa con la cuenta que te asignó Coordinación General.</p>
          <form className="login-form" onSubmit={handleLogin}>
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="tu correo electrónico" required />
            <label htmlFor="password">Contraseña</label>
            <div className="password-field">
              <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tu contraseña" required />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Ocultar' : 'Mostrar'}</button>
            </div>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="login-button" type="submit" disabled={submitting}>
              {submitting ? 'Ingresando…' : 'Entrar al sistema'}
            </button>
          </form>
          <p className="auth-footnote">Si no puedes ingresar, comunícate con Coordinación General.</p>
        </section>
        <footer className="auth-footer">Escuela de la Verdad · Honduras</footer>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <header className="topbar">
        <span className="eyebrow">HONDURAS</span>
        <div className="account-area">
          <span className="account-email">{session.user.email}</span>
          <button className="logout-button" type="button" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </header>
      <section className="welcome">
        <img className="school-logo" src="/logo-escuela-verdad.png" alt="Logo oficial de Escuela de la Verdad" />
        <div className="welcome-copy">
          <p className="eyebrow">SISTEMA DE GESTIÓN</p>
          <h1>Escuela de la Verdad</h1>
          <p className="motto">DIOS <span>·</span> EDUCACIÓN <span>·</span> CARÁCTER</p>
          <p className="intro">Un espacio para organizar la información de iglesias, participantes, inscripciones y actividades de la Escuela de la Verdad.</p>
          <div className="connection-note connected"><span className="connection-dot" />Sesión iniciada correctamente</div>
        </div>
      </section>
      <section className="modules-section">
        <div className="section-heading">
          <div><p className="eyebrow">ÁREAS DEL SISTEMA</p><h2>Módulos de trabajo</h2></div>
          <span className="module-count">05 módulos</span>
        </div>
        <div className="module-grid">
          {modules.map((module) => (
            <article className="module-card" key={module.number}>
              <span className="module-number">{module.number}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
              <span className="module-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>
      <footer>Escuela de la Verdad · Honduras</footer>
    </main>
  );
}
