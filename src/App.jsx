import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';

const modules = [
  { number: '01', title: 'Iglesias', description: 'Registro y consulta de iglesias participantes.' },
  { number: '02', title: 'Participantes', description: 'Datos y seguimiento de cada participante.' },
  { number: '03', title: 'Inscripciones', description: 'Inscripciones, niveles y estado de participación.' },
  { number: '04', title: 'Finanzas', description: 'Inscripciones, ofrendas, ingresos y gastos.' },
  { number: '05', title: 'Reportes', description: 'Consultas y resúmenes para coordinación.' },
];

function getCycleDates(startDate, endDate) {
  if (!startDate || !endDate) return [];
  const dates = [];
  const current = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setUTCDate(current.getUTCDate() + 1);
  }
  return dates;
}

function formatCycleDate(dateString) {
  return new Date(`${dateString}T00:00:00Z`).toLocaleDateString('es-HN', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC',
  });
}

function calculateAge(dateString) {
  if (!dateString) return null;
  const today = new Date();
  const birthDate = new Date(dateString + 'T00:00:00');
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age >= 0 ? age : null;
}


function VisitorDemo() {
  const [section, setSection] = useState('Inicio');
  const nav = [
    ['Inicio', '⌂'], ['Iglesias', '01'], ['Participantes', '02'],
    ['Inscripciones', '03'], ['Finanzas', '04'], ['Reportes', '05'],
  ];
  const demoPeople = [
    { name: 'María Fernanda López', locality: 'San Pedro Sula', type: 'Joven', level: 'Nivel 2' },
    { name: 'Daniel Alejandro Reyes', locality: 'La Ceiba', type: 'Joven', level: 'Nivel 1' },
    { name: 'Gabriela Sofía Martínez', locality: 'Choluteca', type: 'Entrenante', level: 'Nivel 3' },
    { name: 'José Miguel Castillo', locality: 'Tegucigalpa', type: 'Servidor', level: 'Nivel 4' },
  ];
  const levels = ['La Salvación', 'El Dios Triuno', 'Los dos Espíritus', 'La Vida', 'La Iglesia', 'La Biblia'];
  return (
    <main className="visitor-shell">
      <header className="visitor-topbar">
        <div className="visitor-brand">
          <img src="/logo-escuela-verdad.png" alt="Escuela de la Verdad" />
          <div><strong>Escuela de la Verdad</strong><span>HONDURAS · DIOS · EDUCACIÓN · CARÁCTER</span></div>
        </div>
        <span className="visitor-tag">VISTA DE VISITANTE · SOLO DEMOSTRACIÓN</span>
      </header>
      <div className="visitor-layout">
        <aside className="visitor-nav">
          <p className="eyebrow">MENÚ PRINCIPAL</p>
          {nav.map(([label, number]) => (
            <button key={label} className={section === label ? 'visitor-nav-active' : ''} onClick={() => setSection(label)}>
              <span>{number}</span>{label}
            </button>
          ))}
          <div className="visitor-note">Esta vista utiliza ejemplos ficticios. No permite modificar información.</div>
        </aside>
        <section className="visitor-content">
          {section === 'Inicio' ? <>
            <p className="eyebrow">SISTEMA DE GESTIÓN · HONDURAS</p>
            <h1>Escuela de la Verdad</h1>
            <p className="visitor-lead">Una herramienta para organizar las inscripciones, participantes y finanzas de cada ciclo de la Escuela de la Verdad.</p>
            <div className="visitor-stats">
              <article><span>Localidades</span><strong>12</strong><small>Ejemplo de organización</small></article>
              <article><span>Participantes</span><strong>130</strong><small>Registros históricos de 2025</small></article>
              <article><span>Niveles</span><strong>6</strong><small>Libros de estudio</small></article>
              <article><span>Ciclo activo</span><strong>2026</strong><small>En preparación</small></article>
            </div>
            <h2>Conoce los módulos</h2>
            <div className="visitor-module-grid">
              {nav.slice(1).map(([label, number, description]) => (
                <button key={label} onClick={() => setSection(label)}><span>{number}</span><strong>{label}</strong><small>{({
                  Iglesias: 'Consulta y organización por localidad.',
                  Participantes: 'Fichas y datos generales.',
                  Inscripciones: 'Ciclos, niveles y participación.',
                  Finanzas: 'Cuotas, pagos, ofrendas, ingresos y gastos.',
                  Reportes: 'Resúmenes para apoyar la coordinación.',
                })[label]}</small></button>
              ))}
            </div>
          </> : <>
            <button className="visitor-back" onClick={() => setSection('Inicio')}>← Volver al inicio</button>
            <p className="eyebrow">VISTA DE DEMOSTRACIÓN</p>
            <h1>{section}</h1>
            {section === 'Iglesias' && <>
              <p className="visitor-lead">Las localidades participantes se organizan desde un solo apartado.</p>
              <div className="visitor-table"><div className="visitor-table-head"><span>Localidad</span><span>Participantes de ejemplo</span></div>
                {['San Pedro Sula', 'La Ceiba', 'San Nicolás', 'Choluteca', 'La Lima', 'Tegucigalpa'].map((x, i) => <div className="visitor-table-row" key={x}><span>{x}</span><span>{[36,15,14,13,12,10][i]}</span></div>)}
              </div>
            </>}
            {section === 'Participantes' && <>
              <p className="visitor-lead">Cada persona cuenta con una ficha general y su historial de participación.</p>
              <div className="visitor-table"><div className="visitor-table-head"><span>Nombre de ejemplo</span><span>Localidad</span><span>Asiste como</span></div>
                {demoPeople.map(p => <div className="visitor-table-row visitor-people-row" key={p.name}><span>{p.name}</span><span>{p.locality}</span><span>{p.type}</span></div>)}
              </div><p className="visitor-disclaimer">Nombres y datos ilustrativos, no corresponden a personas registradas.</p>
            </>}
            {section === 'Inscripciones' && <>
              <p className="visitor-lead">Las inscripciones se consultan por ciclo, localidad y nivel.</p>
              <div className="visitor-highlight"><span>Ciclo de ejemplo</span><strong>2025 · Histórico</strong><small>127 inscripciones registradas en la base histórica.</small></div>
              <h2>Los seis niveles</h2><div className="visitor-levels">{levels.map((x, i) => <div key={x}><span>Nivel {i+1}</span><strong>{x}</strong></div>)}</div>
              <p className="visitor-disclaimer">La vista real permite consultar las inscripciones por año.</p>
            </>}
            {section === 'Finanzas' && <>
              <p className="visitor-lead">Un espacio para dar seguimiento a las inscripciones, pagos, ofrendas, ingresos y gastos.</p>
              <div className="visitor-finance-grid"><article><span>Ingresos de ejemplo</span><strong>L 18,500.00</strong><small>Cuotas y ofrendas</small></article><article><span>Egresos de ejemplo</span><strong>L 6,250.00</strong><small>Gastos registrados</small></article><article><span>Saldo de ejemplo</span><strong>L 12,250.00</strong><small>Resumen ilustrativo</small></article></div>
              <p className="visitor-disclaimer">Cifras completamente ficticias. No se muestran movimientos reales.</p>
            </>}
            {section === 'Reportes' && <>
              <p className="visitor-lead">Los reportes reúnen información por ciclo para facilitar la revisión y la toma de decisiones.</p>
              <div className="visitor-report-list"><div><strong>Participantes por localidad</strong><span>Resumen de registros por iglesia</span></div><div><strong>Inscripciones por nivel</strong><span>Distribución por libro de estudio</span></div><div><strong>Resumen financiero</strong><span>Ingresos, egresos y saldos</span></div></div>
            </>}
          </>}
        </section>
      </div>
      <footer className="visitor-footer">Escuela de la Verdad · Honduras <span>Acceso de visitante · Solo lectura · Datos de demostración</span></footer>
    </main>
  );
}

