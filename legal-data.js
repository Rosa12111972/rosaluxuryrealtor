/* ============================================================
   DATOS LEGALES — obligatorios por el art. 10 de la LSSI-CE.
   Rellena cada campo marcado con [COMPLETAR]. Mientras quede
   alguno sin rellenar, se mostrará resaltado en el pie de página.
   Se usan en boutique.html, aviso-legal.html, privacidad.html
   y cookies.html.
   ============================================================ */
window.LEGAL = {
  titular: 'Rosa Rodríguez',
  nif: '[COMPLETAR NIF]',
  domicilio: '[COMPLETAR domicilio profesional]',
  email: '[COMPLETAR email]',
  telefono: '+34 698 222 520',
  // Registro de agentes inmobiliarios: obligatorio en Cataluña (AICAT, Decreto 12/2010)
  // y en la Comunitat Valenciana (Ley 2/2017). En otras comunidades es voluntario: déjalo vacío si no aplica.
  registroAgentes: '[COMPLETAR nº de inscripción en el Registro de Agentes Inmobiliarios, si aplica]',
  // Seguro de responsabilidad civil y garantía/caución (obligatorios donde el registro lo es).
  seguroRC: '[COMPLETAR aseguradora y nº de póliza de RC profesional, si aplica]'
};

/* Rellena los elementos <span data-legal="campo"></span> de las páginas legales. */
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-legal]').forEach(el => {
    const v = window.LEGAL[el.dataset.legal] || '';
    el.textContent = v || '—';
    if(!v || v.startsWith('[COMPLETAR')) el.classList.add('todo');
  });
  document.querySelectorAll('[data-legal-if]').forEach(el => {
    if(window.LEGAL[el.dataset.legalIf] === '') el.remove();
  });
});
