const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'rsvps.json');

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '[]', 'utf-8');
  }
}

function readRsvps() {
  ensureDataFile();
  const raw = fs.readFileSync(dataFile, 'utf-8');
  return JSON.parse(raw);
}

function saveRsvps(entries) {
  fs.writeFileSync(dataFile, JSON.stringify(entries, null, 2), 'utf-8');
}

function normalizeText(value) {
  return String(value || '').trim();
}

function normalizeGender(value) {
  const gender = normalizeText(value).toLowerCase();
  if (gender === 'mujer' || gender === 'hombre' || gender === 'otro' || gender === 'prefiero no decirlo') {
    return gender;
  }
  return 'prefiero no decirlo';
}

function normalizeAttendance(value) {
  const attendance = normalizeText(value).toLowerCase();
  if (attendance === 'si' || attendance === 'no') {
    return attendance;
  }
  return null;
}

function getStats(entries) {
  const confirmed = entries.filter((entry) => entry.asistencia === 'si');
  const totalInvitados = entries.length;
  const totalConfirmados = confirmed.length;
  const totalNoAsisten = entries.filter((entry) => entry.asistencia === 'no').length;

  const porGenero = {
    mujer: confirmed.filter((entry) => entry.genero === 'mujer').length,
    hombre: confirmed.filter((entry) => entry.genero === 'hombre').length,
    otro: confirmed.filter((entry) => entry.genero === 'otro').length,
    prefieroNoDecirlo: confirmed.filter((entry) => entry.genero === 'prefiero no decirlo').length,
  };

  const edadesValidas = confirmed
    .map((entry) => Number(entry.edad))
    .filter((edad) => Number.isFinite(edad) && edad > 0);

  const promedioEdad = edadesValidas.length
    ? Number((edadesValidas.reduce((sum, edad) => sum + edad, 0) / edadesValidas.length).toFixed(1))
    : 0;

  const menores45 = edadesValidas.filter((edad) => edad < 45).length;
  const mayores60 = edadesValidas.filter((edad) => edad > 60).length;

  const personasConNecesidadesComida = confirmed.filter(
    (entry) => normalizeText(entry.necesidadesComida).length > 0
  ).length;

  const cancionesSugeridas = confirmed
    .filter((entry) => normalizeText(entry.cancion).length > 0)
    .map((entry) => ({
      invitado: `${entry.nombre} ${entry.apellido}`.trim(),
      cancion: entry.cancion,
      artista: entry.artista,
    }));

  return {
    totalInvitados,
    totalConfirmados,
    totalNoAsisten,
    porGenero,
    promedioEdad,
    menores45,
    mayores60,
    personasConNecesidadesComida,
    cancionesSugeridas,
  };
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/rsvps', (req, res) => {
  const entries = readRsvps();
  res.json(entries);
});

app.get('/api/stats', (req, res) => {
  const entries = readRsvps();
  res.json(getStats(entries));
});

app.post('/api/rsvps', (req, res) => {
  const nombre = normalizeText(req.body.nombre);
  const apellido = normalizeText(req.body.apellido);
  const edad = Number(req.body.edad);
  const genero = normalizeGender(req.body.genero);
  const asistencia = normalizeAttendance(req.body.asistencia);
  const necesidadesComida = normalizeText(req.body.necesidadesComida);
  const cancion = normalizeText(req.body.cancion);
  const artista = normalizeText(req.body.artista);
  const telefono = normalizeText(req.body.telefono);
  const email = normalizeText(req.body.email);

  if (!nombre || !apellido || !Number.isFinite(edad) || edad <= 0 || !asistencia) {
    return res.status(400).json({
      error: 'Datos inválidos. Verificá nombre, apellido, edad y asistencia.',
    });
  }

  const entries = readRsvps();

  const newEntry = {
    id: Date.now(),
    nombre,
    apellido,
    edad,
    genero,
    asistencia,
    telefono,
    email,
    necesidadesComida,
    cancion,
    artista,
    fechaRegistro: new Date().toISOString(),
  };

  entries.push(newEntry);
  saveRsvps(entries);

  return res.status(201).json({
    message: 'Respuesta registrada correctamente.',
    entry: newEntry,
  });
});

ensureDataFile();

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
