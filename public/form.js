import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const form = document.getElementById('rsvp-form');
const statusText = document.getElementById('form-status');

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? '#b00020' : '#2b8a3e';
}

function normalizeText(value) {
  return String(value || '').trim();
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Enviando...');

  const formData = new FormData(form);
  const raw = Object.fromEntries(formData.entries());

  const nombre = normalizeText(raw.nombre);
  const apellido = normalizeText(raw.apellido);
  const edad = Number(raw.edad);

  if (!nombre || !apellido || !Number.isFinite(edad) || edad <= 0) {
    setStatus('Por favor completá nombre, apellido y edad correctamente.', true);
    return;
  }

  const entry = {
    nombre,
    apellido,
    edad,
    genero: normalizeText(raw.genero),
    asistencia: normalizeText(raw.asistencia),
    telefono: normalizeText(raw.telefono),
    email: normalizeText(raw.email),
    necesidadesComida: normalizeText(raw.necesidadesComida),
    cancion: normalizeText(raw.cancion),
    artista: normalizeText(raw.artista),
    fechaRegistro: serverTimestamp(),
  };

  try {
    await addDoc(collection(db, 'rsvps'), entry);
    setStatus('¡Gracias! Tu confirmación fue registrada correctamente.');
    form.reset();
  } catch (error) {
    console.error(error);
    setStatus('Ocurrió un error al guardar. Intentá de nuevo.', true);
  }
});

