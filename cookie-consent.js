/* ============================================================
   CONSENTIMIENTO DE COOKIES — compartido por todas las páginas.
   Cumple el art. 22.2 LSSI-CE y la Guía de cookies de la AEPD:
   · El Meta Pixel NO se carga hasta que el usuario acepta.
   · «Rechazar» tiene el mismo nivel y el mismo peso que «Aceptar».
   · La elección se guarda 12 meses y se puede cambiar en cualquier
     momento con cualquier botón/enlace que tenga el atributo
     data-cookie-settings (p. ej. «Configurar cookies» en el pie).

   BRAND: sustituye TU_PIXEL_ID por el ID real de tu Meta Pixel
   (business.facebook.com/events_manager). Mientras siga como
   TU_PIXEL_ID, el píxel no se carga aunque se acepte.
   ============================================================ */
(function(){
  const CONFIG = { pixelId: 'TU_PIXEL_ID', storageKey: 'rr_cookie_consent', maxAgeDays: 365 };

  const css = `
.ccb{position:fixed;left:20px;right:20px;bottom:20px;z-index:3000;max-width:860px;margin:0 auto;background:#fff;color:#3d3d3d;border:1px solid #e5e1d8;box-shadow:0 12px 40px rgba(0,0,0,.18);padding:26px 28px;display:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;line-height:1.55;text-align:left;}
.ccb.show{display:block;}
.ccb h4{font-family:Georgia,'Times New Roman',serif;font-weight:400;font-size:19px;color:#1c1c1c;margin:0 0 8px;}
.ccb p{font-size:13.5px;margin:0 0 16px;}
.ccb p a{text-decoration:underline;color:#004225;}
.ccb-prefs{display:none;border-top:1px solid #e5e1d8;margin:4px 0 16px;padding-top:14px;}
.ccb-prefs.open{display:block;}
.ccb-check{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;margin-bottom:10px;cursor:pointer;}
.ccb-check input{margin-top:3px;width:17px;height:17px;flex-shrink:0;accent-color:#004225;}
.ccb-check b{display:block;color:#1c1c1c;}
.ccb-actions{display:flex;gap:10px;flex-wrap:wrap;}
.ccb-actions button{flex:1 1 160px;padding:12px 22px;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;font-weight:600;cursor:pointer;border:1px solid #111;background:#111;color:#fff;border-radius:0;font-family:inherit;transition:background .2s,color .2s;}
.ccb-actions button:hover{background:#004225;border-color:#004225;}
.ccb-actions button.ccb-line{background:#fff;color:#111;}
.ccb-actions button.ccb-line:hover{background:#111;color:#fff;border-color:#111;}
@media (max-width:640px){.ccb{left:10px;right:10px;bottom:10px;padding:20px 18px;}}`;

  const html = `
<h4 id="ccbTitle">Tu privacidad es importante</h4>
<p>Usamos cookies técnicas necesarias para que la web funcione y, solo si nos das tu consentimiento, cookies de marketing (Meta Pixel) para medir y mostrar anuncios relevantes. Puedes aceptarlas, rechazarlas o configurarlas, y cambiar de opinión cuando quieras desde «Configurar cookies» en el pie de página. Más información en nuestra <a href="cookies.html">Política de cookies</a>.</p>
<div class="ccb-prefs">
  <label class="ccb-check"><input type="checkbox" checked disabled> <span><b>Técnicas (siempre activas)</b>Necesarias para el funcionamiento de la web y para recordar tus preferencias de cookies.</span></label>
  <label class="ccb-check"><input type="checkbox" class="ccb-marketing"> <span><b>Marketing</b>Meta Pixel (Meta Platforms Ireland Ltd.): medición de campañas y publicidad personalizada.</span></label>
</div>
<div class="ccb-actions">
  <button type="button" class="ccb-reject">Rechazar</button>
  <button type="button" class="ccb-line ccb-config">Configurar</button>
  <button type="button" class="ccb-accept">Aceptar</button>
</div>`;

  function readConsent(){
    try{
      const c = JSON.parse(localStorage.getItem(CONFIG.storageKey));
      if(c && Date.now() - c.date < CONFIG.maxAgeDays * 864e5) return c;
    }catch(e){}
    return null;
  }
  function saveConsent(marketing){
    const c = {marketing, date: Date.now()};
    try{ localStorage.setItem(CONFIG.storageKey, JSON.stringify(c)); }catch(e){}
    return c;
  }

  let pixelLoaded = false;
  function loadPixel(){
    if(pixelLoaded || !CONFIG.pixelId || CONFIG.pixelId === 'TU_PIXEL_ID') return;
    pixelLoaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', CONFIG.pixelId);
    fbq('track', 'PageView');
  }

  function init(){
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const banner = document.createElement('div');
    banner.className = 'ccb';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-labelledby', 'ccbTitle');
    banner.innerHTML = html;
    document.body.appendChild(banner);

    const prefs = banner.querySelector('.ccb-prefs');
    const marketingBox = banner.querySelector('.ccb-marketing');
    const configBtn = banner.querySelector('.ccb-config');

    function close(marketing){
      const hadPixel = pixelLoaded;
      saveConsent(marketing);
      if(marketing) loadPixel();
      banner.classList.remove('show');
      // Retirada del consentimiento: recargar para descargar el píxel ya inyectado.
      if(hadPixel && !marketing) location.reload();
    }
    function open(){
      const c = readConsent();
      marketingBox.checked = !!(c && c.marketing);
      prefs.classList.remove('open');
      configBtn.textContent = 'Configurar';
      banner.classList.add('show');
    }

    banner.querySelector('.ccb-accept').addEventListener('click', () => close(true));
    banner.querySelector('.ccb-reject').addEventListener('click', () => close(false));
    configBtn.addEventListener('click', () => {
      if(prefs.classList.contains('open')){ close(marketingBox.checked); return; }
      prefs.classList.add('open');
      configBtn.textContent = 'Guardar selección';
    });
    document.querySelectorAll('[data-cookie-settings]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); open(); }));

    const c = readConsent();
    if(c){ if(c.marketing) loadPixel(); }
    else banner.classList.add('show');
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
