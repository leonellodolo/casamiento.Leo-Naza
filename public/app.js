const form = document.getElementById('rsvp-form');
const statusText = document.getElementById('form-status');
const refreshButton = document.getElementById('refresh-stats');
const songsList = document.getElementById('canciones-list');

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

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? '#b00020' : '#2b8a3e';
}

async function fetchStats() {
  try {
    const response = await fetch('/api/stats');
    if (!response.ok) {
      throw new Error('No se pudieron cargar las estadísticas.');
    }

    const stats = await response.json();

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
      return;
    }

    stats.cancionesSugeridas.forEach((item) => {
      const li = document.createElement('li');
      const artist = item.artista ? ` - ${item.artista}` : '';
      li.textContent = `${item.cancion}${artist} (sugerida por ${item.invitado})`;
      songsList.appendChild(li);
    });
  } catch (error) {
    setStatus(error.message, true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Enviando...');

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/rsvps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'No se pudo guardar la respuesta.');
    }

    setStatus('¡Gracias! Tu confirmación fue registrada.');
    form.reset();
    await fetchStats();
  } catch (error) {
    setStatus(error.message, true);
  }
});

refreshButton.addEventListener('click', fetchStats);

fetchStats();
