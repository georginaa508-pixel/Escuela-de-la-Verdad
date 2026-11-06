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
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [editingParticipant, setEditingParticipant] = useState(false);
  const [participantBeforeEdit, setParticipantBeforeEdit] = useState(null);
  const [savingParticipantChanges, setSavingParticipantChanges] = useState(false);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantError, setParticipantError] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [participantChurch, setParticipantChurch] = useState('');
  const [participantBirthDate, setParticipantBirthDate] = useState('');
  const [participantSex, setParticipantSex] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [participantNeedsBook, setParticipantNeedsBook] = useState('false');
  const [participantDiet, setParticipantDiet] = useState('');
  const [participantGuidelinesSigned, setParticipantGuidelinesSigned] = useState('false');
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [savingParticipant, setSavingParticipant] = useState(false);
  const [enrollmentParticipants, setEnrollmentParticipants] = useState([]);
  const [enrollmentCycles, setEnrollmentCycles] = useState([]);
  const [enrollmentLevels, setEnrollmentLevels] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  const [enrollmentParticipantId, setEnrollmentParticipantId] = useState('');
  const [enrollmentCycleId, setEnrollmentCycleId] = useState('');
  const [savingEnrollment, setSavingEnrollment] = useState(false);
  const [participationDrafts, setParticipationDrafts] = useState({});
  const [savingParticipationId, setSavingParticipationId] = useState('');

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
        .select('id, codigo, nombre_completo, iglesia_id, fecha_nacimiento, sexo, telefono, necesita_libro, dieta_especial, formulario_directrices_firmado, activo, created_at')
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

  async function loadEnrollments() {
    setEnrollmentsLoading(true);
    setEnrollmentError('');
    const [
      { data: participantData, error: participantQueryError },
      { data: churchData, error: churchQueryError },
      { data: cycleData, error: cycleQueryError },
      { data: levelData, error: levelQueryError },
      { data: enrollmentData, error: enrollmentQueryError },
    ] = await Promise.all([
      supabase.from('participantes')
        .select('id, codigo, nombre_completo, iglesia_id, activo')
        .order('nombre_completo', { ascending: true }),
      supabase.from('iglesias').select('id, nombre'),
      supabase.from('ciclos_escolares')
        .select('id, anio, fecha_inicio, fecha_fin, estado')
        .order('anio', { ascending: false }),
      supabase.from('niveles')
        .select('id, numero, nombre, activo')
        .order('numero', { ascending: true }),
      supabase.from('inscripciones')
        .select('id, participante_id, ciclo_id, nivel_id, estado, observaciones, tipo_participacion, created_at')
        .order('created_at', { ascending: false }),
    ]);

    if (participantQueryError || churchQueryError || cycleQueryError || levelQueryError || enrollmentQueryError) {
      setEnrollmentError('No se pudieron consultar los datos de inscripciones. Revisa la conexión y los permisos de acceso.');
      setEnrollmentParticipants([]);
      setEnrollmentCycles([]);
      setEnrollmentLevels([]);
      setEnrollments([]);
    } else {
      const churchesById = new Map((churchData ?? []).map((church) => [church.id, church.nombre]));
      const participantsWithChurch = (participantData ?? []).map((participant) => ({
        ...participant,
        iglesia: churchesById.get(participant.iglesia_id) || '',
      }));
      const cycles = cycleData ?? [];
      const levels = levelData ?? [];
      const rows = (enrollmentData ?? []).map((enrollment) => {
        const participant = participantsWithChurch.find((item) => item.id === enrollment.participante_id);
        const cycle = cycles.find((item) => item.id === enrollment.ciclo_id);
        const level = levels.find((item) => item.id === enrollment.nivel_id);
        return {
          ...enrollment,
          participante: participant?.nombre_completo || 'Participante no disponible',
          codigo: participant?.codigo || '',
          iglesia: participant?.iglesia || '',
          anio: cycle?.anio ?? null,
          nivel: level?.nombre || 'Nivel no disponible',
          numeroNivel: level?.numero ?? null,
        };
      });
      setEnrollmentParticipants(participantsWithChurch);
      setEnrollmentCycles(cycles);
      setEnrollmentLevels(levels);
      setEnrollments(rows);
      setEnrollmentCycleId((current) => current || cycles[0]?.id || '');
    }
    setEnrollmentsLoading(false);
  }

  useEffect(() => {
    if (activeModule === 'Inscripciones' && profile?.rol === 'coordinacion_general' && profile.activo) {
      loadEnrollments();
    }
  }, [activeModule, profile]);

  function getRecommendedLevel(participantId, cycleId) {
    const selectedCycle = enrollmentCycles.find((cycle) => cycle.id === cycleId);
    if (!selectedCycle) return null;
    const previousEnrollment = enrollments
      .filter((item) => item.participante_id === participantId && item.anio !== null && item.anio < selectedCycle.anio)
      .sort((a, b) => b.anio - a.anio)[0];

    if (!previousEnrollment) return enrollmentLevels.find((level) => level.numero === 1 && level.activo) || null;

    const previousLevel = enrollmentLevels.find((level) => level.id === previousEnrollment.nivel_id);
    const previousNumber = previousLevel?.numero ?? previousEnrollment.numeroNivel ?? 1;
    const recommendedNumber = previousEnrollment.tipo_participacion === 'tiempo_completo'
      ? Math.min(previousNumber + 1, 6)
      : previousNumber;
    return enrollmentLevels.find((level) => level.numero === recommendedNumber && level.activo)
      || enrollmentLevels.find((level) => level.numero === recommendedNumber)
      || null;
  }

  async function handleAddEnrollment(event) {
    event.preventDefault();
    const recommendedLevel = getRecommendedLevel(enrollmentParticipantId, enrollmentCycleId);
    if (!enrollmentParticipantId || !enrollmentCycleId || !recommendedLevel) {
      setEnrollmentError('Selecciona un participante y un ciclo con niveles disponibles.');
      return;
    }
    setSavingEnrollment(true);
    setEnrollmentError('');
    const { error: insertError } = await supabase
      .from('inscripciones')
      .insert({
        participante_id: enrollmentParticipantId,
        ciclo_id: enrollmentCycleId,
        nivel_id: recommendedLevel.id,
        estado: 'inscrito',
      });

    if (insertError) {
      setEnrollmentError(insertError.code === '23505'
        ? 'Este participante ya tiene una inscripción en el ciclo seleccionado.'
        : 'No se pudo guardar la inscripción. Verifica los permisos e inténtalo de nuevo.');
    } else {
      setEnrollmentParticipantId('');
      await loadEnrollments();
    }
    setSavingEnrollment(false);
  }

  async function handleSaveParticipation(enrollment) {
    const value = participationDrafts[enrollment.id] ?? enrollment.tipo_participacion ?? '';
    if (!value) {
      setEnrollmentError('Selecciona el tipo de participación antes de guardar.');
      return;
    }
    setSavingParticipationId(enrollment.id);
    setEnrollmentError('');
    const { error: updateError } = await supabase
      .from('inscripciones')
      .update({ tipo_participacion: value })
      .eq('id', enrollment.id);

    if (updateError) {
      setEnrollmentError('No se pudo guardar la participación. Verifica los permisos e inténtalo de nuevo.');
    } else {
      setParticipationDrafts((current) => {
        const next = { ...current };
        delete next[enrollment.id];
        return next;
      });
      await loadEnrollments();
    }
    setSavingParticipationId('');
  }

  const hasDuplicateParticipant = participantName.trim() && participants.some(
    (participant) => participant.nombre_completo.trim().toLocaleLowerCase() === participantName.trim().toLocaleLowerCase()
  );

  async function handleAddParticipant(event) {
    event.preventDefault();
    const name = participantName.trim();
    if (!name || !participantSex || (hasDuplicateParticipant && !confirmDuplicate)) return;
    setSavingParticipant(true);
    setParticipantError('');
    const { error: insertError } = await supabase
      .from('participantes')
      .insert({
        nombre_completo: name,
        iglesia_id: participantChurch || null,
        fecha_nacimiento: participantBirthDate || null,
        sexo: participantSex,
        telefono: participantPhone.trim() || null,
        necesita_libro: participantNeedsBook === 'true',
        dieta_especial: participantDiet.trim() || null,
        formulario_directrices_firmado: participantGuidelinesSigned === 'true',
        activo: true,
      });

    if (insertError) {
      setParticipantError(insertError.code === '23505'
        ? 'No se pudo asignar un código único al participante. Inténtalo de nuevo.'
        : 'No se pudo guardar el participante. Verifica los permisos e inténtalo de nuevo.');
    } else {
      setParticipantName('');
      setParticipantChurch('');
      setParticipantBirthDate('');
      setParticipantSex('');
      setParticipantPhone('');
      setParticipantNeedsBook('false');
      setParticipantDiet('');
      setParticipantGuidelinesSigned('false');
      setConfirmDuplicate(false);
      await loadParticipants();
    }
    setSavingParticipant(false);
  }

  async function handleSaveParticipantChanges(event) {
    event.preventDefault();
    if (!selectedParticipant?.nombre_completo?.trim() || !selectedParticipant?.sexo) return;
    setSavingParticipantChanges(true);
    setParticipantError('');
    const changes = {
      nombre_completo: selectedParticipant.nombre_completo.trim(),
      iglesia_id: selectedParticipant.iglesia_id || null,
      fecha_nacimiento: selectedParticipant.fecha_nacimiento || null,
      sexo: selectedParticipant.sexo,
      telefono: selectedParticipant.telefono?.trim() || null,
      necesita_libro: Boolean(selectedParticipant.necesita_libro),
      dieta_especial: selectedParticipant.dieta_especial?.trim() || null,
      formulario_directrices_firmado: Boolean(selectedParticipant.formulario_directrices_firmado),
    };
    const { error: updateError } = await supabase
      .from('participantes')
      .update(changes)
      .eq('id', selectedParticipant.id);

    if (updateError) {
      setParticipantError('No se pudieron guardar los cambios. Verifica los permisos e inténtalo de nuevo.');
    } else {
      const churchName = churches.find((church) => church.id === changes.iglesia_id)?.nombre
        ?? (changes.iglesia_id === selectedParticipant.iglesia_id ? selectedParticipant.iglesia : '');
      setSelectedParticipant({ ...selectedParticipant, ...changes, iglesia: churchName });
      setParticipantBeforeEdit(null);
      setEditingParticipant(false);
      await loadParticipants();
    }
    setSavingParticipantChanges(false);
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
      ) : activeModule === 'Inscripciones' ? (
        <section className="work-section">
          <button className="back-button" type="button" onClick={() => setActiveModule('')}>← Volver a módulos</button>
          <div className="section-heading">
            <div><p className="eyebrow">REGISTRO ANUAL</p><h2>Inscripciones</h2><p className="work-intro">Registra a cada participante en el ciclo y el sistema asignará su nivel según su historial.</p></div>
            <span className="module-count">{enrollments.length} inscritas</span>
          </div>

          <form className="church-form participant-form" onSubmit={handleAddEnrollment}>
            <p className="eyebrow">NUEVA INSCRIPCIÓN</p>
            <div className="participant-fields enrollment-fields">
              <div className="participant-field">
                <label htmlFor="enrollment-cycle">Ciclo *</label>
                <select id="enrollment-cycle" value={enrollmentCycleId} onChange={(event) => setEnrollmentCycleId(event.target.value)} required>
                  <option value="">Seleccionar ciclo</option>
                  {enrollmentCycles.map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.anio} · {cycle.estado}</option>)}
                </select>
              </div>
              <div className="participant-field">
                <label htmlFor="enrollment-participant">Participante *</label>
                <select id="enrollment-participant" value={enrollmentParticipantId} onChange={(event) => setEnrollmentParticipantId(event.target.value)} required>
                  <option value="">Seleccionar participante</option>
                  {enrollmentParticipants.filter((participant) => participant.activo).map((participant) => <option key={participant.id} value={participant.id}>{participant.nombre_completo}{participant.codigo ? ` · ${participant.codigo}` : ''}</option>)}
                </select>
              </div>
              <div className="participant-field enrollment-level-field">
                <label>Nivel asignado automáticamente</label>
                <div className="auto-level-value">{getRecommendedLevel(enrollmentParticipantId, enrollmentCycleId)?.nombre || 'Se asignará al seleccionar'}</div>
              </div>
            </div>
            <p className="enrollment-note">El nivel se calcula con la última inscripción de ciclos anteriores. Solo avanza si la participación anterior fue de tiempo completo; en los demás casos conserva el nivel. El primer registro comienza en Nivel 1.</p>
            <div className="participant-submit">
              <button className="primary-button" type="submit" disabled={savingEnrollment || enrollmentsLoading || !enrollmentParticipantId || !enrollmentCycleId || !getRecommendedLevel(enrollmentParticipantId, enrollmentCycleId)}>{savingEnrollment ? 'Guardando…' : 'Registrar inscripción'}</button>
            </div>
          </form>

          {enrollmentError && <p className="auth-error" role="alert">{enrollmentError}</p>}
          <div className="enrollment-list">
            {enrollmentsLoading ? <p className="empty-state">Cargando inscripciones…</p> : enrollments.length === 0 ? (
              <div className="empty-state"><strong>Aún no hay inscripciones registradas.</strong><span>Cuando registres una, aparecerá aquí.</span></div>
            ) : (
              enrollments.map((enrollment) => (
                <article className="enrollment-row" key={enrollment.id}>
                  <div className="enrollment-main">
                    <strong>{enrollment.participante}</strong>
                    <span>{enrollment.codigo ? `${enrollment.codigo} · ` : ''}{enrollment.iglesia || 'Sin iglesia asignada'}</span>
                    <span>{enrollment.anio ?? 'Ciclo no disponible'} · {enrollment.nivel} · {(enrollment.estado || 'inscrito').replace('_', ' ')}</span>
                  </div>
                  <div className="enrollment-participation">
                    <label htmlFor={`participation-${enrollment.id}`}>Participación al cierre</label>
                    <select id={`participation-${enrollment.id}`} value={participationDrafts[enrollment.id] ?? enrollment.tipo_participacion ?? ''} onChange={(event) => setParticipationDrafts((current) => ({ ...current, [enrollment.id]: event.target.value }))}>
                      <option value="">Pendiente de cierre</option>
                      <option value="tiempo_completo">Tiempo completo</option>
                      <option value="medio_tiempo">Medio tiempo</option>
                      <option value="no_asistio">No asistió</option>
                    </select>
                    <button className="text-button" type="button" onClick={() => handleSaveParticipation(enrollment)} disabled={savingParticipationId === enrollment.id || !(participationDrafts[enrollment.id] ?? enrollment.tipo_participacion)}>{savingParticipationId === enrollment.id ? 'Guardando…' : 'Guardar participación'}</button>
                  </div>
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

          {selectedParticipant ? (
            <div className="participant-profile">
              <button className="back-button" type="button" onClick={() => setSelectedParticipant(null)}>← Volver a participantes</button>
              <div className="profile-header">
                <div>
                  <p className="eyebrow">EXPEDIENTE INDIVIDUAL</p>
                  <h3>{selectedParticipant.nombre_completo}</h3>
                  <p className="profile-code">{selectedParticipant.codigo || 'Código pendiente'} · {selectedParticipant.iglesia || 'Sin iglesia asignada'}</p>
                </div>
                <span className={selectedParticipant.activo ? 'status-active' : 'status-inactive'}>{selectedParticipant.activo ? 'Activo' : 'Inactivo'}</span>
              </div>
              <div className="profile-edit-actions">
                {!editingParticipant && <button className="primary-button" type="button" onClick={() => { setParticipantError(''); setParticipantBeforeEdit({ ...selectedParticipant }); setEditingParticipant(true); }}>Editar datos</button>}
              </div>
              {participantError && <p className="auth-error" role="alert">{participantError}</p>}
              {editingParticipant && (
                <form className="church-form participant-form profile-edit-form" onSubmit={handleSaveParticipantChanges}>
                  <p className="eyebrow">EDITAR INFORMACIÓN DEL PARTICIPANTE</p>
                  <div className="participant-fields">
                    <div className="participant-field">
                      <label htmlFor="edit-participant-name">Nombre completo *</label>
                      <input id="edit-participant-name" value={selectedParticipant.nombre_completo || ''} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, nombre_completo: event.target.value })} maxLength={180} required />
                    </div>
                    <div className="participant-field">
                      <label htmlFor="edit-participant-church">Iglesia</label>
                      <select id="edit-participant-church" value={selectedParticipant.iglesia_id || ''} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, iglesia_id: event.target.value })}>
                        <option value="">Sin iglesia asignada</option>
                        {selectedParticipant.iglesia_id && !churches.some((church) => church.id === selectedParticipant.iglesia_id) && <option value={selectedParticipant.iglesia_id}>{selectedParticipant.iglesia} (inactiva)</option>}
                        {churches.map((church) => <option key={church.id} value={church.id}>{church.nombre}</option>)}
                      </select>
                    </div>
                    <div className="participant-field">
                      <label htmlFor="edit-participant-birth">Fecha de nacimiento</label>
                      <input id="edit-participant-birth" type="date" value={selectedParticipant.fecha_nacimiento || ''} max={new Date().toISOString().slice(0, 10)} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, fecha_nacimiento: event.target.value })} />
                    </div>
                    <div className="participant-field">
                      <label htmlFor="edit-participant-sex">Sexo *</label>
                      <select id="edit-participant-sex" value={selectedParticipant.sexo || ''} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, sexo: event.target.value })} required>
                        <option value="">Seleccionar</option><option value="F">F — Femenino</option><option value="M">M — Masculino</option>
                      </select>
                    </div>
                    <div className="participant-field">
                      <label htmlFor="edit-participant-phone">Teléfono del participante</label>
                      <input id="edit-participant-phone" type="tel" value={selectedParticipant.telefono || ''} maxLength={30} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, telefono: event.target.value })} />
                    </div>
                    <div className="participant-field">
                      <label htmlFor="edit-participant-book">¿Necesita libro?</label>
                      <select id="edit-participant-book" value={selectedParticipant.necesita_libro ? 'true' : 'false'} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, necesita_libro: event.target.value === 'true' })}>
                        <option value="false">No</option><option value="true">Sí</option>
                      </select>
                    </div>
                    <div className="participant-field">
                      <label htmlFor="edit-participant-diet">Dieta especial por salud</label>
                      <input id="edit-participant-diet" value={selectedParticipant.dieta_especial || ''} maxLength={300} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, dieta_especial: event.target.value })} />
                    </div>
                    <div className="participant-field">
                      <label htmlFor="edit-participant-guidelines">¿Firmó el formulario de directrices?</label>
                      <select id="edit-participant-guidelines" value={selectedParticipant.formulario_directrices_firmado ? 'true' : 'false'} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, formulario_directrices_firmado: event.target.value === 'true' })}>
                        <option value="false">No</option><option value="true">Sí</option>
                      </select>
                    </div>
                  </div>
                  <div className="participant-edit-buttons">
                    <button className="text-button" type="button" onClick={() => { setSelectedParticipant(participantBeforeEdit); setParticipantBeforeEdit(null); setEditingParticipant(false); setParticipantError(''); }}>Cancelar</button>
                    <button className="primary-button" type="submit" disabled={savingParticipantChanges || !selectedParticipant.nombre_completo?.trim() || !selectedParticipant.sexo}>{savingParticipantChanges ? 'Guardando…' : 'Guardar cambios'}</button>
                  </div>
                </form>
              )}
              <div className="profile-grid">
                <article className="profile-card">
                  <p className="eyebrow">DATOS PERSONALES</p>
                  <dl>
                    <div><dt>Fecha de nacimiento</dt><dd>{selectedParticipant.fecha_nacimiento ? new Date(selectedParticipant.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-HN') : 'No registrada'}</dd></div>
                    <div><dt>Edad actual</dt><dd>{selectedParticipant.fecha_nacimiento ? `${calculateAge(selectedParticipant.fecha_nacimiento)} años` : 'No registrada'}</dd></div>
                    <div><dt>Sexo</dt><dd>{selectedParticipant.sexo === 'F' ? 'Femenino' : selectedParticipant.sexo === 'M' ? 'Masculino' : 'No registrado'}</dd></div>
                    <div><dt>Teléfono</dt><dd>{selectedParticipant.telefono || 'No registrado'}</dd></div>
                  </dl>
                </article>
                <article className="profile-card">
                  <p className="eyebrow">INFORMACIÓN PARA LA ESCUELA</p>
                  <dl>
                    <div><dt>Necesita libro</dt><dd>{selectedParticipant.necesita_libro ? 'Sí' : 'No'}</dd></div>
                    <div><dt>Dieta especial por salud</dt><dd>{selectedParticipant.dieta_especial || 'Ninguna registrada'}</dd></div>
                    <div><dt>Formulario de directrices</dt><dd>{selectedParticipant.formulario_directrices_firmado ? 'Firmado' : 'Pendiente'}</dd></div>
                  </dl>
                </article>
                <article className="profile-card profile-history">
                  <p className="eyebrow">HISTORIAL DE PARTICIPACIÓN</p>
                  <strong>Inscripciones por año</strong>
                  <p>El historial aparecerá aquí cuando terminemos de configurar el módulo de Inscripciones. Los datos actuales del participante se conservan sin cambios.</p>
                </article>
              </div>
            </div>
          ) : (
            <>
              <form className="church-form participant-form" onSubmit={handleAddParticipant}>
                <label htmlFor="participant-name">Agregar participante</label>
                <div className="participant-fields">
                  <div className="participant-field">
                    <label htmlFor="participant-name">Nombre completo *</label>
                    <input id="participant-name" value={participantName} onChange={(event) => { setParticipantName(event.target.value); setConfirmDuplicate(false); }} placeholder="Nombre y apellidos" maxLength={180} required />
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
                    <label htmlFor="participant-sex">Sexo *</label>
                    <select id="participant-sex" value={participantSex} onChange={(event) => setParticipantSex(event.target.value)} required>
                      <option value="">Seleccionar</option>
                      <option value="F">F — Femenino</option>
                      <option value="M">M — Masculino</option>
                    </select>
                  </div>
                  <div className="participant-field">
                    <label htmlFor="participant-phone">Teléfono del participante</label>
                    <input id="participant-phone" type="tel" value={participantPhone} onChange={(event) => setParticipantPhone(event.target.value)} placeholder="Número de contacto" maxLength={30} />
                  </div>
                  <div className="participant-field">
                    <label htmlFor="participant-needs-book">¿Necesita libro?</label>
                    <select id="participant-needs-book" value={participantNeedsBook} onChange={(event) => setParticipantNeedsBook(event.target.value)}>
                      <option value="false">No</option>
                      <option value="true">Sí</option>
                    </select>
                  </div>
                  <div className="participant-field">
                    <label htmlFor="participant-diet">Dieta especial por salud (opcional)</label>
                    <input id="participant-diet" value={participantDiet} onChange={(event) => setParticipantDiet(event.target.value)} placeholder="Indica solo la restricción o alimento que debemos evitar" maxLength={300} />
                  </div>
                  <div className="participant-field">
                    <label htmlFor="participant-guidelines">¿Firmó el formulario de directrices?</label>
                    <select id="participant-guidelines" value={participantGuidelinesSigned} onChange={(event) => setParticipantGuidelinesSigned(event.target.value)}>
                      <option value="false">No</option>
                      <option value="true">Sí</option>
                    </select>
                  </div>
                </div>
                {hasDuplicateParticipant && (
                  <label className="duplicate-confirm">
                    <input type="checkbox" checked={confirmDuplicate} onChange={(event) => setConfirmDuplicate(event.target.checked)} />
                    Ya verifiqué que es otra persona y no un registro duplicado.
                  </label>
                )}
                <div className="participant-submit">
                  <button className="primary-button" type="submit" disabled={savingParticipant || !participantName.trim() || !participantSex || (hasDuplicateParticipant && !confirmDuplicate)}>{savingParticipant ? 'Guardando…' : 'Agregar participante'}</button>
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
                        <span className={participant.activo ? 'status-active' : 'status-inactive'}>{participant.activo ? 'Activo' : 'Inactivo'}</span>
                      </div>
                      <div className="participant-actions">
                        <button className="text-button" type="button" onClick={() => setSelectedParticipant(participant)}>Ver ficha</button>
                        <button className="text-button" type="button" onClick={() => handleToggleParticipant(participant)}>{participant.activo ? 'Desactivar' : 'Activar'}</button>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          )}
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
                <button className="module-card module-card-button" key={module.number} type="button" onClick={() => ['Iglesias', 'Participantes', 'Inscripciones'].includes(module.title) && setActiveModule(module.title)}>
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
