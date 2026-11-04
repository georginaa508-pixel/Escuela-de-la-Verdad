import { isSupabaseConfigured } from './lib/supabase.js';

const modules = [
  { number: '01', title: 'Iglesias', description: 'Registro y consulta de iglesias participantes.' },
  { number: '02', title: 'Participantes', description: 'Datos y seguimiento de cada participante.' },
  { number: '03', title: 'Inscripciones', description: 'Inscripciones, niveles y estado de participación.' },
  { number: '04', title: 'Ofrendas y pagos', description: 'Ofrendas, cuotas y abonos registrados.' },
  { number: '05', title: 'Reportes', description: 'Consultas y resúmenes para coordinación.' },
];

export default function App() {
  return (
    <main className="page-shell">
      <header className="topbar">
        <div className="brand-mark" aria-hidden="true">EV</div>
        <div className="brand-copy">
          <span className="eyebrow">HONDURAS</span>
          <strong>Escuela de la Verdad</strong>
        </div>
        <span className="status-pill">Vista inicial</span>
      </header>

      <section className="welcome">
        <p className="eyebrow">SISTEMA DE GESTIÓN</p>
        <h1>Organización clara.<br /><em>Servicio coordinado.</em></h1>
        <p className="intro">Un espacio para organizar la información de iglesias, participantes, inscripciones y actividades de la Escuela de la Verdad.</p>
        <div className={`connection-note ${isSupabaseConfigured ? 'connected' : ''}`}>
          <span className="connection-dot" />
          {isSupabaseConfigured ? 'Variables de conexión detectadas' : 'Conexión con Supabase pendiente de configuración'}
        </div>
      </section>

      <section className="modules-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">ÁREAS DEL SISTEMA</p>
            <h2>Módulos de trabajo</h2>
          </div>
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
