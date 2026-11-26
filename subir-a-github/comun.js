/* =====================================================================
   CÓDIGO COMPARTIDO: catálogo de clientas y panel de la dueña
   ===================================================================== */
const MARGEN_BUENO = 30;   // % de margen desde el cual la ganancia es VERDE (bajo esto: amarillo; negativo: rojo)

const $ = sel => document.querySelector(sel);
const formatoCLP = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 });

// 12990 -> "$12.990"
function pesos(n) {
  const v = Math.round(Number(n) || 0);
  return (v < 0 ? '-$' : '$') + formatoCLP.format(Math.abs(v));
}
function pesosConSigno(n) { return n > 0 ? '+' + pesos(n) : pesos(n); }
// "12.990" o "$12.990" -> 12990
function leerNumero(t) { const d = String(t || '').replace(/\D/g, ''); return d ? parseInt(d, 10) : 0; }
function porcentaje(n) { return Math.round(n) + '%'; }

// Ganancia en $ y margen en %:  margen = ((precio - costo) / precio) * 100
function calcularGanancia(p) {
  const ganancia = (p.precio || 0) - (p.costo || 0);
  return { ganancia, margen: p.precio > 0 ? (ganancia / p.precio) * 100 : 0 };
}
function nivelGanancia(ganancia, margen) {
  if (ganancia < 0) return 'malo';
  if (margen < MARGEN_BUENO) return 'bajo';
  return 'bueno';
}
const TEXTO_NIVEL = { bueno: 'Buena ganancia', bajo: 'Ganancia baja', malo: 'Pierdes plata' };

// Evita que textos escritos por la dueña rompan la página
function esc(t) {
  return String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
// Quita tildes y mayúsculas para buscar ("poleron" encuentra "Polerón")
function normalizar(t) { return String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }

const lsGet = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sin espacio o bloqueado */ } };

// Las fotos de ejemplo están en la carpeta "fotos" de la página; las nuevas, en Google Drive
function fotoURL(f) {
  if (!f) return '';
  if (/^(https?:|data:)/.test(f)) return f;
  return (window.RAIZ || './') + f;
}
function htmlFoto(p) {
  const inicial = esc((p.nombre || '?').charAt(0).toUpperCase());
  if (p.foto) return `<img src="${esc(fotoURL(p.foto))}" alt="${esc(p.nombre)}" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'sin-foto',textContent:'${inicial}'}))">`;
  return `<div class="sin-foto" aria-hidden="true">${inicial}</div>`;
}

// "56912345678" -> "+56 9 1234 5678"
function whatsappLegible(n) { const d = String(n).slice(2); return `+56 ${d[0]} ${d.slice(1, 5)} ${d.slice(5)}`; }

let temporizadorAviso;
function mostrarAviso(texto, esError = false) {
  const el = $('#aviso');
  el.textContent = texto;
  el.classList.toggle('error', esError);
  el.classList.add('visible');
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => el.classList.remove('visible'), esError ? 4500 : 2200);
}

/* ---------- Conexión con el servidor de Google ---------- */
// Usa "text/plain" para que Google lo acepte sin pasos extra (sin "preflight").
async function llamar(accion, data = null, clave = '') {
  const API = (window.CONFIG && CONFIG.API) || lsGet('cav-api') || '';
  if (!API) throw new Error('SIN_ENLACE');
  let r;
  try {
    r = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ api: accion, clave, data }) });
  } catch (e) { throw new Error('SIN_RED'); }
  let j;
  try { j = await r.json(); } catch (e) { throw new Error('RESPUESTA'); }
  if (!j.ok) throw new Error(j.error || 'Error del servidor');
  return j.data;
}

// Indicador "En vivo · 14:32" / "Sin conexión"
function marcarConexion(estado) {
  const el = $('#en-vivo');
  if (!el) return;
  el.className = 'en-vivo ' + estado;
  el.textContent = estado === 'on'
    ? 'En vivo · ' + new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
    : estado === 'off' ? 'Sin conexión · reintentando' : 'Conectando…';
}

if ('serviceWorker' in navigator) navigator.serviceWorker.register((window.RAIZ || './') + 'sw.js').catch(() => {});
