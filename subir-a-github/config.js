/* =====================================================================
   CONFIGURACIÓN DE LA TIENDA (la usan el catálogo y el panel)
   ===================================================================== */
window.CONFIG = {
  // Enlace de la "Aplicación web" de Google Apps Script (termina en /exec).
  // Pégalo entre las comillas. Sin este enlace, el catálogo no puede mostrar productos.
  API: "https://script.google.com/macros/s/AKfycbyDnGu_GVnT9tlk01-81nrWNZSd4chhEOV55y5W7LvCOTR1rJAMsuKoXUnaE7Tcz44EPw/exec",

  // Entregas en persona (solo para quienes viven en esta ciudad)
  CIUDAD_LOCAL: "Concepción",
  PUNTOS_ENTREGA: [
    { nombre: "Mall del Centro Concepción", detalle: "Entrega en persona" },
    { nombre: "Mall Plaza Trébol", detalle: "Entrega en persona" },
  ],

  // Envíos para fuera de la ciudad (por pagar)
  COURIERS: ["Starken", "Blue Express"],

  REGIONES: [
    "Arica y Parinacota", "Tarapacá", "Antofagasta", "Atacama", "Coquimbo", "Valparaíso",
    "Metropolitana", "O'Higgins", "Maule", "Ñuble", "Biobío", "La Araucanía",
    "Los Ríos", "Los Lagos", "Aysén", "Magallanes",
  ],
};