export default function App() {
  const visitorMode = new URLSearchParams(window.location.search).get('modo') === 'visitante';
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

  useEffect(() => {
    if (activeModule) window.scrollTo({ top: 0, behavior: 'auto' });
  }, [activeModule]);
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
  const [participantType, setParticipantType] = useState('');
  const [participantEducationSystem, setParticipantEducationSystem] = useState('');
  const [participantSchoolYear, setParticipantSchoolYear] = useState('');
  const [participantSemester, setParticipantSemester] = useState('');
  const [participantBirthDate, setParticipantBirthDate] = useState('');
  const [participantSex, setParticipantSex] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [participantNeedsBook, setParticipantNeedsBook] = useState('false');
  const [participantDiet, setParticipantDiet] = useState('');
  const [participantGuidelinesSigned, setParticipantGuidelinesSigned] = useState('false');
  const [confirmDuplicate, setConfirmDuplicate] = useState(false);
  const [savingParticipant, setSavingParticipant] = useState(false);
  const [participantImportChurch, setParticipantImportChurch] = useState('');
  const [participantImportRows, setParticipantImportRows] = useState([]);
  const [participantImportFile, setParticipantImportFile] = useState('');
  const [participantImportError, setParticipantImportError] = useState('');
  const [participantImporting, setParticipantImporting] = useState(false);
  const [enrollmentParticipants, setEnrollmentParticipants] = useState([]);
  const [enrollmentCycles, setEnrollmentCycles] = useState([]);
  const [enrollmentLevels, setEnrollmentLevels] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState('');
  const [enrollmentCycleId, setEnrollmentCycleId] = useState('');
  const [enrollmentChurchId, setEnrollmentChurchId] = useState('');
  const [selectedEnrollmentIds, setSelectedEnrollmentIds] = useState([]);
  const [enrollmentServerLevels, setEnrollmentServerLevels] = useState({});
  const [enrollmentInitialLevels, setEnrollmentInitialLevels] = useState({});
  const [enrollmentSupportDays, setEnrollmentSupportDays] = useState({});
  const [enrollmentSupportParticipation, setEnrollmentSupportParticipation] = useState({});
  const [savingEnrollment, setSavingEnrollment] = useState(false);
  const [participationDrafts, setParticipationDrafts] = useState({});
  const [savingParticipationId, setSavingParticipationId] = useState('');
  const [closingCycleId, setClosingCycleId] = useState('');
  const [closureExceptions, setClosureExceptions] = useState({});
  const [savingCycleClosure, setSavingCycleClosure] = useState(false);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeError, setFinanceError] = useState('');
  const [financeCycles, setFinanceCycles] = useState([]);
  const [financeCycleId, setFinanceCycleId] = useState('');
  const [financeFees, setFinanceFees] = useState([]);
  const [financeFeeConfigs, setFinanceFeeConfigs] = useState([]);
  const [financeGeneralFeeAmount, setFinanceGeneralFeeAmount] = useState('4000');
  const [financeSavingFeeConfig, setFinanceSavingFeeConfig] = useState(false);
  const [showFinanceFeeConfig, setShowFinanceFeeConfig] = useState(false);
  const [financeAssigningFees, setFinanceAssigningFees] = useState(false);
  const [financePayments, setFinancePayments] = useState([]);
  const [financeMovements, setFinanceMovements] = useState([]);
  const [financeEnrollments, setFinanceEnrollments] = useState([]);
  const [financeLocalities, setFinanceLocalities] = useState([]);
  const [financeLocalityId, setFinanceLocalityId] = useState('');
  const [financeBalancesLocalityId, setFinanceBalancesLocalityId] = useState('');
  const [financeMovementType, setFinanceMovementType] = useState('cuota');
  const [financeConcept, setFinanceConcept] = useState('');
  const [financeAmount, setFinanceAmount] = useState('');
  const [financeDate, setFinanceDate] = useState(new Date().toISOString().slice(0, 10));
  const [financeMethod, setFinanceMethod] = useState('efectivo');
  const [financeReference, setFinanceReference] = useState('');
  const [financeNotes, setFinanceNotes] = useState('');
  const [financeSaving, setFinanceSaving] = useState(false);
  const [financePaymentQuota, setFinancePaymentQuota] = useState('');
  const [financePaymentAmount, setFinancePaymentAmount] = useState('');
  const [financePaymentDate, setFinancePaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [financePaymentMethod, setFinancePaymentMethod] = useState('efectivo');
  const [financePaymentReference, setFinancePaymentReference] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');
  const [reportCycles, setReportCycles] = useState([]);
  const [reportCycleId, setReportCycleId] = useState('');
  const [reportFilterChurch, setReportFilterChurch] = useState('todos');
  const [reportFilterLevel, setReportFilterLevel] = useState('todos');
  const [reportFilterType, setReportFilterType] = useState('todos');
  const [reportFilterStatus, setReportFilterStatus] = useState('todos');
  const [reportParticipants, setReportParticipants] = useState([]);
  const [reportChurches, setReportChurches] = useState([]);
  const [reportLevels, setReportLevels] = useState([]);
  const [reportEnrollments, setReportEnrollments] = useState([]);
  const [reportFees, setReportFees] = useState([]);
  const [reportPayments, setReportPayments] = useState([]);
  const [reportMovements, setReportMovements] = useState([]);


  useEffect(() => {
    if (visitorMode) { setCheckingSession(false); return undefined; }
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
    if (visitorMode) return undefined;
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
          setProfileError('La sesión está activa, pero no se pudo consultar tu perfil. Verifica que tengas un perfil activo en el sistema.');
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
    const [
      { data: participantData, error: participantQueryError },
      { data: churchData, error: churchQueryError },
    ] = await Promise.all([
      supabase.from('participantes')
        .select('id, codigo, nombre_completo, iglesia_id, tipo_participante, fecha_nacimiento, sexo, telefono, necesita_libro, dieta_especial, formulario_directrices_firmado, sistema_educativo, anio_escolar, semestre, activo, created_at')
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
        .select('id, codigo, nombre_completo, iglesia_id, tipo_participante, activo')
        .order('nombre_completo', { ascending: true }),
      supabase.from('iglesias').select('id, nombre, activa'),
      supabase.from('ciclos_escolares')
        .select('id, anio, fecha_inicio, fecha_fin, estado')
        .order('anio', { ascending: false }),
      supabase.from('niveles')
        .select('id, numero, nombre, activo')
        .order('numero', { ascending: true }),
      supabase.from('inscripciones')
        .select('id, participante_id, ciclo_id, nivel_id, estado, observaciones, tipo_inscripcion, tipo_participacion, created_at')
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

  function getPreviousEnrollment(participantId, cycleId) {
    const selectedCycle = enrollmentCycles.find((cycle) => cycle.id === cycleId);
    if (!selectedCycle) return null;
    return enrollments
      .filter((item) => item.participante_id === participantId && item.anio !== null && item.anio < selectedCycle.anio)
      .sort((a, b) => b.anio - a.anio)[0] || null;
  }

  function getEnrollmentType(participantId, cycleId) {
    const previousEnrollment = getPreviousEnrollment(participantId, cycleId);
    const participantType = enrollmentParticipants.find((participant) => participant.id === participantId)?.tipo_participante;
    if (['mensajero', 'cocina'].includes(participantType)) return participantType;
    if (!previousEnrollment) return participantType || '';
    if (participantType === 'servidor' || previousEnrollment.tipo_inscripcion === 'servidor') return 'servidor';
    if (participantType === 'entrenante') return 'entrenante';
    const previousLevel = enrollmentLevels.find((level) => level.id === previousEnrollment.nivel_id);
    const previousNumber = previousLevel?.numero ?? previousEnrollment.numeroNivel ?? 1;
    return previousNumber === 6 && previousEnrollment.tipo_participacion === 'tiempo_completo'
      ? 'servidor'
      : participantType || 'joven';
  }

  function getRecommendedLevel(participantId, cycleId) {
    const previousEnrollment = getPreviousEnrollment(participantId, cycleId);
    const firstLevel = enrollmentLevels.find((level) => level.numero === 1 && level.activo)
      || enrollmentLevels.find((level) => level.numero === 1);
    if (!previousEnrollment) return firstLevel;
    const previousLevel = enrollmentLevels.find((level) => level.id === previousEnrollment.nivel_id);
    const previousNumber = previousLevel?.numero ?? previousEnrollment.numeroNivel ?? 1;
    const recommendedNumber = previousEnrollment.tipo_participacion === 'tiempo_completo'
      ? Math.min(previousNumber + 1, 6)
      : previousNumber;
    return enrollmentLevels.find((level) => level.numero === recommendedNumber && level.activo)
      || enrollmentLevels.find((level) => level.numero === recommendedNumber)
      || null;
  }

  function getEnrollmentLevelFor(participantId, cycleId, serverLevelId) {
    if (['mensajero', 'cocina'].includes(getEnrollmentType(participantId, cycleId))) return null;
    const previousEnrollment = getPreviousEnrollment(participantId, cycleId);
    if (!previousEnrollment) {
      return enrollmentLevels.find((level) => level.id === enrollmentInitialLevels[participantId] && level.activo) || null;
    }
    if (getEnrollmentType(participantId, cycleId) === 'servidor') {
      return enrollmentLevels.find((level) => level.id === serverLevelId && level.activo) || null;
    }
    return getRecommendedLevel(participantId, cycleId);
  }

  const enrolledParticipantIds = new Set(
    enrollments.filter((item) => item.ciclo_id === enrollmentCycleId).map((item) => item.participante_id)
  );
  const churchParticipants = enrollmentParticipants.filter(
    (participant) => participant.activo && participant.iglesia_id === enrollmentChurchId
  );
  const eligibleChurchParticipants = churchParticipants.filter(
    (participant) => !enrolledParticipantIds.has(participant.id)
  );
  const selectedEligibleParticipants = eligibleChurchParticipants.filter(
    (participant) => selectedEnrollmentIds.includes(participant.id)
  );
  const allEligibleSelected = eligibleChurchParticipants.length > 0
    && eligibleChurchParticipants.every((participant) => selectedEnrollmentIds.includes(participant.id));
  const selectedCycle = enrollmentCycles.find((cycle) => cycle.id === enrollmentCycleId);
  const selectedCycleDates = getCycleDates(selectedCycle?.fecha_inicio, selectedCycle?.fecha_fin);
  const courseCycleEnrollments = enrollments.filter((item) => item.ciclo_id === enrollmentCycleId
    && ['joven', 'servidor', 'entrenante'].includes(item.tipo_inscripcion));

  async function handleBulkAddEnrollments(event) {
    event.preventDefault();
    if (!enrollmentCycleId || !enrollmentChurchId || selectedEligibleParticipants.length === 0) {
      setEnrollmentError('Selecciona el ciclo, la iglesia y al menos una persona.');
      return;
    }
    const rows = selectedEligibleParticipants.map((participant) => {
      const tipoInscripcion = getEnrollmentType(participant.id, enrollmentCycleId);
      const isSupport = ['mensajero', 'cocina'].includes(tipoInscripcion);
      const level = getEnrollmentLevelFor(participant.id, enrollmentCycleId, enrollmentServerLevels[participant.id]);
      const schedule = enrollmentSupportDays[participant.id] || {};
      const supportParticipation = enrollmentSupportParticipation[participant.id] || '';
      if (isSupport && (!selectedCycleDates.some((date) => schedule[date]) || !['tiempo_completo', 'medio_tiempo'].includes(supportParticipation))) return null;
      return tipoInscripcion && (isSupport || level) ? {
        participante_id: participant.id,
        ciclo_id: enrollmentCycleId,
        nivel_id: level?.id || null,
        tipo_inscripcion: tipoInscripcion,
        tipo_participacion: isSupport ? supportParticipation : null,
        estado: 'inscrito',
      } : null;
    });
    if (rows.some((row) => !row)) {
      setEnrollmentError('Confirma el nivel de cada Joven, Servidor o Entrenante. Para cada Mensajero o persona de Cocina, selecciona tiempo completo o parcial y al menos un día de asistencia.');
      return;
    }

    setSavingEnrollment(true);
    setEnrollmentError('');
    const { data: insertedRows, error: insertError } = await supabase
      .from('inscripciones').insert(rows).select('id, participante_id');
    if (insertError) {
      setEnrollmentError(insertError.code === '23505'
        ? 'Una o más personas ya tienen inscripción en este ciclo. Actualiza la lista e inténtalo de nuevo.'
        : 'No se pudieron guardar las inscripciones. Verifica los permisos e inténtalo de nuevo.');
    } else {
      const dayRows = (insertedRows || []).flatMap((inserted) => {
        const type = rows.find((row) => row.participante_id === inserted.participante_id)?.tipo_inscripcion;
        if (!['mensajero', 'cocina'].includes(type)) return [];
        return selectedCycleDates
          .filter((date) => enrollmentSupportDays[inserted.participante_id]?.[date])
          .map((date) => ({
            inscripcion_id: inserted.id,
            fecha: date,
            jornada: enrollmentSupportDays[inserted.participante_id][date],
          }));
      });
      if (dayRows.length) {
        const { error: daysError } = await supabase.from('inscripcion_dias').insert(dayRows);
        if (daysError) {
          await supabase.from('inscripciones').delete().in('id', insertedRows.map((row) => row.id));
          setEnrollmentError('No se guardaron los días de asistencia; las inscripciones nuevas se revirtieron. Verifica que esté creada la tabla de días y vuelve a intentarlo.');
          setSavingEnrollment(false);
          return;
        }
      }
      setSelectedEnrollmentIds([]);
      setEnrollmentServerLevels({});
      setEnrollmentInitialLevels({});
      setEnrollmentSupportDays({});
      setEnrollmentSupportParticipation({});
      await loadEnrollments();
    }
    setSavingEnrollment(false);
  }

  function startCycleClosure() {
    const currentCycleRows = enrollments.filter((item) => item.ciclo_id === enrollmentCycleId && ['joven', 'servidor', 'entrenante'].includes(item.tipo_inscripcion));
    const existingExceptions = {};
    currentCycleRows.forEach((item) => {
      if (item.tipo_participacion && item.tipo_participacion !== 'tiempo_completo') {
        existingExceptions[item.id] = item.tipo_participacion;
      }
    });
    setClosureExceptions(existingExceptions);
    setClosingCycleId(enrollmentCycleId);
    setEnrollmentError('');
  }

  async function handleSaveCycleClosure() {
    const cycleRows = enrollments.filter((item) => item.ciclo_id === closingCycleId && ['joven', 'servidor', 'entrenante'].includes(item.tipo_inscripcion));
    if (cycleRows.length === 0) {
      setEnrollmentError('Este ciclo no tiene inscripciones para cerrar.');
      return;
    }
    setSavingCycleClosure(true);
    setEnrollmentError('');
    const { error: defaultError } = await supabase
      .from('inscripciones')
      .update({ tipo_participacion: 'tiempo_completo' })
      .in('id', cycleRows.map((item) => item.id));

    if (defaultError) {
      setEnrollmentError('No se pudo guardar el cierre del ciclo. No se confirmó ningún cambio; inténtalo de nuevo.');
      setSavingCycleClosure(false);
      return;
    }

    const exceptionGroups = ['medio_tiempo', 'no_asistio'];
    for (const status of exceptionGroups) {
      const ids = Object.entries(closureExceptions)
        .filter(([, value]) => value === status)
        .map(([id]) => id);
      if (ids.length === 0) continue;
      const { error: exceptionError } = await supabase
        .from('inscripciones')
        .update({ tipo_participacion: status })
        .in('id', ids);
      if (exceptionError) {
        setEnrollmentError('El ciclo quedó marcado inicialmente como tiempo completo, pero no se pudieron guardar todas las excepciones. Tus selecciones siguen aquí; vuelve a guardar para completar el cierre.');
        setSavingCycleClosure(false);
        return;
      }
    }

    const promotedParticipantIds = cycleRows
      .filter((item) => item.tipo_inscripcion === 'joven'
        && item.numeroNivel === 6
        && (closureExceptions[item.id] || 'tiempo_completo') === 'tiempo_completo')
      .map((item) => item.participante_id);
    if (promotedParticipantIds.length > 0) {
      const { error: promotionError } = await supabase
        .from('participantes')
        .update({ tipo_participante: 'servidor' })
        .in('id', promotedParticipantIds);
      if (promotionError) {
        setEnrollmentError('Las participaciones se guardaron, pero no se pudo actualizar la opción «Asiste como» de quienes completaron el nivel 6. Puedes corregirla desde Participantes, en «Asiste como».');
        setSavingCycleClosure(false);
        await loadEnrollments();
        return;
      }
    }

    setClosingCycleId('');
    setClosureExceptions({});
    setParticipationDrafts({});
    await loadEnrollments();
    setSavingCycleClosure(false);
  }

  const hasDuplicateParticipant = participantName.trim() && participants.some(
    (participant) => participant.nombre_completo.trim().toLocaleLowerCase() === participantName.trim().toLocaleLowerCase()
  );

  async function handleAddParticipant(event) {
    event.preventDefault();
    const name = participantName.trim();
    if (!name || !participantSex || !participantType || (hasDuplicateParticipant && !confirmDuplicate)) return;
    setSavingParticipant(true);
    setParticipantError('');
    const hasEducationFields = !['mensajero', 'cocina'].includes(participantType);
    const hasBookAndGuidelines = ['joven', 'servidor', 'entrenante'].includes(participantType);
    const { error: insertError } = await supabase
      .from('participantes')
      .insert({
        nombre_completo: name,
        iglesia_id: participantChurch || null,
        tipo_participante: participantType,
        sistema_educativo: hasEducationFields && participantType !== 'entrenante' ? (participantEducationSystem || null) : null,
        anio_escolar: hasEducationFields ? (participantSchoolYear || null) : null,
        semestre: participantType === 'entrenante' ? (participantSemester || null) : null,
        fecha_nacimiento: participantBirthDate || null,
        sexo: participantSex,
        telefono: participantPhone.trim() || null,
        necesita_libro: hasBookAndGuidelines && participantNeedsBook === 'true',
        dieta_especial: participantDiet.trim() || null,
        formulario_directrices_firmado: hasBookAndGuidelines && participantGuidelinesSigned === 'true',
        activo: true,
      });

    if (insertError) {
      setParticipantError(insertError.code === '23505'
        ? 'No se pudo asignar un código único al participante. Inténtalo de nuevo.'
        : 'No se pudo guardar el participante. Verifica los permisos e inténtalo de nuevo.');
    } else {
      setParticipantName('');
      setParticipantChurch('');
      setParticipantType('');
      setParticipantEducationSystem('');
      setParticipantSchoolYear('');
      setParticipantSemester('');
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

  function normalizeImportHeader(value) {
    return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function normalizeImportName(value) {
    return String(value ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
  }

  function importBoolean(value) {
    const normalized = String(value ?? '').trim().toLowerCase();
    return ['si', 'sí', 'yes', 'true', '1', 'x'].includes(normalized);
  }

  function importSchoolYear(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return null;
    const normalized = normalizeImportHeader(raw);
    const options = {
      '6': 'Sexto', '6to': 'Sexto', sexto: 'Sexto',
      '7': 'Séptimo', '7mo': 'Séptimo', septimo: 'Séptimo',
      '8': 'Octavo', '8vo': 'Octavo', octavo: 'Octavo',
      '9': 'Noveno', '9no': 'Noveno', noveno: 'Noveno',
      '10': 'Décimo', '10mo': 'Décimo', decimo: 'Décimo',
      '11': 'Undécimo', '11vo': 'Undécimo', undecimo: 'Undécimo',
      '12': 'Duodécimo', '12vo': 'Duodécimo', duodecimo: 'Duodécimo',
      universidad: 'Universidad',
      graduado: 'Graduado',
      etc: 'ETC',
    };
    return options[normalized] || raw;
  }

  function importDate(value) {
    if (value === null || value === undefined || value === '') return '';
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString().slice(0, 10);
    if (typeof value === 'number') {
      const date = XLSX.SSF.parse_date_code(value);
      if (date) return new Date(Date.UTC(date.y, date.m - 1, date.d)).toISOString().slice(0, 10);
    }
    const raw = String(value).trim();
    const match = raw.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/);
    if (match) return new Date(Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1]))).toISOString().slice(0, 10);
    const parsed = new Date(raw);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString().slice(0, 10);
  }

  async function handleParticipantExcel(event) {
    const file = event.target.files?.[0];
    setParticipantImportError('');
    setParticipantImportRows([]);
    setParticipantImportFile('');
    if (!file) return;
    if (!participantImportChurch) {
      setParticipantImportError('Primero selecciona la iglesia a la que pertenecen los participantes.');
      event.target.value = '';
      return;
    }
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error('El archivo no contiene una hoja de cálculo.');
      const sourceRows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
      if (!sourceRows.length) throw new Error('La primera hoja está vacía o no contiene filas de datos.');
      const existingNames = new Set(participants.map((p) => normalizeImportName(p.nombre_completo)));
      const seenNames = new Set();
      const parsedRows = sourceRows.map((source, index) => {
        const values = {};
        Object.entries(source).forEach(([key, value]) => { values[normalizeImportHeader(key)] = value; });
        const pick = (...keys) => {
          for (const key of keys) if (values[key] !== undefined && values[key] !== '') return values[key];
          return '';
        };
        const name = String(pick('nombrecompleto', 'nombre', 'nombresyapellidos', 'participante')).trim();
        const typeRaw = String(pick('asistecomo', 'tipo', 'tipoparticipante')).trim().toLowerCase();
        const type = ['joven', 'j'].includes(typeRaw) ? 'joven' : ['servidor', 's'].includes(typeRaw) ? 'servidor' : ['entrenante', 'e'].includes(typeRaw) ? 'entrenante' : ['mensajero', 'mensa'].includes(typeRaw) ? 'mensajero' : ['cocina', 'c'].includes(typeRaw) ? 'cocina' : '';
        const sexRaw = String(pick('sexo', 'genero')).trim().toLowerCase();
        const sex = ['f', 'femenino', 'mujer'].includes(sexRaw) ? 'F' : ['m', 'masculino', 'hombre'].includes(sexRaw) ? 'M' : '';
        const birthValue = pick('fechadenacimiento', 'nacimiento');
        const birth = importDate(birthValue);
        const normalizedName = normalizeImportName(name);
        const duplicateExisting = Boolean(normalizedName) && existingNames.has(normalizedName);
        const duplicateFile = Boolean(normalizedName) && seenNames.has(normalizedName);
        if (normalizedName) seenNames.add(normalizedName);
        const errors = [];
        if (!name) errors.push('Falta el nombre completo');
        if (!type) errors.push('Asiste como debe ser Joven, Servidor, Entrenante, Mensajero o Cocina');
        if (!sex) errors.push('Sexo debe ser F o M');
        if (birthValue && !birth) errors.push('Fecha de nacimiento no válida');
        return {
          rowNumber: index + 2,
          nombre_completo: name,
          iglesia_id: participantImportChurch,
          tipo_participante: type,
          sistema_educativo: ['mensajero', 'cocina', 'entrenante'].includes(type) ? null : (type === 'joven' && String(pick('sistemaeducativo', 'sistema')).trim().toLowerCase().startsWith('no') ? null : String(pick('sistemaeducativo', 'sistema')).trim().toLowerCase().startsWith('nac') ? 'nacional' : String(pick('sistemaeducativo', 'sistema')).trim().toLowerCase().startsWith('ame') ? 'americano' : String(pick('sistemaeducativo', 'sistema')).trim().toLowerCase().startsWith('no') ? 'no_aplica' : null),
          anio_escolar: ['mensajero', 'cocina'].includes(type) ? null : importSchoolYear(pick('anioescolar', 'anoescolar', 'gradoescolar', 'ultimoanioaprobado', 'grado')),
          semestre: type === 'entrenante' ? String(pick('semestre')).trim().replace(/\s*semestre\s*/i, '').toUpperCase() || null : null,
          fecha_nacimiento: birth || null,
          sexo: sex,
          telefono: String(pick('telefono', 'telefonodelparticipante', 'contacto')).trim() || null,
          necesita_libro: ['joven', 'servidor', 'entrenante'].includes(type) && importBoolean(pick('necesitalibro', 'libro')),
          dieta_especial: String(pick('dietaespecial', 'restriccionalimentaria')).trim() || null,
          formulario_directrices_firmado: ['joven', 'servidor', 'entrenante'].includes(type) && importBoolean(pick('formulariodirectricesfirmado', 'directricesfirmadas', 'firmodirectrices')),
          duplicate: duplicateExisting || duplicateFile,
          duplicateReason: duplicateExisting ? 'Ya existe en el registro' : duplicateFile ? 'Repetido en el mismo archivo' : '',
          errors,
        };
      });
      setParticipantImportRows(parsedRows);
      setParticipantImportFile(file.name);
      if (!parsedRows.some((row) => !row.duplicate && row.errors.length === 0)) {
        setParticipantImportError('No hay filas listas para importar. Revisa los datos y los posibles duplicados.');
      }
    } catch (err) {
      setParticipantImportError(err.message || 'No se pudo leer el archivo Excel. Verifica que sea .xlsx o .xls.');
    }
    event.target.value = '';
  }

  async function handleImportParticipants() {
    const readyRows = participantImportRows.filter((row) => !row.duplicate && row.errors.length === 0);
    if (!readyRows.length) return;
    setParticipantImporting(true);
    setParticipantImportError('');

    // Verificación final contra la base de datos para evitar duplicados si el registro cambió
    // después de mostrar la vista previa.
    const { data: currentParticipants, error: lookupError } = await supabase
      .from('participantes')
      .select('nombre_completo');
    if (lookupError) {
      setParticipantImportError('No se pudo comprobar si los participantes ya existen. No se importó ningún registro; inténtalo nuevamente.');
      setParticipantImporting(false);
      return;
    }

    const currentNames = new Set((currentParticipants || []).map((item) => normalizeImportName(item.nombre_completo)));
    const newlyDuplicated = new Set(
      readyRows
        .filter((row) => currentNames.has(normalizeImportName(row.nombre_completo)))
        .map((row) => row.rowNumber)
    );
    if (newlyDuplicated.size > 0) {
      setParticipantImportRows((current) => current.map((row) => newlyDuplicated.has(row.rowNumber)
        ? { ...row, duplicate: true, duplicateReason: 'Ya existe en el registro; se omitirá' }
        : row));
      setParticipantImportError('Al revisar nuevamente la base de datos encontramos nombres que ya estaban registrados. Los marcamos como duplicados; puedes importar los demás cuando revises la lista.');
      setParticipantImporting(false);
      return;
    }

    const records = readyRows.map(({ rowNumber, duplicate, duplicateReason, errors, ...record }) => ({
      ...record,
      activo: true,
    }));
    const { error: insertError } = await supabase.from('participantes').insert(records);
    if (insertError) {
      setParticipantImportError('No se pudieron importar los participantes. No se confirmó la carga; revisa los datos e inténtalo nuevamente.');
    } else {
      setParticipantImportRows([]);
      setParticipantImportFile('');
      await loadParticipants();
    }
    setParticipantImporting(false);
  }

  async function handleSaveParticipantChanges(event) {
    event.preventDefault();
    if (!selectedParticipant?.nombre_completo?.trim() || !selectedParticipant?.sexo || !selectedParticipant?.tipo_participante) return;
    setSavingParticipantChanges(true);
    setParticipantError('');
    const hasEducationFields = !['mensajero', 'cocina'].includes(selectedParticipant.tipo_participante);
    const hasBookAndGuidelines = ['joven', 'servidor', 'entrenante'].includes(selectedParticipant.tipo_participante);
    const changes = {
      nombre_completo: selectedParticipant.nombre_completo.trim(),
      iglesia_id: selectedParticipant.iglesia_id || null,
      tipo_participante: selectedParticipant.tipo_participante,
      sistema_educativo: hasEducationFields && selectedParticipant.tipo_participante !== 'entrenante' ? (selectedParticipant.sistema_educativo || null) : null,
      anio_escolar: hasEducationFields ? (selectedParticipant.anio_escolar || null) : null,
      semestre: selectedParticipant.tipo_participante === 'entrenante' ? (selectedParticipant.semestre || null) : null,
      fecha_nacimiento: selectedParticipant.fecha_nacimiento || null,
      sexo: selectedParticipant.sexo,
      telefono: selectedParticipant.telefono?.trim() || null,
      necesita_libro: hasBookAndGuidelines && Boolean(selectedParticipant.necesita_libro),
      dieta_especial: selectedParticipant.dieta_especial?.trim() || null,
      formulario_directrices_firmado: hasBookAndGuidelines && Boolean(selectedParticipant.formulario_directrices_firmado),
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


  async function loadFinanceData() {
    setFinanceLoading(true);
    setFinanceError('');
    const [
      { data: cycleRows, error: cycleErr },
      { data: feeRows, error: feeErr },
      { data: feeConfigRows, error: feeConfigErr },
      { data: paymentRows, error: paymentErr },
      { data: movementRows, error: movementErr },
      { data: enrollmentRows, error: enrollmentErr },
      { data: participantRows, error: participantErr },
      { data: localityRows, error: localityErr },
    ] = await Promise.all([
      supabase.from('ciclos_escolares').select('id, anio, estado').order('anio', { ascending: false }),
      supabase.from('cuotas_inscripcion').select('id, inscripcion_id, monto_base, monto_final'),
      supabase.from('configuracion_cuotas').select('ciclo_id, monto_general'),
      supabase.from('pagos_cuotas').select('id, cuota_inscripcion_id, monto, fecha_pago, metodo, referencia').order('fecha_pago', { ascending: false }),
      supabase.from('movimientos_financieros').select('id, ciclo_id, tipo, concepto, monto, fecha, metodo, referencia, observaciones').order('fecha', { ascending: false }),
      supabase.from('inscripciones').select('id, participante_id, ciclo_id, tipo_inscripcion, nivel_id'),
      supabase.from('participantes').select('id, nombre_completo, iglesia_id'),
      supabase.from('iglesias').select('id, nombre, activa').order('nombre', { ascending: true }),
    ]);
    if (cycleErr || feeErr || feeConfigErr || paymentErr || movementErr || enrollmentErr || participantErr || localityErr) {
      setFinanceError('No se pudieron cargar todos los datos financieros. Verifica los permisos del perfil de Finanzas.');
    } else {
      setFinanceCycles(cycleRows || []);
      setFinanceCycleId((current) => current || cycleRows?.[0]?.id || '');
      setFinanceLocalities((localityRows || []).filter((item) => item.activa !== false));
      const localityMap = new Map((localityRows || []).map((item) => [item.id, item.nombre]));
      const participantMap = new Map((participantRows || []).map((p) => [p.id, { nombre: p.nombre_completo, iglesia_id: p.iglesia_id, localidad: localityMap.get(p.iglesia_id) || 'Sin localidad' }]));
      const enrollmentMap = new Map((enrollmentRows || []).map((item) => [item.id, {
        ...item, participante: participantMap.get(item.participante_id)?.nombre || 'Participante',
        iglesia_id: participantMap.get(item.participante_id)?.iglesia_id || '',
        localidad: participantMap.get(item.participante_id)?.localidad || 'Sin localidad',
      }]));
      setFinanceEnrollments([...enrollmentMap.values()]);
      setFinanceFeeConfigs(feeConfigRows || []);
      const activeCycleForFee = financeCycleId || cycleRows?.[0]?.id || '';
      const activeFeeConfig = (feeConfigRows || []).find((item) => item.ciclo_id === activeCycleForFee);
      setFinanceGeneralFeeAmount(String(activeFeeConfig?.monto_general ?? 4000));
      setFinanceFees((feeRows || []).map((fee) => ({
        ...fee, enrollment: enrollmentMap.get(fee.inscripcion_id),
      })));
      setFinancePayments(paymentRows || []);
      setFinanceMovements(movementRows || []);
    }
    setFinanceLoading(false);
  }

  useEffect(() => {
    if (activeModule === 'Finanzas' && profile?.activo
      && ['coordinacion_general', 'finanzas'].includes(profile.rol)) {
      loadFinanceData();
    }
  }, [activeModule, profile]);


  async function loadReportData() {
    setReportLoading(true);
    setReportError('');
    const [
      { data: cycles, error: cyclesError },
      { data: participants, error: participantsError },
      { data: churches, error: churchesError },
      { data: levels, error: levelsError },
      { data: enrollments, error: enrollmentsError },
      { data: fees, error: feesError },
      { data: payments, error: paymentsError },
      { data: movements, error: movementsError },
    ] = await Promise.all([
      supabase.from('ciclos_escolares').select('id, anio, estado').order('anio', { ascending: false }),
      supabase.from('participantes').select('id, codigo, nombre_completo, iglesia_id, tipo_participante, fecha_nacimiento, sexo, telefono, necesita_libro, dieta_especial, formulario_directrices_firmado, sistema_educativo, anio_escolar, semestre, activo, created_at'),
      supabase.from('iglesias').select('id, nombre, activa').order('nombre', { ascending: true }),
      profile?.rol === 'coordinacion_general' ? supabase.from('niveles').select('id, numero, nombre, activo').order('numero', { ascending: true }) : Promise.resolve({ data: [], error: null }),
      supabase.from('inscripciones').select('id, participante_id, ciclo_id, nivel_id, tipo_inscripcion, tipo_participacion, estado'),
      supabase.from('cuotas_inscripcion').select('id, inscripcion_id, monto_final'),
      supabase.from('pagos_cuotas').select('id, cuota_inscripcion_id, monto, fecha_pago'),
      supabase.from('movimientos_financieros').select('id, ciclo_id, tipo, concepto, monto, fecha'),
    ]);
    if (cyclesError || participantsError || churchesError || levelsError || enrollmentsError || feesError || paymentsError || movementsError) {
      setReportError('No se pudieron cargar todos los datos para los reportes. Verifica los permisos de acceso e inténtalo nuevamente.');
    } else {
      setReportCycles(cycles || []);
      setReportCycleId((current) => current || cycles?.[0]?.id || '');
      setReportParticipants(participants || []);
      setReportChurches(churches || []);
      setReportLevels(levels || []);
      setReportEnrollments(enrollments || []);
      setReportFees(fees || []);
      setReportPayments(payments || []);
      setReportMovements(movements || []);
    }
    setReportLoading(false);
  }

  useEffect(() => {
    if (activeModule === 'Reportes' && profile?.activo && ['coordinacion_general', 'finanzas'].includes(profile.rol)) loadReportData();
  }, [activeModule, profile]);

  const reportCycle = reportCycles.find((cycle) => cycle.id === reportCycleId);
  const reportCycleEnrollments = reportEnrollments.filter((item) => item.ciclo_id === reportCycleId);
  const reportEnrollmentByParticipant = new Map(reportCycleEnrollments.map((item) => [item.participante_id, item]));
  const reportActiveParticipants = reportParticipants.filter((item) => item.activo !== false);
  const reportFilteredParticipants = reportActiveParticipants
    .filter((person) => {
      const enrollment = reportEnrollmentByParticipant.get(person.id);
      if (!enrollment) return false;
      if (reportFilterChurch !== 'todos' && person.iglesia_id !== reportFilterChurch) return false;
      if (reportFilterLevel === 'sin-nivel' && enrollment.nivel_id) return false;
      if (reportFilterLevel !== 'todos' && reportFilterLevel !== 'sin-nivel' && enrollment.nivel_id !== reportFilterLevel) return false;
      if (reportFilterType !== 'todos' && person.tipo_participante !== reportFilterType) return false;
      if (reportFilterStatus !== 'todos' && enrollment.estado !== reportFilterStatus) return false;
      return true;
    })
    .sort((a, b) => (a.nombre_completo || '').localeCompare(b.nombre_completo || '', 'es'));
  const reportLocalitySummary = reportChurches.map((church) => ({
    localidad: church.nombre,
    participantes: reportActiveParticipants.filter((item) => item.iglesia_id === church.id).length,
    inscritos: reportCycleEnrollments.filter((item) => reportParticipants.find((person) => person.id === item.participante_id)?.iglesia_id === church.id).length,
  })).filter((item) => item.participantes || item.inscritos);
  const reportLevelSummary = reportLevels.map((level) => ({
    nivel: level.nombre,
    cantidad: reportCycleEnrollments.filter((item) => item.nivel_id === level.id).length,
  })).filter((item) => item.cantidad > 0);
  const reportTypeSummary = ['joven', 'servidor', 'entrenante', 'mensajero', 'cocina'].map((type) => ({
    tipo: type.charAt(0).toUpperCase() + type.slice(1),
    cantidad: reportActiveParticipants.filter((person) => person.tipo_participante === type).length,
  })).filter((item) => item.cantidad > 0);
  const reportSexSummary = [
    { sexo: 'Femenino', cantidad: reportActiveParticipants.filter((person) => person.sexo === 'F').length },
    { sexo: 'Masculino', cantidad: reportActiveParticipants.filter((person) => person.sexo === 'M').length },
    { sexo: 'Sin dato', cantidad: reportActiveParticipants.filter((person) => !['F', 'M'].includes(person.sexo)).length },
  ].filter((item) => item.cantidad > 0);
  const reportSpecialDietParticipants = reportActiveParticipants
    .filter((person) => reportEnrollmentByParticipant.has(person.id) && person.dieta_especial?.trim())
    .map((person) => ({
      nombre: person.nombre_completo,
      localidad: reportChurches.find((church) => church.id === person.iglesia_id)?.nombre || 'Sin localidad',
      tipo: person.tipo_participante || '',
      indicacion: person.dieta_especial.trim(),
    }))
    .sort((a, b) => a.localidad.localeCompare(b.localidad, 'es') || a.nombre.localeCompare(b.nombre, 'es'));
  const reportEnrollmentStatusSummary = [...new Set(reportCycleEnrollments.map((item) => item.estado).filter(Boolean))].map((status) => ({
    estado: status.replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase()),
    cantidad: reportCycleEnrollments.filter((item) => item.estado === status).length,
  }));
  const reportCycleFees = reportFees.filter((fee) => reportCycleEnrollments.some((item) => item.id === fee.inscripcion_id));
  const reportCycleFeeIds = new Set(reportCycleFees.map((fee) => fee.id));
  const reportCyclePayments = reportPayments.filter((payment) => reportCycleFeeIds.has(payment.cuota_inscripcion_id));
  const reportTotalFees = reportCycleFees.reduce((sum, fee) => sum + Number(fee.monto_final || 0), 0);
  const reportTotalPaid = reportCyclePayments.reduce((sum, payment) => sum + Number(payment.monto || 0), 0);
  const reportOtherIncome = reportMovements.filter((item) => item.ciclo_id === reportCycleId && item.tipo !== 'gasto').reduce((sum, item) => sum + Number(item.monto || 0), 0);
  const reportExpenses = reportMovements.filter((item) => item.ciclo_id === reportCycleId && item.tipo === 'gasto').reduce((sum, item) => sum + Number(item.monto || 0), 0);
  const reportIncome = reportTotalPaid + reportOtherIncome;

  function exportReports() {
    const workbook = XLSX.utils.book_new();
    const participantRows = reportParticipants.map((person) => {
      const enrollment = reportEnrollmentByParticipant.get(person.id);
      return {
        Código: person.codigo || '',
        'Nombre completo': person.nombre_completo || '',
        Localidad: reportChurches.find((church) => church.id === person.iglesia_id)?.nombre || 'Sin localidad',
        'Asiste como': person.tipo_participante || '',
        'Fecha de nacimiento': person.fecha_nacimiento || '',
        Edad: calculateAge(person.fecha_nacimiento) ?? '',
        Sexo: person.sexo === 'F' ? 'Femenino' : person.sexo === 'M' ? 'Masculino' : '',
        Teléfono: person.telefono || '',
        'Sistema educativo': person.sistema_educativo || '',
        'Año escolar': person.anio_escolar || '',
        Semestre: person.semestre || '',
        'Necesita libro': person.necesita_libro ? 'Sí' : 'No',
        'Directrices firmadas': person.formulario_directrices_firmado ? 'Sí' : 'No',
        'Dieta especial / indicación de salud': person.dieta_especial || '',
        'Estado del registro': person.activo === false ? 'Inactivo' : 'Activo',
        Inscrito: enrollment ? 'Sí' : 'No',
        Nivel: reportLevels.find((level) => level.id === enrollment?.nivel_id)?.nombre || '',
        'Estado de inscripción': enrollment?.estado || '',
        'Fecha de registro': person.created_at ? new Date(person.created_at).toLocaleDateString('es-HN') : '',
      };
    });
    const filteredParticipantRows = reportFilteredParticipants.map((person) => {
      const enrollment = reportEnrollmentByParticipant.get(person.id);
      return {
        Código: person.codigo || '',
        Participante: person.nombre_completo || '',
        Localidad: reportChurches.find((church) => church.id === person.iglesia_id)?.nombre || 'Sin localidad',
        'Asiste como': person.tipo_participante || '',
        Nivel: reportLevels.find((level) => level.id === enrollment?.nivel_id)?.nombre || '',
        'Estado de inscripción': enrollment?.estado || '',
        Sexo: person.sexo === 'F' ? 'Femenino' : person.sexo === 'M' ? 'Masculino' : '',
        Teléfono: person.telefono || '',
      };
    });
    if (profile?.rol === 'coordinacion_general') {
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(participantRows), 'Ficha participantes');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(filteredParticipantRows), 'Listado filtrado');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(reportLocalitySummary), 'Por localidad');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(reportLevelSummary), 'Por nivel');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(reportTypeSummary), 'Por tipo');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(reportSexSummary), 'Por sexo');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(reportEnrollmentStatusSummary), 'Estado inscripciones');
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(reportSpecialDietParticipants.map((person) => ({ Participante: person.nombre, Localidad: person.localidad, 'Asiste como': person.tipo, 'Dieta especial': person.indicacion }))), 'Dieta especial');
    }
    const financeRows = [
      { Concepto: 'Cuotas asignadas', Monto: reportTotalFees },
      { Concepto: 'Abonos recibidos', Monto: reportTotalPaid },
      { Concepto: 'Saldo pendiente de cuotas', Monto: Math.max(0, reportTotalFees - reportTotalPaid) },
      { Concepto: 'Ofrendas y otros ingresos', Monto: reportOtherIncome },
      { Concepto: 'Total de ingresos', Monto: reportIncome },
      { Concepto: 'Gastos', Monto: reportExpenses },
      { Concepto: 'Saldo neto', Monto: reportIncome - reportExpenses },
    ];
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(financeRows), 'Resumen financiero');
    XLSX.writeFile(workbook, 'Reportes_Escuela_de_la_Verdad_' + (reportCycle?.anio || 'general') + '.xlsx');
  }

  async function handleFinanceMovement(event) {
    event.preventDefault();
    const amount = Number(financeAmount);
    if (!financeCycleId || !financeConcept.trim() || !Number.isFinite(amount) || amount <= 0) return;
    setFinanceSaving(true);
    setFinanceError('');
    const { error: saveError } = await supabase.from('movimientos_financieros').insert({
      ciclo_id: financeCycleId,
      tipo: financeMovementType,
      concepto: financeConcept.trim(),
      monto: amount,
      fecha: financeDate,
      metodo: financeMethod,
      referencia: financeReference.trim() || null,
      observaciones: financeNotes.trim() || null,
    });
    if (saveError) {
      setFinanceError('No se pudo guardar el movimiento. Revisa los permisos y los datos ingresados.');
    } else {
      setFinanceConcept('');
      setFinanceAmount('');
      setFinanceReference('');
      setFinanceNotes('');
      await loadFinanceData();
    }
    setFinanceSaving(false);
  }

  async function handleSaveGeneralFeeConfig(event) {
    event.preventDefault();
    const amount = Number(financeGeneralFeeAmount);
    if (!financeCycleId || !Number.isFinite(amount) || amount <= 0) {
      setFinanceError('Ingresa una cuota general válida y selecciona un ciclo.');
      return;
    }
    setFinanceSavingFeeConfig(true);
    setFinanceError('');
    const { error: saveError } = await supabase.from('configuracion_cuotas').upsert(
      { ciclo_id: financeCycleId, monto_general: amount },
      { onConflict: 'ciclo_id' }
    );
    if (saveError) {
      setFinanceError('No se pudo guardar la cuota general. Verifica los permisos del perfil.');
    } else {
      await loadFinanceData();
      setShowFinanceFeeConfig(false);
    }
    setFinanceSavingFeeConfig(false);
  }

  async function handleAssignStandardFees() {
    if (!financeCycleId) return;
    const config = financeFeeConfigs.find((item) => item.ciclo_id === financeCycleId);
    const generalAmount = Number(config?.monto_general);
    if (!config || !Number.isFinite(generalAmount) || generalAmount <= 0) {
      setFinanceError('Primero debe configurarse una cuota general válida para este ciclo.');
      return;
    }
    const existingEnrollmentIds = new Set(financeFees.map((fee) => fee.inscripcion_id));
    const pendingAssignments = financeEnrollments.filter((item) =>
      item.ciclo_id === financeCycleId
      && ['joven', 'servidor'].includes(item.tipo_inscripcion)
      && !existingEnrollmentIds.has(item.id)
    );
    if (pendingAssignments.length === 0) {
      setFinanceError('No hay Jóvenes o Servidores pendientes de asignación de cuota en este ciclo.');
      return;
    }
    setFinanceAssigningFees(true);
    setFinanceError('');
    const { error: insertError } = await supabase.from('cuotas_inscripcion').insert(
      pendingAssignments.map((item) => ({ inscripcion_id: item.id, monto_base: generalAmount, monto_final: generalAmount }))
    );
    if (insertError) {
      setFinanceError('No se pudieron asignar todas las cuotas. No se modificaron las cuotas que ya existían; verifica los permisos e inténtalo de nuevo.');
    } else {
      await loadFinanceData();
    }
    setFinanceAssigningFees(false);
  }

  async function handleFinancePayment(event) {
    event.preventDefault();
    const amount = Number(financePaymentAmount);
    if (!financePaymentQuota || !Number.isFinite(amount) || amount <= 0) return;
    setFinanceSaving(true);
    setFinanceError('');
    const { error: saveError } = await supabase.from('pagos_cuotas').insert({
      cuota_inscripcion_id: financePaymentQuota,
      monto: amount,
      fecha_pago: financePaymentDate,
      metodo: financePaymentMethod,
      referencia: financePaymentReference.trim() || null,
    });
    if (saveError) {
      setFinanceError('No se pudo registrar el abono. Comprueba que la cuota exista y que el monto sea válido.');
    } else {
      setFinancePaymentAmount('');
      setFinancePaymentReference('');
      await loadFinanceData();
    }
    setFinanceSaving(false);
  }

  const financeCycleFees = financeFees.filter((fee) => fee.enrollment?.ciclo_id === financeCycleId);
  const financeFilteredCycleFees = financeCycleFees.filter((fee) => !financeBalancesLocalityId || fee.enrollment?.iglesia_id === financeBalancesLocalityId);
  const financeUnassignedStandardCount = financeEnrollments.filter((item) => item.ciclo_id === financeCycleId && ['joven', 'servidor'].includes(item.tipo_inscripcion) && !financeFees.some((fee) => fee.inscripcion_id === item.id)).length;
  const financeCycleMovements = financeMovements.filter((item) => item.ciclo_id === financeCycleId);
  const financeCyclePayments = financePayments.filter((payment) => financeCycleFees.some((fee) => fee.id === payment.cuota_inscripcion_id));
  const financePaidByQuota = new Map(financeCyclePayments.reduce((map, payment) => {
    map.set(payment.cuota_inscripcion_id, (map.get(payment.cuota_inscripcion_id) || 0) + Number(payment.monto || 0));
    return map;
  }, new Map()));
  const financePendingFees = financeCycleFees.filter((fee) => Number(fee.monto_final || 0) - (financePaidByQuota.get(fee.id) || 0) > 0 && (!financeLocalityId || fee.enrollment?.iglesia_id === financeLocalityId));
  const financeTotalFees = financeCycleFees.reduce((sum, fee) => sum + Number(fee.monto_final || 0), 0);
  const financeTotalPaid = financeCyclePayments.reduce((sum, payment) => sum + Number(payment.monto || 0), 0);
  const financeBalance = Math.max(0, financeTotalFees - financeTotalPaid);
  const financeIncome = financeCycleMovements.filter((item) => item.tipo !== 'gasto').reduce((sum, item) => sum + Number(item.monto || 0), 0);
  const financeExpenses = financeCycleMovements.filter((item) => item.tipo === 'gasto').reduce((sum, item) => sum + Number(item.monto || 0), 0);

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

  if (visitorMode) return <VisitorDemo />;

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

      <div className="app-layout">
        <aside className="module-sidebar" aria-label="Navegación principal">
          <p className="sidebar-label">MENÚ PRINCIPAL</p>
          <button className={`sidebar-link ${activeModule === '' ? 'active' : ''}`} type="button" onClick={() => setActiveModule('')}>
            <span className="sidebar-link-number">⌂</span><span>Inicio</span>
          </button>
          {modules.filter((module) => ['Iglesias', 'Participantes', 'Inscripciones', 'Finanzas', 'Reportes'].includes(module.title) && (profile?.rol === 'coordinacion_general' || (profile?.rol === 'finanzas' && ['Finanzas', 'Reportes'].includes(module.title)))).map((module) => (
            <button
              className={`sidebar-link ${activeModule === module.title ? 'active' : ''}`}
              key={module.number}
              type="button"
              onClick={() => setActiveModule(module.title)}
            >
              <span className="sidebar-link-number">{module.number}</span><span>{module.title}</span>
            </button>
          ))}
        </aside>
        <div className="app-main-content">
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

      ) : activeModule === 'Finanzas' ? (
        <section className="work-section">
          <button className="back-button" type="button" onClick={() => setActiveModule('')}>← Volver a módulos</button>
          <div className="section-heading">
            <div><p className="eyebrow">ADMINISTRACIÓN FINANCIERA</p><h2>Finanzas</h2><p className="work-intro">Control de inscripciones, abonos, ofrendas e ingresos y gastos de la Escuela de la Verdad.</p></div>
            <span className="module-count">{financeCycles.find((cycle) => cycle.id === financeCycleId)?.anio || 'Ciclo'}</span>
          </div>
          <div className="finance-toolbar">
            <label htmlFor="finance-cycle">Ciclo</label>
            <select id="finance-cycle" value={financeCycleId} onChange={(event) => setFinanceCycleId(event.target.value)}>
              <option value="">Seleccionar ciclo</option>
              {financeCycles.map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.anio} · {cycle.estado}</option>)}
            </select>
            <button className="text-button" type="button" onClick={loadFinanceData} disabled={financeLoading}>Actualizar datos</button>
          </div>
          <div className="finance-config-toggle">
            <button className="text-button" type="button" onClick={() => setShowFinanceFeeConfig((current) => !current)} aria-expanded={showFinanceFeeConfig}>
              {showFinanceFeeConfig ? 'Cerrar configuración de cuotas' : 'Configurar cuotas'}
            </button>
          </div>
          {showFinanceFeeConfig && (
            <section className="profile-card finance-records">
              <p className="eyebrow">CONFIGURACIÓN DE CUOTAS</p>
              <form className="finance-form" onSubmit={handleSaveGeneralFeeConfig}>
                <label htmlFor="finance-general-fee">Cuota general del ciclo seleccionado (lempiras)</label>
                <input id="finance-general-fee" type="number" min="0.01" step="0.01" value={financeGeneralFeeAmount} onChange={(event) => setFinanceGeneralFeeAmount(event.target.value)} required />
                <p className="field-hint">Esta será la cuota base para Jóvenes y Servidores. Los descuentos, becas y la cuota reducida de Entrenantes se gestionarán individualmente o por categoría.</p>
                <button className="primary-button" type="submit" disabled={financeSavingFeeConfig || !financeCycleId}>{financeSavingFeeConfig ? 'Guardando configuración…' : 'Guardar cuota general'}</button>
              </form>
            </section>
          )}
          {financeError && <p className="auth-error" role="alert">{financeError}</p>}
          {financeLoading ? <p className="empty-state">Cargando información financiera…</p> : (
            <>
              {financeUnassignedStandardCount > 0 && (
                <section className="profile-card finance-records">
                  <p className="eyebrow">ASIGNACIÓN DE CUOTAS</p>
                  <p>Hay {financeUnassignedStandardCount} inscripciones de Jóvenes y Servidores sin cuota asignada. Se aplicará la cuota general configurada de L {Number(financeFeeConfigs.find((item) => item.ciclo_id === financeCycleId)?.monto_general || 0).toLocaleString('es-HN', { minimumFractionDigits: 2 })} a cada una. Los Entrenantes y los ajustes individuales se gestionarán por separado.</p>
                  <button className="primary-button" type="button" onClick={handleAssignStandardFees} disabled={financeAssigningFees || !financeFeeConfigs.some((item) => item.ciclo_id === financeCycleId && Number.isFinite(Number(item.monto_general)) && Number(item.monto_general) > 0)}>{financeAssigningFees ? 'Asignando cuotas…' : 'Asignar cuotas generales'}</button>
                  {!financeFeeConfigs.some((item) => item.ciclo_id === financeCycleId && Number.isFinite(Number(item.monto_general)) && Number(item.monto_general) > 0) && <p className="field-hint">Primero debe configurarse una cuota general válida para este ciclo.</p>}
                </section>
              )}
              <div className="finance-summary-grid">
                <article className="finance-summary-card"><span>Cuotas registradas</span><strong>L {financeTotalFees.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</strong></article>
                <article className="finance-summary-card"><span>Abonos recibidos</span><strong>L {financeTotalPaid.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</strong></article>
                <article className="finance-summary-card"><span>Saldo pendiente de cuotas</span><strong>L {financeBalance.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</strong></article>
                <article className="finance-summary-card"><span>Ofrendas e ingresos</span><strong>L {financeIncome.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</strong></article>
                <article className="finance-summary-card"><span>Gastos registrados</span><strong>L {financeExpenses.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</strong></article>
              </div>
              <div className="finance-columns">
                <section className="profile-card">
                  <p className="eyebrow">REGISTRAR MOVIMIENTO</p>
                  <form className="finance-form" onSubmit={financeMovementType === 'cuota' ? handleFinancePayment : handleFinanceMovement}>
                    <label htmlFor="finance-type">Tipo de movimiento</label>
                    <select id="finance-type" value={financeMovementType} onChange={(event) => setFinanceMovementType(event.target.value)}>
                      <option value="cuota">Cuota de inscripción</option>
                      <option value="ofrenda">Ofrenda</option>
                      <option value="otro_ingreso">Otro ingreso</option>
                      <option value="gasto">Gasto</option>
                    </select>
                    {financeMovementType === 'cuota' ? (
                      <>
                        <label htmlFor="finance-locality">Localidad / iglesia *</label>
                        <select id="finance-locality" value={financeLocalityId} onChange={(event) => { setFinanceLocalityId(event.target.value); setFinancePaymentQuota(''); }} required>
                          <option value="">Seleccionar localidad</option>
                          {financeLocalities.map((locality) => <option key={locality.id} value={locality.id}>{locality.nombre}</option>)}
                        </select>
                        <label htmlFor="finance-quota">Participantes pendientes de pago *</label>
                        <select id="finance-quota" value={financePaymentQuota} onChange={(event) => setFinancePaymentQuota(event.target.value)} required disabled={!financeLocalityId}>
                          <option value="">{financeLocalityId ? 'Seleccionar participante pendiente' : 'Primero selecciona una localidad'}</option>
                          {financePendingFees.map((fee) => <option key={fee.id} value={fee.id}>{fee.enrollment?.participante || 'Participante'} · Saldo L {(Number(fee.monto_final || 0) - (financePaidByQuota.get(fee.id) || 0)).toLocaleString('es-HN', { minimumFractionDigits: 2 })}</option>)}
                        </select>
                        {financeLocalityId && financePendingFees.length === 0 && <p className="field-hint">No hay participantes con cuotas pendientes en esta localidad para el ciclo seleccionado.</p>}
                        <label htmlFor="finance-payment-amount">Monto del pago / abono en lempiras *</label>
                        <input id="finance-payment-amount" type="number" min="0.01" step="0.01" value={financePaymentAmount} onChange={(event) => setFinancePaymentAmount(event.target.value)} required />
                        <label htmlFor="finance-payment-date">Fecha de pago *</label>
                        <input id="finance-payment-date" type="date" value={financePaymentDate} onChange={(event) => setFinancePaymentDate(event.target.value)} required />
                        <label htmlFor="finance-payment-method">Método</label>
                        <select id="finance-payment-method" value={financePaymentMethod} onChange={(event) => setFinancePaymentMethod(event.target.value)}><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="otro">Otro</option></select>
                        <label htmlFor="finance-payment-reference">Referencia / comprobante</label>
                        <input id="finance-payment-reference" value={financePaymentReference} onChange={(event) => setFinancePaymentReference(event.target.value)} />
                        <button className="primary-button" type="submit" disabled={financeSaving || !financePaymentQuota || Number(financePaymentAmount) <= 0}>{financeSaving ? 'Guardando…' : 'Registrar pago de cuota'}</button>
                        {financeFees.length === 0 && <p className="field-hint">Todavía no hay cuotas creadas para este ciclo. Primero deben asignarse las cuotas a los participantes.</p>}
                      </>
                    ) : (
                      <>
                        <label htmlFor="finance-concept">Concepto *</label>
                        <input id="finance-concept" value={financeConcept} onChange={(event) => setFinanceConcept(event.target.value)} placeholder={financeMovementType === 'gasto' ? 'Ej. Alimentación, transporte…' : 'Descripción del ingreso'} required />
                        <label htmlFor="finance-amount">Monto en lempiras *</label>
                        <input id="finance-amount" type="number" min="0.01" step="0.01" value={financeAmount} onChange={(event) => setFinanceAmount(event.target.value)} required />
                        <label htmlFor="finance-date">Fecha *</label>
                        <input id="finance-date" type="date" value={financeDate} onChange={(event) => setFinanceDate(event.target.value)} required />
                        <label htmlFor="finance-method">Método</label>
                        <select id="finance-method" value={financeMethod} onChange={(event) => setFinanceMethod(event.target.value)}><option value="efectivo">Efectivo</option><option value="transferencia">Transferencia</option><option value="otro">Otro</option></select>
                        <label htmlFor="finance-reference">Referencia / comprobante</label>
                        <input id="finance-reference" value={financeReference} onChange={(event) => setFinanceReference(event.target.value)} />
                        <label htmlFor="finance-notes">Observaciones</label>
                        <textarea id="finance-notes" rows="2" value={financeNotes} onChange={(event) => setFinanceNotes(event.target.value)} />
                        <button className="primary-button" type="submit" disabled={financeSaving || !financeCycleId || !financeConcept.trim() || Number(financeAmount) <= 0}>{financeSaving ? 'Guardando…' : 'Guardar movimiento'}</button>
                      </>
                    )}
                  </form>
                </section>
              </div>
              <div className="finance-columns">
                <section className="profile-card finance-records">
                  <p className="eyebrow">INGRESOS</p>
                  <p className="field-hint">Ofrendas y otros ingresos registrados.</p>
                  {financeCycleMovements.filter((item) => item.tipo !== 'gasto').length === 0 ? <p className="empty-state">Aún no hay ingresos registrados.</p> : financeCycleMovements.filter((item) => item.tipo !== 'gasto').map((item) => (
                    <article className="finance-record-row" key={item.id}><div><strong>{item.concepto}</strong><span>{new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-HN')} · {item.tipo === 'ofrenda' ? 'Ofrenda' : 'Otro ingreso'} · {item.metodo || 'Método no indicado'}</span>{item.referencia && <small>Referencia: {item.referencia}</small>}</div><strong className="finance-income">+ L {Number(item.monto).toLocaleString('es-HN', { minimumFractionDigits: 2 })}</strong></article>
                  ))}
                </section>
                <section className="profile-card finance-records">
                  <p className="eyebrow">EGRESOS</p>
                  <p className="field-hint">Gastos registrados durante el ciclo.</p>
                  {financeCycleMovements.filter((item) => item.tipo === 'gasto').length === 0 ? <p className="empty-state">Aún no hay egresos registrados.</p> : financeCycleMovements.filter((item) => item.tipo === 'gasto').map((item) => (
                    <article className="finance-record-row" key={item.id}><div><strong>{item.concepto}</strong><span>{new Date(item.fecha + 'T00:00:00').toLocaleDateString('es-HN')} · {item.metodo || 'Método no indicado'}</span>{item.referencia && <small>Referencia: {item.referencia}</small>}</div><strong className="finance-expense">− L {Number(item.monto).toLocaleString('es-HN', { minimumFractionDigits: 2 })}</strong></article>
                  ))}
                </section>
              </div>
              <section className="profile-card finance-records">
                <p className="eyebrow">CUOTAS Y SALDOS</p>
                <div className="finance-form">
                  <label htmlFor="finance-balances-locality">Filtrar por localidad</label>
                  <select id="finance-balances-locality" value={financeBalancesLocalityId} onChange={(event) => setFinanceBalancesLocalityId(event.target.value)}>
                    <option value="">Todas las localidades</option>
                    {financeLocalities.map((locality) => <option key={locality.id} value={locality.id}>{locality.nombre}</option>)}
                  </select>
                </div>
                {financeFilteredCycleFees.length === 0 ? <p className="empty-state">{financeBalancesLocalityId ? 'No hay cuotas asignadas en esta localidad para el ciclo seleccionado.' : 'No hay cuotas asignadas en este ciclo.'}</p> : financeFilteredCycleFees.map((fee) => {
                  const paid = financePaidByQuota.get(fee.id) || 0;
                  const balance = Number(fee.monto_final || 0) - paid;
                  return <article className="finance-record-row" key={fee.id}><div><strong>{fee.enrollment?.participante || 'Participante'}</strong><span>Cuota: L {Number(fee.monto_final).toLocaleString('es-HN', { minimumFractionDigits: 2 })} · Abonado: L {paid.toLocaleString('es-HN', { minimumFractionDigits: 2 })}</span></div><strong>{balance <= 0 ? 'Cancelada' : paid > 0 ? `Saldo L ${balance.toLocaleString('es-HN', { minimumFractionDigits: 2 })}` : `Pendiente L ${balance.toLocaleString('es-HN', { minimumFractionDigits: 2 })}`}</strong></article>;
                })}
              </section>
            </>
          )}
        </section>
      ) : activeModule === 'Reportes' ? (
        <section className="work-section">
          <button className="back-button" type="button" onClick={() => setActiveModule('')}>← Volver a módulos</button>
          <div className="section-heading"><div><p className="eyebrow">CONSULTAS Y RESÚMENES</p><h2>Reportes</h2><p className="work-intro">Consulta la participación, distribución por localidad y nivel, y el resumen financiero del ciclo.</p></div><span className="module-count">{reportCycle?.anio || 'Ciclo'}</span></div>
          {profile?.rol === 'coordinacion_general' && reportCycleId && (
            <section className="profile-card finance-records report-print-area">
              <p className="eyebrow">LISTADO DE INSCRITOS</p>
              <p className="work-intro">Selecciona uno o varios criterios. El listado y la hoja «Listado filtrado» del Excel mostrarán únicamente las coincidencias.</p>
              <div className="participant-fields">
                <div className="participant-field"><label htmlFor="report-filter-church">Localidad</label>
                  <select id="report-filter-church" value={reportFilterChurch} onChange={(event) => setReportFilterChurch(event.target.value)}>
                    <option value="todos">Todas las localidades</option>
                    {reportChurches.map((church) => <option key={church.id} value={church.id}>{church.nombre}</option>)}
                  </select>
                </div>
                <div className="participant-field"><label htmlFor="report-filter-level">Nivel</label>
                  <select id="report-filter-level" value={reportFilterLevel} onChange={(event) => setReportFilterLevel(event.target.value)}>
                    <option value="todos">Todos los niveles</option>
                    {reportLevels.map((level) => <option key={level.id} value={level.id}>{level.nombre}</option>)}
                    <option value="sin-nivel">Sin nivel</option>
                  </select>
                </div>
                <div className="participant-field"><label htmlFor="report-filter-type">Tipo de participante</label>
                  <select id="report-filter-type" value={reportFilterType} onChange={(event) => setReportFilterType(event.target.value)}>
                    <option value="todos">Todos los tipos</option>
                    {['joven', 'servidor', 'entrenante', 'mensajero', 'cocina'].map((type) => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
                  </select>
                </div>
                <div className="participant-field"><label htmlFor="report-filter-status">Estado de inscripción</label>
                  <select id="report-filter-status" value={reportFilterStatus} onChange={(event) => setReportFilterStatus(event.target.value)}>
                    <option value="todos">Todos los estados</option>
                    {[...new Set(reportCycleEnrollments.map((item) => item.estado).filter(Boolean))].map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ').replace(/^./, (letter) => letter.toUpperCase())}</option>)}
                  </select>
                </div>
              </div>
              <div className="enrollment-selection-heading">
                <strong>{reportFilteredParticipants.length} inscritos encontrados</strong>
                <button className="text-button" type="button" onClick={() => { setReportFilterChurch('todos'); setReportFilterLevel('todos'); setReportFilterType('todos'); setReportFilterStatus('todos'); }}>Limpiar filtros</button>
              </div>
              {reportFilteredParticipants.length === 0 ? <p className="empty-state">No hay inscritos que coincidan con estos filtros.</p> : (
                <div className="finance-records">
                  {reportFilteredParticipants.map((person) => {
                    const enrollment = reportEnrollmentByParticipant.get(person.id);
                    return <article className="finance-record-row" key={person.id}>
                      <div><strong>{person.nombre_completo}</strong><span>{reportChurches.find((church) => church.id === person.iglesia_id)?.nombre || 'Sin localidad'} · {person.tipo_participante || 'Sin tipo'}</span></div>
                      <div><strong>{reportLevels.find((level) => level.id === enrollment?.nivel_id)?.nombre || 'Sin nivel'}</strong><span>{enrollment?.estado?.replaceAll('_', ' ') || ''}</span></div>
                    </article>;
                  })}
                </div>
              )}
            </section>
          )}
          <div className="finance-toolbar">
            <label htmlFor="report-cycle">Ciclo</label>
            <select id="report-cycle" value={reportCycleId} onChange={(event) => setReportCycleId(event.target.value)}><option value="">Seleccionar ciclo</option>{reportCycles.map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.anio} · {cycle.estado}</option>)}</select>
            <button className="text-button" type="button" onClick={loadReportData} disabled={reportLoading}>Actualizar datos</button>
            <button className="text-button report-print-trigger" type="button" onClick={() => window.print()} disabled={reportLoading || !reportCycleId || reportFilteredParticipants.length === 0}>Imprimir listado</button>
            <button className="primary-button" type="button" onClick={exportReports} disabled={reportLoading || !reportCycleId}>Descargar Excel</button>
          </div>
          {reportError && <p className="auth-error" role="alert">{reportError}</p>}
          {reportLoading ? <p className="empty-state">Preparando reportes…</p> : !reportCycleId ? <p className="empty-state">Todavía no hay ciclos registrados para consultar.</p> : (
            <>
              {profile?.rol === 'coordinacion_general' && <>
                <div className="finance-summary-grid">
                  <article className="finance-summary-card"><span>Participantes activos</span><strong>{reportActiveParticipants.length}</strong></article>
                  <article className="finance-summary-card"><span>Inscripciones del ciclo</span><strong>{reportCycleEnrollments.length}</strong></article>
                  <article className="finance-summary-card"><span>Localidades participantes</span><strong>{reportLocalitySummary.length}</strong></article>
                  <article className="finance-summary-card"><span>Niveles con inscritos</span><strong>{reportLevelSummary.length}</strong></article>
                </div>
                <section className="profile-card finance-records"><p className="eyebrow">PARTICIPANTES POR LOCALIDAD</p>
                  {reportLocalitySummary.length === 0 ? <p className="empty-state">No hay participantes o inscripciones para mostrar.</p> : reportLocalitySummary.map((item) => <article className="finance-record-row" key={item.localidad}><div><strong>{item.localidad}</strong><span>{item.participantes} participantes activos · {item.inscritos} inscritos en {reportCycle?.anio}</span></div><strong>{item.inscritos} inscritos</strong></article>)}
                </section>
                <section className="profile-card finance-records"><p className="eyebrow">INSCRIPCIONES POR NIVEL</p>
                  {reportLevelSummary.length === 0 ? <p className="empty-state">No hay niveles con inscripciones en este ciclo.</p> : reportLevelSummary.map((item) => <article className="finance-record-row" key={item.nivel}><strong>{item.nivel}</strong><strong>{item.cantidad}</strong></article>)}
                </section>
                <div className="finance-summary-grid">
                  <section className="profile-card finance-records"><p className="eyebrow">PARTICIPANTES POR TIPO</p>
                    {reportTypeSummary.length === 0 ? <p className="empty-state">No hay datos para mostrar.</p> : reportTypeSummary.map((item) => <article className="finance-record-row" key={item.tipo}><strong>{item.tipo}</strong><strong>{item.cantidad}</strong></article>)}
                  </section>
                  <section className="profile-card finance-records"><p className="eyebrow">PARTICIPANTES POR SEXO</p>
                    {reportSexSummary.length === 0 ? <p className="empty-state">No hay datos para mostrar.</p> : reportSexSummary.map((item) => <article className="finance-record-row" key={item.sexo}><strong>{item.sexo}</strong><strong>{item.cantidad}</strong></article>)}
                  </section>
                </div>
                <section className="profile-card finance-records"><p className="eyebrow">PARTICIPANTES CON DIETA ESPECIAL · {reportSpecialDietParticipants.length}</p>
                  {reportSpecialDietParticipants.length === 0 ? <p className="empty-state">No hay participantes inscritos en este ciclo con dieta especial registrada.</p> : reportSpecialDietParticipants.map((person, index) => <article className="finance-record-row" key={person.nombre + person.localidad + index}>
                    <div><strong>{person.nombre}</strong><p className="work-intro">{person.localidad} · {person.tipo}</p><span>{person.indicacion}</span></div>
                  </article>)}
                </section>
                <section className="profile-card finance-records"><p className="eyebrow">ESTADO DE INSCRIPCIONES · {reportCycle?.anio}</p>
                  {reportEnrollmentStatusSummary.length === 0 ? <p className="empty-state">No hay inscripciones para mostrar.</p> : reportEnrollmentStatusSummary.map((item) => <article className="finance-record-row" key={item.estado}><strong>{item.estado}</strong><strong>{item.cantidad}</strong></article>)}
                </section>
              </>}
              <section className="profile-card finance-records"><p className="eyebrow">RESUMEN FINANCIERO · {reportCycle?.anio}</p>
                <div className="finance-summary-grid">
                  <article className="finance-summary-card"><span>Cuotas asignadas</span><strong>L {reportTotalFees.toLocaleString('es-HN', {minimumFractionDigits:2})}</strong></article>
                  <article className="finance-summary-card"><span>Abonos recibidos</span><strong>L {reportTotalPaid.toLocaleString('es-HN', {minimumFractionDigits:2})}</strong></article>
                  <article className="finance-summary-card"><span>Saldo pendiente</span><strong>L {Math.max(0,reportTotalFees-reportTotalPaid).toLocaleString('es-HN', {minimumFractionDigits:2})}</strong></article>
                  <article className="finance-summary-card"><span>Ofrendas y otros ingresos</span><strong>L {reportOtherIncome.toLocaleString('es-HN', {minimumFractionDigits:2})}</strong></article>
                  <article className="finance-summary-card"><span>Total de ingresos</span><strong>L {reportIncome.toLocaleString('es-HN', {minimumFractionDigits:2})}</strong></article>
                  <article className="finance-summary-card"><span>Gastos</span><strong>L {reportExpenses.toLocaleString('es-HN', {minimumFractionDigits:2})}</strong></article>
                  <article className="finance-summary-card"><span>Saldo neto</span><strong>L {(reportIncome-reportExpenses).toLocaleString('es-HN', {minimumFractionDigits:2})}</strong></article>
                </div>
              </section>
            </>
          )}
        </section>
      ) : activeModule === 'Inscripciones' ? (
        <section className="work-section">
          <button className="back-button" type="button" onClick={() => setActiveModule('')}>← Volver a módulos</button>
          <div className="section-heading">
            <div><p className="eyebrow">REGISTRO ANUAL</p><h2>Inscripciones</h2><p className="work-intro">Registra a cada participante en el ciclo y el sistema asignará su nivel según su historial.</p></div>
            <span className="module-count">{enrollments.length} inscritas</span>
          </div>

          <form className="church-form participant-form" onSubmit={handleBulkAddEnrollments}>
            <p className="eyebrow">INSCRIPCIÓN POR IGLESIA</p>
            <div className="participant-fields enrollment-fields">
              <div className="participant-field">
                <label htmlFor="enrollment-cycle">Ciclo *</label>
                <select id="enrollment-cycle" value={enrollmentCycleId} onChange={(event) => { setEnrollmentCycleId(event.target.value); setSelectedEnrollmentIds([]); setEnrollmentServerLevels({}); setEnrollmentInitialLevels({}); setEnrollmentSupportDays({}); setEnrollmentSupportParticipation({}); }} required>
                  <option value="">Seleccionar ciclo</option>
                  {enrollmentCycles.map((cycle) => <option key={cycle.id} value={cycle.id}>{cycle.anio} · {cycle.estado}</option>)}
                </select>
              </div>
              <div className="participant-field">
                <label htmlFor="enrollment-church">Iglesia / localidad *</label>
                <select id="enrollment-church" value={enrollmentChurchId} onChange={(event) => { setEnrollmentChurchId(event.target.value); setSelectedEnrollmentIds([]); setEnrollmentServerLevels({}); setEnrollmentSupportDays({}); setEnrollmentSupportParticipation({}); }} required>
                  <option value="">Seleccionar iglesia</option>
                  {churches.filter((church) => church.activa).map((church) => <option key={church.id} value={church.id}>{church.nombre}</option>)}
                </select>
              </div>
              <div className="participant-field enrollment-level-field">
                <label>Personas por inscribir</label>
                <div className="auto-level-value">{eligibleChurchParticipants.length} disponibles</div>
              </div>
            </div>
            <p className="enrollment-note">Se muestran los participantes activos de la iglesia seleccionada. Quienes ya están inscritos en este ciclo no se pueden volver a seleccionar.</p>
            {enrollmentChurchId && (
              <div className="enrollment-selection">
                <div className="enrollment-selection-heading">
                  <strong>Participantes de esta iglesia</strong>
                  <button className="text-button" type="button" onClick={() => setSelectedEnrollmentIds(allEligibleSelected ? [] : eligibleChurchParticipants.map((participant) => participant.id))} disabled={eligibleChurchParticipants.length === 0}>
                    {allEligibleSelected ? 'Quitar selección' : 'Seleccionar todos'}
                  </button>
                </div>
                {churchParticipants.length === 0 ? (
                  <p className="empty-state">Esta iglesia todavía no tiene participantes activos registrados.</p>
                ) : (
                  <div className="enrollment-choice-list">
                    {churchParticipants.map((participant) => {
                      const alreadyEnrolled = enrolledParticipantIds.has(participant.id);
                      const isSelected = selectedEnrollmentIds.includes(participant.id);
                      const previousEnrollment = getPreviousEnrollment(participant.id, enrollmentCycleId);
                      const type = getEnrollmentType(participant.id, enrollmentCycleId);
                      const recommendedLevel = getRecommendedLevel(participant.id, enrollmentCycleId);
                      return (
                        <div className={`enrollment-choice ${alreadyEnrolled ? 'enrollment-choice-disabled' : ''}`} key={participant.id}>
                          <label className="enrollment-choice-person">
                            <input
                              type="checkbox"
                              checked={alreadyEnrolled ? false : isSelected}
                              disabled={alreadyEnrolled || !enrollmentCycleId}
                              onChange={(event) => setSelectedEnrollmentIds((current) => event.target.checked
                                ? [...current, participant.id]
                                : current.filter((id) => id !== participant.id))}
                            />
                            <span>
                              <strong>{participant.nombre_completo}</strong>
                              <small>{participant.codigo || 'Sin código'} · {alreadyEnrolled ? 'Ya inscrito en este ciclo' : ['mensajero', 'cocina'].includes(type) ? `${type === 'mensajero' ? 'Mensajero' : 'Cocina'} · sin nivel` : previousEnrollment ? (type === 'servidor' ? 'Servidor · nivel a elegir' : type === 'entrenante' ? `Entrenante · corresponde ${recommendedLevel?.nombre || 'nivel pendiente'}` : `Joven · corresponde ${recommendedLevel?.nombre || 'nivel pendiente'}`) : `${({ joven: 'Joven', servidor: 'Servidor', entrenante: 'Entrenante' })[type] || 'Clasificación pendiente'} · confirmar nivel inicial`}</small>
                            </span>
                          </label>
                          {isSelected && ['mensajero', 'cocina'].includes(type) && (
                            <div className="enrollment-support-days">
                              <div className="participant-field enrollment-server-choice">
                                <label htmlFor={`support-participation-${participant.id}`}>Tipo de participación *</label>
                                <select id={`support-participation-${participant.id}`} value={enrollmentSupportParticipation[participant.id] || ''} onChange={(event) => setEnrollmentSupportParticipation((current) => ({ ...current, [participant.id]: event.target.value }))} required>
                                  <option value="">Seleccionar</option>
                                  <option value="tiempo_completo">Tiempo completo</option>
                                  <option value="medio_tiempo">Tiempo parcial</option>
                                </select>
                              </div>
                              <strong>Días de asistencia *</strong>
                              <p className="field-hint">Selecciona las fechas en que asistirá y el horario de cada una.</p>
                              {selectedCycleDates.map((date) => {
                                const dayValue = enrollmentSupportDays[participant.id]?.[date] || '';
                                return (
                                  <div className="enrollment-support-day" key={date}>
                                    <label className="enrollment-support-day-label">
                                      <input type="checkbox" checked={Boolean(dayValue)} onChange={(event) => setEnrollmentSupportDays((current) => {
                                        const next = { ...(current[participant.id] || {}) };
                                        if (event.target.checked) next[date] = 'dia_completo'; else delete next[date];
                                        return { ...current, [participant.id]: next };
                                      })} />
                                      <span>{formatCycleDate(date)}</span>
                                    </label>
                                    {dayValue && (
                                      <select aria-label={`Horario ${formatCycleDate(date)}`} value={dayValue} onChange={(event) => setEnrollmentSupportDays((current) => ({
                                        ...current,
                                        [participant.id]: { ...(current[participant.id] || {}), [date]: event.target.value },
                                      }))}>
                                        <option value="dia_completo">Día completo</option>
                                        <option value="manana">Mañana</option>
                                        <option value="tarde">Tarde</option>
                                      </select>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {isSelected && !previousEnrollment && !['mensajero', 'cocina'].includes(type) && (
                            <div className="participant-fields enrollment-fields enrollment-initial-fields">
                              <div className="participant-field enrollment-server-choice">
                                <label htmlFor={`initial-level-${participant.id}`}>Nivel inicial confirmado *</label>
                                <select id={`initial-level-${participant.id}`} value={enrollmentInitialLevels[participant.id] || ''} onChange={(event) => setEnrollmentInitialLevels((current) => ({ ...current, [participant.id]: event.target.value }))} required>
                                  <option value="">Seleccionar nivel</option>
                                  {enrollmentLevels.filter((level) => level.activo).map((level) => <option key={level.id} value={level.id}>{level.nombre}</option>)}
                                </select>
                              </div>
                            </div>
                          )}
                          {isSelected && previousEnrollment && type === 'servidor' && (
                            <div className="participant-field enrollment-server-choice">
                              <label htmlFor={`server-level-${participant.id}`}>Nivel del servidor *</label>
                              <select
                                id={`server-level-${participant.id}`}
                                value={enrollmentServerLevels[participant.id] || ''}
                                onChange={(event) => setEnrollmentServerLevels((current) => ({ ...current, [participant.id]: event.target.value }))}
                                required
                              >
                                <option value="">Seleccionar nivel</option>
                                {enrollmentLevels.filter((level) => level.activo).map((level) => <option key={level.id} value={level.id}>{level.nombre}</option>)}
                              </select>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            <p className="enrollment-note">La clasificación se toma del expediente de Participantes. En la primera inscripción digital, Coordinación confirma el nivel inicial; después, el sistema recomienda el avance de los jóvenes según su participación y los servidores eligen su nivel cada año.</p>
            <div className="participant-submit enrollment-submit">
              <span className="enrollment-selected-count">{selectedEligibleParticipants.length} seleccionados</span>
              <button className="primary-button" type="submit" disabled={savingEnrollment || enrollmentsLoading || !enrollmentCycleId || !enrollmentChurchId || selectedEligibleParticipants.length === 0 || selectedEligibleParticipants.some((participant) => {
                const type = getEnrollmentType(participant.id, enrollmentCycleId);
                const support = ['mensajero', 'cocina'].includes(type);
                return !type || (!support && !getEnrollmentLevelFor(participant.id, enrollmentCycleId, enrollmentServerLevels[participant.id])) || (support && (!['tiempo_completo', 'medio_tiempo'].includes(enrollmentSupportParticipation[participant.id]) || !selectedCycleDates.some((date) => enrollmentSupportDays[participant.id]?.[date])));
              })}>
                {savingEnrollment ? 'Guardando…' : 'Confirmar inscripciones'}
              </button>
            </div>
          </form>

          {enrollmentError && <p className="auth-error" role="alert">{enrollmentError}</p>}
          {enrollmentCycleId && courseCycleEnrollments.length > 0 && (
            <section className="cycle-closure">
              <div className="cycle-closure-heading">
                <div>
                  <p className="eyebrow">CIERRE DE PARTICIPACIÓN</p>
                  <strong>{closingCycleId ? 'Revisar excepciones del ciclo' : 'Cierre grupal del ciclo'}</strong>
                  <p>Jóvenes y servidores se consideran de tiempo completo, excepto quienes marques aquí.</p>
                </div>
                {!closingCycleId && <button className="primary-button" type="button" onClick={startCycleClosure}>Cerrar ciclo</button>}
              </div>
              {closingCycleId && (
                <>
                  <div className="cycle-closure-summary">
                    <span><strong>{courseCycleEnrollments.length - Object.keys(closureExceptions).length}</strong> tiempo completo</span>
                    <span><strong>{Object.keys(closureExceptions).length}</strong> excepciones</span>
                  </div>
                  <div className="cycle-exception-list">
                    {enrollments.filter((item) => item.ciclo_id === closingCycleId && ['joven', 'servidor', 'entrenante'].includes(item.tipo_inscripcion)).map((item) => {
                      const exceptionValue = closureExceptions[item.id] || '';
                      return (
                        <div className="cycle-exception-row" key={item.id}>
                          <div className="cycle-exception-person">
                            <strong>{item.participante}</strong>
                            <small>{item.tipo_inscripcion === 'servidor' ? 'Servidor' : 'Joven'} · {item.iglesia || 'Sin iglesia asignada'}</small>
                          </div>
                          <label className="cycle-exception-toggle">
                            <input
                              type="checkbox"
                              checked={Boolean(exceptionValue)}
                              onChange={(event) => setClosureExceptions((current) => {
                                const next = { ...current };
                                if (event.target.checked) next[item.id] = 'medio_tiempo';
                                else delete next[item.id];
                                return next;
                              })}
                            />
                            <span>Excepción</span>
                          </label>
                          {exceptionValue && (
                            <select
                              aria-label={`Tipo de excepción para ${item.participante}`}
                              value={exceptionValue}
                              onChange={(event) => setClosureExceptions((current) => ({ ...current, [item.id]: event.target.value }))}
                            >
                              <option value="medio_tiempo">Medio tiempo</option>
                              <option value="no_asistio">No asistió</option>
                            </select>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="cycle-closure-actions">
                    <button className="text-button" type="button" onClick={() => { setClosingCycleId(''); setClosureExceptions({}); }} disabled={savingCycleClosure}>Cancelar</button>
                    <button className="primary-button" type="button" onClick={handleSaveCycleClosure} disabled={savingCycleClosure}>
                      {savingCycleClosure ? 'Guardando cierre…' : 'Confirmar cierre del ciclo'}
                    </button>
                  </div>
                  <p className="enrollment-note">Al confirmar, todas las inscripciones del ciclo quedarán inicialmente como tiempo completo y se aplicarán las excepciones que marcaste. Esto incluye jóvenes y servidores.</p>
                </>
              )}
            </section>
          )}
          <div className="enrollment-list">
            {enrollmentsLoading ? <p className="empty-state">Cargando inscripciones…</p> : enrollments.length === 0 ? (
              <div className="empty-state"><strong>Aún no hay inscripciones registradas.</strong><span>Cuando registres una, aparecerá aquí.</span></div>
            ) : (
              enrollments.map((enrollment) => (
                <article className="enrollment-row" key={enrollment.id}>
                  <div className="enrollment-main">
                    <strong>{enrollment.participante}</strong>
                    <span>{enrollment.codigo ? `${enrollment.codigo} · ` : ''}{enrollment.iglesia || 'Sin iglesia asignada'}</span>
                    <span>{enrollment.anio ?? 'Ciclo no disponible'} · {({ joven: 'Joven', servidor: 'Servidor', entrenante: 'Entrenante', mensajero: 'Mensajero', cocina: 'Cocina' })[enrollment.tipo_inscripcion] || 'Clasificación pendiente'}{['mensajero', 'cocina'].includes(enrollment.tipo_inscripcion) ? '' : ` · ${enrollment.nivel}`} · {(enrollment.estado || 'inscrito').replace('_', ' ')} · {enrollment.tipo_participacion === 'tiempo_completo' ? 'Tiempo completo' : enrollment.tipo_participacion === 'medio_tiempo' ? 'Tiempo parcial' : enrollment.tipo_participacion === 'no_asistio' ? 'No asistió' : 'Pendiente de cierre'}</span>
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
            <div><p className="eyebrow">REGISTRO GENERAL</p><h2>Participantes</h2><p className="work-intro">Registra a cada joven o servidor una sola vez y vincúlalo con su iglesia.</p></div>
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
                      <label htmlFor="edit-participant-type">Asiste como *</label>
                      <select id="edit-participant-type" value={selectedParticipant.tipo_participante || ''} onChange={(event) => {
                          const nextType = event.target.value;
                          const supportType = ['mensajero', 'cocina'].includes(nextType);
                          const showBookAndGuidelines = ['joven', 'servidor', 'entrenante'].includes(nextType);
                          setSelectedParticipant({
                            ...selectedParticipant,
                            tipo_participante: nextType,
                            sistema_educativo: supportType || nextType === 'entrenante' ? '' : (nextType === 'joven' && selectedParticipant.sistema_educativo === 'no_aplica' ? '' : selectedParticipant.sistema_educativo),
                            anio_escolar: supportType ? '' : selectedParticipant.anio_escolar,
                            semestre: nextType === 'entrenante' ? (selectedParticipant.semestre || '') : '',
                            necesita_libro: showBookAndGuidelines ? selectedParticipant.necesita_libro : false,
                            formulario_directrices_firmado: showBookAndGuidelines ? selectedParticipant.formulario_directrices_firmado : false,
                          });
                        }} required>
                        <option value="">Seleccionar</option><option value="joven">Joven</option><option value="servidor">Servidor</option><option value="entrenante">Entrenante</option><option value="mensajero">Mensajero</option><option value="cocina">Cocina</option>
                      </select>
                    </div>
                    {!['mensajero', 'cocina', 'entrenante'].includes(selectedParticipant.tipo_participante) && (
                      <div className="participant-field">
                        <label htmlFor="edit-participant-education-system">Sistema educativo</label>
                        <select id="edit-participant-education-system" value={selectedParticipant.sistema_educativo || ''} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, sistema_educativo: event.target.value })}>
                          <option value="">Seleccionar</option><option value="nacional">Nacional</option><option value="americano">Americano</option>
                          {selectedParticipant.tipo_participante === 'servidor' && <option value="no_aplica">No aplica</option>}
                        </select>
                      </div>
                    )}
                    {!['mensajero', 'cocina'].includes(selectedParticipant.tipo_participante) && (
                      <div className="participant-field">
                        <label htmlFor="edit-participant-school-year">Año escolar (último completado)</label>
                        <select id="edit-participant-school-year" value={selectedParticipant.anio_escolar || ''} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, anio_escolar: event.target.value })}>
                          <option value="">Seleccionar</option><option value="Sexto">Sexto</option><option value="Séptimo">Séptimo</option><option value="Octavo">Octavo</option><option value="Noveno">Noveno</option><option value="Décimo">Décimo</option><option value="Undécimo">Undécimo</option><option value="Duodécimo">Duodécimo</option><option value="Universidad">Universidad</option><option value="Graduado">Graduado</option><option value="ETC">ETC</option>
                        </select>
                      </div>
                    )}
                    {selectedParticipant.tipo_participante === 'entrenante' && (
                      <div className="participant-field">
                        <label htmlFor="edit-participant-semester">Semestre</label>
                        <select id="edit-participant-semester" value={selectedParticipant.semestre || ''} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, semestre: event.target.value })}>
                          <option value="">Seleccionar</option><option value="I">I Semestre</option><option value="II">II Semestre</option><option value="III">III Semestre</option><option value="IV">IV Semestre</option>
                        </select>
                      </div>
                    )}
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
                    {['joven', 'servidor', 'entrenante'].includes(selectedParticipant.tipo_participante) && (
                      <div className="participant-field">
                        <label htmlFor="edit-participant-book">¿Necesita libro?</label>
                        <select id="edit-participant-book" value={selectedParticipant.necesita_libro ? 'true' : 'false'} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, necesita_libro: event.target.value === 'true' })}>
                          <option value="false">No</option><option value="true">Sí</option>
                        </select>
                      </div>
                    )}
                    <div className="participant-field">
                      <label htmlFor="edit-participant-diet">Dieta especial por salud</label>
                      <input id="edit-participant-diet" value={selectedParticipant.dieta_especial || ''} maxLength={300} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, dieta_especial: event.target.value })} />
                    </div>
                    {['joven', 'servidor', 'entrenante'].includes(selectedParticipant.tipo_participante) && (
                      <div className="participant-field">
                        <label htmlFor="edit-participant-guidelines">¿Firmó el formulario de directrices?</label>
                        <select id="edit-participant-guidelines" value={selectedParticipant.formulario_directrices_firmado ? 'true' : 'false'} onChange={(event) => setSelectedParticipant({ ...selectedParticipant, formulario_directrices_firmado: event.target.value === 'true' })}>
                          <option value="false">No</option><option value="true">Sí</option>
                        </select>
                      </div>
                    )}
                  </div>
                  <div className="participant-edit-buttons">
                    <button className="text-button" type="button" onClick={() => { setSelectedParticipant(participantBeforeEdit); setParticipantBeforeEdit(null); setEditingParticipant(false); setParticipantError(''); }}>Cancelar</button>
                    <button className="primary-button" type="submit" disabled={savingParticipantChanges || !selectedParticipant.nombre_completo?.trim() || !selectedParticipant.sexo || !selectedParticipant.tipo_participante}>{savingParticipantChanges ? 'Guardando…' : 'Guardar cambios'}</button>
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
                    <div><dt>Asiste como</dt><dd>{({ joven: 'Joven', servidor: 'Servidor', entrenante: 'Entrenante', mensajero: 'Mensajero', cocina: 'Cocina' })[selectedParticipant.tipo_participante] || 'Pendiente de selección'}</dd></div>
                    {selectedParticipant.tipo_participante !== 'entrenante' && !['mensajero', 'cocina'].includes(selectedParticipant.tipo_participante) && <div><dt>Sistema educativo</dt><dd>{selectedParticipant.sistema_educativo === 'nacional' ? 'Nacional' : selectedParticipant.sistema_educativo === 'americano' ? 'Americano' : selectedParticipant.sistema_educativo === 'no_aplica' ? 'No aplica' : 'No registrado'}</dd></div>}
                    {!['mensajero', 'cocina'].includes(selectedParticipant.tipo_participante) && <div><dt>Año escolar (último completado)</dt><dd>{selectedParticipant.anio_escolar || 'No registrado'}</dd></div>}
                    {selectedParticipant.tipo_participante === 'entrenante' && <div><dt>Semestre</dt><dd>{selectedParticipant.semestre ? `${selectedParticipant.semestre} Semestre` : 'No registrado'}</dd></div>}
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
              <section className="church-form participant-form participant-import">
                <p className="eyebrow">IMPORTACIÓN DESDE EXCEL</p>
                <h3>Cargar participantes por iglesia</h3>
                <p className="work-intro">Selecciona la iglesia y carga su archivo .xlsx o .xls. Revisaremos los datos antes de guardar.</p>
                <div className="participant-fields">
                  <div className="participant-field">
                    <label htmlFor="participant-import-church">Iglesia *</label>
                    <select id="participant-import-church" value={participantImportChurch} onChange={(event) => { setParticipantImportChurch(event.target.value); setParticipantImportRows([]); setParticipantImportFile(''); setParticipantImportError(''); }} required>
                      <option value="">Seleccionar iglesia</option>
                      {churches.map((church) => <option key={church.id} value={church.id}>{church.nombre}</option>)}
                    </select>
                  </div>
                  <div className="participant-field">
                    <label htmlFor="participant-excel">Archivo Excel *</label>
                    <input id="participant-excel" type="file" accept=".xlsx,.xls" onChange={handleParticipantExcel} disabled={!participantImportChurch || participantImporting} />
                  </div>
                </div>
                <p className="enrollment-note">Columnas necesarias: Nombre completo, Asiste como (Joven, Servidor, Entrenante, Mensajero o Cocina) y Sexo (F/M). Opcionales: Sistema educativo (Nacional/Americano), Año escolar (último completado: Sexto a Duodécimo, Universidad, Graduado o ETC), Fecha de nacimiento, Teléfono, Necesita libro, Dieta especial y Formulario de directrices firmado. Se usa la primera hoja del archivo.</p>
                {participantImportFile && <p className="field-hint">Archivo: {participantImportFile}</p>}
                {participantImportError && <p className="auth-error" role="alert">{participantImportError}</p>}
                {participantImportRows.length > 0 && (
                  <div className="participant-import-preview">
                    <div className="enrollment-selection-heading">
                      <strong>Vista previa: {participantImportRows.length} filas</strong>
                      <span>{participantImportRows.filter((row) => !row.duplicate && row.errors.length === 0).length} listas para importar</span>
                    </div>
                    <div className="participant-list">
                      {participantImportRows.map((row) => (
                        <article className="participant-row" key={row.rowNumber}>
                          <div className="participant-info">
                            <strong>Fila {row.rowNumber}: {row.nombre_completo || 'Sin nombre'}</strong>
                            <span>{({ joven: 'Joven', servidor: 'Servidor', entrenante: 'Entrenante', mensajero: 'Mensajero', cocina: 'Cocina' })[row.tipo_participante] || 'Tipo pendiente'} · {row.sexo || 'Sexo pendiente'}</span>
                            {row.duplicate && <span className="status-inactive">{row.duplicateReason} — se omitirá</span>}
                            {row.errors.map((message) => <span className="status-inactive" key={message}>{message}</span>)}
                          </div>
                          <span className={row.duplicate || row.errors.length ? 'status-inactive' : 'status-active'}>{row.duplicate ? 'Duplicado' : row.errors.length ? 'Revisar' : 'Lista'}</span>
                        </article>
                      ))}
                    </div>
                    <div className="participant-submit">
                      <button className="primary-button" type="button" onClick={handleImportParticipants} disabled={participantImporting || !participantImportRows.some((row) => !row.duplicate && row.errors.length === 0)}>
                        {participantImporting ? 'Importando…' : 'Importar participantes listos'}
                      </button>
                      <button className="text-button" type="button" onClick={() => { setParticipantImportRows([]); setParticipantImportFile(''); setParticipantImportError(''); }}>Cancelar importación</button>
                    </div>
                  </div>
                )}
              </section>

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
                    <label htmlFor="participant-type">Asiste como *</label>
                    <select id="participant-type" value={participantType} onChange={(event) => {
                      const nextType = event.target.value;
                      setParticipantType(nextType);
                      if (['mensajero', 'cocina', 'entrenante'].includes(nextType)) {
                        setParticipantEducationSystem('');
                        if (['mensajero', 'cocina'].includes(nextType)) setParticipantSchoolYear('');
                      }
                      if (nextType !== 'entrenante') setParticipantSemester('');
                      if (nextType === 'joven' && participantEducationSystem === 'no_aplica') {
                        setParticipantEducationSystem('');
                      }
                      if (!['joven', 'servidor', 'entrenante'].includes(nextType)) {
                        setParticipantNeedsBook('false');
                        setParticipantGuidelinesSigned('false');
                      }
                    }} required>
                      <option value="">Seleccionar</option><option value="joven">Joven</option><option value="servidor">Servidor</option><option value="entrenante">Entrenante</option><option value="mensajero">Mensajero</option><option value="cocina">Cocina</option>
                    </select>
                  </div>
                  {!['mensajero', 'cocina', 'entrenante'].includes(participantType) && (
                    <div className="participant-field">
                      <label htmlFor="participant-education-system">Sistema educativo</label>
                      <select id="participant-education-system" value={participantEducationSystem} onChange={(event) => setParticipantEducationSystem(event.target.value)}>
                        <option value="">Seleccionar</option><option value="nacional">Nacional</option><option value="americano">Americano</option>
                        {participantType === 'servidor' && <option value="no_aplica">No aplica</option>}
                      </select>
                    </div>
                  )}
                  {!['mensajero', 'cocina'].includes(participantType) && (
                    <div className="participant-field">
                      <label htmlFor="participant-school-year">Año escolar (último completado)</label>
                      <select id="participant-school-year" value={participantSchoolYear} onChange={(event) => setParticipantSchoolYear(event.target.value)}>
                        <option value="">Seleccionar</option><option value="Sexto">Sexto</option><option value="Séptimo">Séptimo</option><option value="Octavo">Octavo</option><option value="Noveno">Noveno</option><option value="Décimo">Décimo</option><option value="Undécimo">Undécimo</option><option value="Duodécimo">Duodécimo</option><option value="Universidad">Universidad</option><option value="Graduado">Graduado</option><option value="ETC">ETC</option>
                      </select>
                    </div>
                  )}
                  {participantType === 'entrenante' && (
                    <div className="participant-field">
                      <label htmlFor="participant-semester">Semestre</label>
                      <select id="participant-semester" value={participantSemester} onChange={(event) => setParticipantSemester(event.target.value)}>
                        <option value="">Seleccionar</option><option value="I">I Semestre</option><option value="II">II Semestre</option><option value="III">III Semestre</option><option value="IV">IV Semestre</option>
                      </select>
                    </div>
                  )}
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
                  {['joven', 'servidor', 'entrenante'].includes(participantType) && (
                    <div className="participant-field">
                      <label htmlFor="participant-needs-book">¿Necesita libro?</label>
                      <select id="participant-needs-book" value={participantNeedsBook} onChange={(event) => setParticipantNeedsBook(event.target.value)}>
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                      </select>
                    </div>
                  )}
                  <div className="participant-field">
                    <label htmlFor="participant-diet">Dieta especial por salud (opcional)</label>
                    <input id="participant-diet" value={participantDiet} onChange={(event) => setParticipantDiet(event.target.value)} placeholder="Indica solo la restricción o alimento que debemos evitar" maxLength={300} />
                  </div>
                  {['joven', 'servidor', 'entrenante'].includes(participantType) && (
                    <div className="participant-field">
                      <label htmlFor="participant-guidelines">¿Firmó el formulario de directrices?</label>
                      <select id="participant-guidelines" value={participantGuidelinesSigned} onChange={(event) => setParticipantGuidelinesSigned(event.target.value)}>
                        <option value="false">No</option>
                        <option value="true">Sí</option>
                      </select>
                    </div>
                  )}
                </div>
                {hasDuplicateParticipant && (
                  <label className="duplicate-confirm">
                    <input type="checkbox" checked={confirmDuplicate} onChange={(event) => setConfirmDuplicate(event.target.checked)} />
                    Ya verifiqué que es otra persona y no un registro duplicado.
                  </label>
                )}
                <div className="participant-submit">
                  <button className="primary-button" type="submit" disabled={savingParticipant || !participantName.trim() || !participantSex || !participantType || (hasDuplicateParticipant && !confirmDuplicate)}>{savingParticipant ? 'Guardando…' : 'Agregar participante'}</button>
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
                        <span>{({ joven: 'Joven', servidor: 'Servidor', entrenante: 'Entrenante', mensajero: 'Mensajero', cocina: 'Cocina' })[participant.tipo_participante] || 'Pendiente de selección'}{participant.anio_escolar ? ` · ${participant.anio_escolar}` : ''}{participant.semestre ? ` · ${participant.semestre} Semestre` : ''}</span>
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
              {modules.filter((module) => ['Iglesias', 'Participantes', 'Inscripciones', 'Finanzas', 'Reportes'].includes(module.title) && (profile?.rol === 'coordinacion_general' || (profile?.rol === 'finanzas' && ['Finanzas', 'Reportes'].includes(module.title)))).map((module) => (
                <button className="module-card module-card-button" key={module.number} type="button" onClick={() => (['Iglesias', 'Participantes', 'Inscripciones'].includes(module.title) && profile?.rol === 'coordinacion_general') || ['Finanzas', 'Reportes'].includes(module.title) ? setActiveModule(module.title) : null}>
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
        </div>
      </div>
      <footer>Escuela de la Verdad · Honduras</footer>
    </main>
  );
}
