import React, { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';

const modules = [
  { number: '01', title: 'Iglesias', description: 'Registro y consulta de iglesias participantes.' },
  { number: '02', title: 'Participantes', description: 'Datos y seguimiento de cada participante.' },
  { number: '03', title: 'Inscripciones', description: 'Inscripciones, niveles y estado de participación.' },
  { number: '04', title: 'Ofrendas y pagos', description: 'Ofrendas, cuotas y abonos registrados.' },
  { number: '05', title: 'Reportes', description: 'Consultas y resúmenes para coordinación.' },
];

function calculateAge(dateString) {
  if (!dateString) return null;
  const today = new Date();
  const birthDate = new Date(dateString + 'T00:00:00');
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age >= 0 ? age : null;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [activeModule, setActiveModule] = useState('');
  const [churches, setChurches] = useState([]);
  const [churchesLoading, setChurchesLoading] = useState(false);
  const [churchError, setChurchError] = useState('');
  const [churchName, setChurchName] = useState('');
  const [savingChurch, setSavingChurch] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantError, setParticipantError] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantCode, setParticipantCode] = useState('');
  const [participantChurch, setParticipantChurch] = useState('');
  const [participantBirthDate, setParticipantBirthDate] = useState('');
  const [participantSex, setParticipantSex] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [participantGuardian, setParticipantGuardian] = useState('');
  const [participantGuardianPhone, setParticipantGuardianPhone] = useState('');
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [savingParticipant, setSavingParticipant] = useState(false);

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

  useEffect(() => {
    if (!session?.user?.id) {
      setProfile(null);
      setProfileError('');
      return;
    }

    let active = true;
    setProfileLoading(true);
    setProfileError('');
    supabase
      .from('perfiles')
      .select('nombre, rol, activo')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error: profileQueryError }) => {
        if (!active) return;
        if (profileQueryError) {
          setProfileError('La sesión está activa, pero no se pudo consultar tu perfil. Verifica que tengas un perfil activo en Coordinación General.');
          setProfile(null);
        } else if (!data?.activo) {
          setProfileError('Tu perfil está inactivo. Comunícate con Coordinación General.');
          setProfile(null);
        } else {
          setProfile(data);
        }
        setProfileLoading(false);
      });

    return () => { active = false; };
  }, [session]);

  async function loadChurches() {
    setChurchesLoading(true);
    setChurchError('');
    const { data, error: queryError } = await supabase
      .from('iglesias')
      .select('id, nombre, activa, created_at')
      .order('nombre', { ascending: true });

    if (queryError) {
      setChurchError('No se pudieron consultar las iglesias. Revisa la conexión y los permisos de acceso.');
      setChurches([]);
    } else {
      setChurches(data ?? []);
    }
    setChurchesLoading(false);
  }

  useEffect(() => {
    if (activeModule === 'Iglesias' && profile?.rol === 'coordinacion_general' && profile.activo) {
      loadChurches();
    }
  }, [activeModule, profile]);

  async function loadParticipants() {
    setParticipantsLoading(true);
    setParticipantError('');
    const [{ data: participantData, error: participantQueryError }, { data: churchData, error: churchQueryError }] = await Promise.all([
      supabase.from('participantes')
        .select('id, codigo, nombre_completo, iglesia_id, fecha_nacimiento, sexo, telefono, nombre_encargado, telefono_encargado, activo, created_at')
        .order('nombre_completo', { ascending: true }),
      supabase.from('iglesias')
        .select('id, nombre, activa')
        .order('nombre', { ascending: true }),
    ]);

    if (participantQueryError || churchQueryError) {
      setParticipantError('No se pudieron consultar los participantes o las iglesias. Revisa la conexión y los permisos de acceso.');
      setParticipants([]);
      if (!churchQueryError) setChurches(churchData ?? []);
    } else {
      setParticipants((participantData ?? []).map((participant) => ({
        ...participant,
        iglesia: (churchData ?? []).find((church) => church.id === participant.iglesia_id)?.nombre ?? '',
      })));
      setChurches((churchData ?? []).filter((church) => church.activa));
    }
    setParticipantsLoading(false);
  }

  useEffect(() => {
    if (activeModule === 'Participantes' && profile?.rol === 'coordinacion_general' && profile.activo) {
      loadParticipants();
    }
  }, [activeModule, profile]);

  const hasDuplicateParticipant = participantName.trim() && participants.some(
    (participant) => participant.nombre_completo.trim().toLocaleLowerCase() === participantName.trim().toLocaleLowerCase()
  );

  async function handleAddParticipant(event) {
    event.preventDefault();
    const name = participantName.trim();
    if (!name || (hasDuplicateParticipant && !confirmDuplicate)) return;
    setSavingParticipant(true);
    setParticipantError('');
    const { error: insertError } = await supabase
      .from('participantes')
      .insert({
        nombre_completo: name,
        codigo: participantCode.trim() || null,
        iglesia_id: participantChurch || null,
        fecha_nacimiento: participantBirthDate || null,
        sexo: participantSex || null,
        telefono: participantPhone.trim() || null,
        nombre_encargado: participantGuardian.trim() || null,
        telefono_encargado: participantGuardianPhone.trim() || null,
        activo: true,
      });

    if (insertError) {
      setParticipantError(insertError.code === '23505'
        ? 'Ese código ya está asignado a otro participante. Revisa el dato e inténtalo de nuevo.'
        : 'No se pudo guardar el participante. Verifica los permisos e inténtalo de nuevo.');
    } else {
      setParticipantName('');
      setParticipantCode('');
      setParticipantChurch('');
      setParticipantBirthDate('');
      setParticipantSex('');
      setParticipantPhone('');
      setParticipantGuardian('');
      setParticipantGuardianPhone('');
      setConfirmDuplicate(false);
      await loadParticipants();
    }
    setSavingParticipant(false);
  }

  async function handleToggleParticipant(participant) {
    setParticipantError('');
    const { error: updateError } = await supabase
      .from('participantes')
      .update({ activo: !participant.activo })
      .eq('id', participant.id);

    if (updateError) {
      setParticipantError('No se pudo actualizar el estado del participante.');
    } else {
      await loadParticipants();
    }
  }

  async function handleAddChurch(event) {
    event.preventDefault();
    const name = churchName.trim();
    if (!name) return;
    setSavingChurch(true);
    setChurchError('');
    const { error: insertError } = await supabase
      .from('iglesias')
      .insert({ nombre: name, activa: true });

    if (insertError) {
      setChurchError(insertError.code === '23505'
        ? 'Ya existe una iglesia con ese nombre.'
        : 'No se pudo guardar la iglesia. Verifica los permisos e inténtalo de nuevo.');
    } else {
      setChurchName('');
      await loadChurches();
    }
    setSavingChurch(false);
  }

  async function handleToggleChurch(church) {
    setChurchError('');
    const { error: updateError } = await supabase
      .from('iglesias')
      .update({ activa: !church.activa })
      .eq('id', church.id);

    if (updateError) {
      setChurchError('No se pudo actualizar el estado de la iglesia.');
    } else {
      await loadChurches();
    }
  }

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

      {activeModule === 'Iglesias' ? (
        <section className="work-section">
          <button className="back-button" type="button" onClick={() => setActiveModule('')}>← Volver a módulos</button>
          <div className="section-heading">
            <div><p className="eyebrow">REGISTRO GENERAL</p><h2>Iglesias</h2><p className="work-intro">Administra las iglesias que participan en la Escuela de la Verdad.</p></div>
            <span className="module-count">{churches.length} registradas</span>
          </div>

          <form className="church-form" onSubmit={handleAddChurch}>
            <label htmlFor="church-name">Agregar iglesia</label>
            <div className="church-form-row">
              <input id="church-name" value={churchName} onChange={(event) => setChurchName(event.target.value)} placeholder="Nombre de la iglesia" maxLength={120} required />
              <button className="primary-button" type="submit" disabled={savingChurch || !churchName.trim()}>{savingChurch ? 'Guardando…' : 'Agregar iglesia'}</button>
            </div>
          </form>

          {churchError && <p className="auth-error" role="alert">{churchError}</p>}
          <div className="church-list">
            {churchesLoading ? <p className="empty-state">Cargando iglesias…</p> : churches.length === 0 ? (
              <div className="empty-state"><strong>Aún no hay iglesias registradas.</strong><span>Cuando agregues una, aparecerá en esta lista.</span></div>
            ) : (
              churches.map((church) => (
                <article className="church-row" key={church.id}>
                  <div><strong>{church.nombre}</strong><span className={church.activa ? 'status-active' : 'status-inactive'}>{church.activa ? 'Activa' : 'Inactiva'}</span></div>
                  <button className="text-button" type="button" onClick={() => handleToggleChurch(church)}>{church.activa ? 'Desactivar' : 'Activar'}</button>
                </article>
              ))
            )}
          </div>
        </section>
      ) : activeModule === 'Participantes' ? (
        <section className="work-section">
          <button className="back-button" type="button" onClick={() => setActiveModule('')}>← Volver a módulos</button>
          <div className="section-heading">
            <div><p className="eyebrow">REGISTRO GENERAL</p><h2>Participantes</h2><p className="work-intro">Registra a cada estudiante una sola vez y vincúlalo con su iglesia.</p></div>
            <span className="module-count">{participants.length} registrados</span>
          </div>

          <form className="church-form participant-form" onSubmit={handleAddParticipant}>
            <label htmlFor="participant-name">Agregar participante</label>
            <div className="participant-fields">
              <div className="participant-field">
                <label htmlFor="participant-name">Nombre completo *</label>
                <input id="participant-name" value={participantName} onChange={(event) => { setParticipantName(event.target.value); setConfirmDuplicate(false); }} placeholder="Nombre y apellidos" maxLength={180} required />
              </div>
              <div className="participant-field">
                <label htmlFor="participant-code">Código (opcional)</label>
                <input id="participant-code" value={participantCode} onChange={(event) => setParticipantCode(event.target.value)} placeholder="Código del participante" maxLength={40} />
              </div>
              <div className="participant-field">
                <label htmlFor="participant-church">Iglesia</label>
                <select id="participant-church" value={participantChurch} onChange={(event) => setParticipantChurch(event.target.value)}>
                  <option value="">Sin iglesia asignada</option>
                  {churches.map((church) => <option key={church.id} value={church.id}>{church.nombre}</option>)}
                </select>
              </div>
              <div className="participant-field">
                <label htmlFor="participant-birth">Fecha de nacimiento</label>
                <input id="participant-birth" type="date" value={participantBirthDate} onChange={(event) => setParticipantBirthDate(event.target.value)} max={new Date().toISOString().slice(0, 10)} />
                {participantBirthDate && <small className="field-hint">Edad actual: {calculateAge(participantBirthDate)} años</small>}
              </div>
              <div className="participant-field">
                <label htmlFor="participant-sex">Sexo</label>
                <select id="participant-sex" value={participantSex} onChange={(event) => setParticipantSex(event.target.value)}>
                  <option value="">Sin especificar</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>
              <div className="participant-field">
                <label htmlFor="participant-phone">Teléfono del participante</label>
                <input id="participant-phone" type="tel" value={participantPhone} onChange={(event) => setParticipantPhone(event.target.value)} placeholder="Número de contacto" maxLength={30} />
              </div>
              <div className="participant-field">
                <label htmlFor="participant-guardian">Padre, madre o encargado</label>
                <input id="participant-guardian" value={participantGuardian} onChange={(event) => setParticipantGuardian(event.target.value)} placeholder="Nombre del encargado" maxLength={180} />
              </div>
              <div className="participant-field">
                <label htmlFor="participant-guardian-phone">Teléfono del encargado</label>
                <input id="participant-guardian-phone" type="tel" value={participantGuardianPhone} onChange={(event) => setParticipantGuardianPhone(event.target.value)} placeholder="Número de contacto" maxLength={30} />
              </div>
            </div>
            {hasDuplicateParticipant && (
              <label className="duplicate-confirm">
                <input type="checkbox" checked={confirmDuplicate} onChange={(event) => setConfirmDuplicate(event.target.checked)} />
                Ya verifiqué que es otra persona y no un registro duplicado.
              </label>
            )}
            <div className="participant-submit">
              <button className="primary-button" type="submit" disabled={savingParticipant || !participantName.trim() || (hasDuplicateParticipant && !confirmDuplicate)}>{savingParticipant ? 'Guardando…' : 'Agregar participante'}</button>
            </div>
          </form>

          {participantError && <p className="auth-error" role="alert">{participantError}</p>}
          <div className="participant-list">
            {participantsLoading ? <p className="empty-state">Cargando participantes…</p> : participants.length === 0 ? (
              <div className="empty-state"><strong>Aún no hay participantes registrados.</strong><span>Cuando agregues uno, aparecerá en esta lista.</span></div>
            ) : (
              participants.map((participant) => (
                <article className="participant-row" key={participant.id}>
                  <div className="participant-info">
                    <strong>{participant.nombre_completo}</strong>
                    <span>{participant.iglesia || 'Sin iglesia asignada'}{participant.codigo ? ` · Código: ${participant.codigo}` : ''}</span>
                    {(participant.fecha_nacimiento || participant.sexo) && <span>{participant.fecha_nacimiento ? `Edad: ${calculateAge(participant.fecha_nacimiento)} años` : ''}{participant.fecha_nacimiento && participant.sexo ? ' · ' : ''}{participant.sexo || ''}</span>}
                    {(participant.telefono || participant.nombre_encargado || participant.telefono_encargado) && <span>{participant.telefono ? `Teléfono: ${participant.telefono}` : ''}{participant.nombre_encargado ? ` · Encargado: ${participant.nombre_encargado}` : ''}{participant.telefono_encargado ? ` · Tel. encargado: ${participant.telefono_encargado}` : ''}</span>}
                    <span className={participant.activo ? 'status-active' : 'status-inactive'}>{participant.activo ? 'Activo' : 'Inactivo'}</span>
                  </div>
                  <button className="text-button" type="button" onClick={() => handleToggleParticipant(participant)}>{participant.activo ? 'Desactivar' : 'Activar'}</button>
                </article>
              ))
            )}
          </div>
        </section>
      ) : (
        <>
          <section className="welcome">
            <img className="school-logo" src="/logo-escuela-verdad.png" alt="Logo oficial de Escuela de la Verdad" />
            <div className="welcome-copy">
              <p className="eyebrow">SISTEMA DE GESTIÓN</p>
              <h1>Escuela de la Verdad</h1>
              <p className="motto">DIOS <span>·</span> EDUCACIÓN <span>·</span> CARÁCTER</p>
              <p className="intro">Un espacio para organizar la información de iglesias, participantes, inscripciones y actividades de la Escuela de la Verdad.</p>
              <div className="connection-note connected"><span className="connection-dot" />Sesión iniciada correctamente</div>
              {profileLoading && <p className="auth-description">Comprobando permisos del perfil…</p>}
              {profileError && <p className="auth-error" role="alert">{profileError}</p>}
              {profile && <p className="auth-description">Perfil verificado: {profile.nombre} · {profile.rol}</p>}
            </div>
          </section>
          <section className="modules-section">
            <div className="section-heading">
              <div><p className="eyebrow">ÁREAS DEL SISTEMA</p><h2>Módulos de trabajo</h2></div>
              <span className="module-count">05 módulos</span>
            </div>
            <div className="module-grid">
              {modules.map((module) => (
                <button className="module-card module-card-button" key={module.number} type="button" onClick={() => ['Iglesias', 'Participantes'].includes(module.title) && setActiveModule(module.title)}>
                  <span className="module-number">{module.number}</span>
                  <h3>{module.title}</h3>
                  <p>{module.description}</p>
                  <span className="module-arrow" aria-hidden="true">↗</span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
      <footer>Escuela de la Verdad · Honduras</footer>
    </main>
  );
}
