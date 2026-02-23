import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const refreshButton = document.getElementById('refresh-stats');
const songsList = document.getElementById('canciones-list');
const tbody = document.getElementById('invitados-tbody');

const statElements = {
  totalInvitados: document.getElementById('totalInvitados'),
  totalConfirmados: document.getElementById('totalConfirmados'),
  totalNoAsisten: document.getElementById('totalNoAsisten'),
  promedioEdad: document.getElementById('promedioEdad'),
  menores45: document.getElementById('menores45'),
  mayores60: document.getElementById('mayores60'),
  mujeres: document.getElementById('mujeres'),
  hombres: document.getElementById('hombres'),
  otros: document.getElementById('otros'),
  necesidades: document.getElementById('necesidades'),
};

const GENDER_LABELS = {
  mujer: 'Mujer',
  hombre: 'Hombre',
  otro: 'Otro',
  'prefiero no decirlo': 'No declara',
};

function formatDate(timestamp) {
  if (!timestamp) return '';
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function computeStats(entries) {
  const confirmed = entries.filter((e) => e.asistencia === 'si');
  const edadesValidas = confirmed
    .map((e) => Number(e.edad))
    .filter((edad) => Number.isFinite(edad) && edad > 0);

  const promedioEdad = edadesValidas.length
    ? Number((edadesValidas.reduce((sum, e) => sum + e, 0) / edadesValidas.length).toFixed(1))
    : 0;

  return {
    totalInvitados: entries.length,
    totalConfirmados: confirmed.length,
    totalNoAsisten: entries.filter((e) => e.asistencia === 'no').length,
    promedioEdad,
    menores45: edadesValidas.filter((e) => e < 45).length,
    mayores60: edadesValidas.filter((e) => e > 60).length,
    porGenero: {
      mujer: confirmed.filter((e) => e.genero === 'mujer').length,
      hombre: confirmed.filter((e) => e.genero === 'hombre').length,
      otro: confirmed.filter((e) => e.genero === 'otro').length,
      prefieroNoDecirlo: confirmed.filter((e) => e.genero === 'prefiero no decirlo').length,
    },
    personasConNecesidadesComida: confirmed.filter(
      (e) => String(e.necesidadesComida || '').trim().length > 0
    ).length,
    cancionesSugeridas: confirmed
      .filter((e) => String(e.cancion || '').trim().length > 0)
      .map((e) => ({
        invitado: `${e.nombre} ${e.apellido}`.trim(),
        cancion: e.cancion,
        artista: e.artista,
      })),
  };
}

function renderStats(stats) {
  statElements.totalInvitados.textContent = stats.totalInvitados;
  statElements.totalConfirmados.textContent = stats.totalConfirmados;
  statElements.totalNoAsisten.textContent = stats.totalNoAsisten;
  statElements.promedioEdad.textContent = stats.promedioEdad;
  statElements.menores45.textContent = stats.menores45;
  statElements.mayores60.textContent = stats.mayores60;
  statElements.mujeres.textContent = stats.porGenero.mujer;
  statElements.hombres.textContent = stats.porGenero.hombre;
  statElements.otros.textContent = stats.porGenero.otro + stats.porGenero.prefieroNoDecirlo;
  statElements.necesidades.textContent = stats.personasConNecesidadesComida;

  songsList.innerHTML = '';
  if (!stats.cancionesSugeridas.length) {
    const li = document.createElement('li');
    li.textContent = 'Todavía no hay canciones sugeridas.';
    songsList.appendChild(li);
  } else {
    stats.cancionesSugeridas.forEach((item) => {
      const li = document.createElement('li');
      const artist = item.artista ? ` - ${item.artista}` : '';
      li.textContent = `${item.cancion}${artist} (sugerida por ${item.invitado})`;
      songsList.appendChild(li);
    });
  }
}

function renderTable(entries) {
  tbody.innerHTML = '';
  if (!entries.length) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 11;
    td.textContent = 'Todavía no hay respuestas registradas.';
    td.style.textAlign = 'center';
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  entries.forEach((entry) => {
    const tr = document.createElement('tr');
    const cells = [
      entry.nombre,
      entry.apellido,
      entry.edad,
      GENDER_LABELS[entry.genero] || entry.genero,
      entry.asistencia === 'si' ? '✓ Sí' : '✗ No',
      entry.telefono || '—',
      entry.email || '—',
      entry.necesidadesComida || '—',
      entry.cancion || '—',
      entry.artista || '—',
      formatDate(entry.fechaRegistro),
    ];
    cells.forEach((value) => {
      const td = document.createElement('td');
      td.textContent = value;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
}

async function refreshAll() {
  try {
    const q = query(collection(db, 'rsvps'), orderBy('fechaRegistro', 'asc'));
    const snapshot = await getDocs(q);
    const entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    renderStats(computeStats(entries));
    renderTable(entries);
  } catch (error) {
    console.error('Error al cargar datos de Firebase:', error);
  }
}

refreshButton.addEventListener('click', refreshAll);
refreshAll();

