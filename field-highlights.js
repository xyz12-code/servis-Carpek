// Servis Carpek: cervene zvyrazneni zatim nevyplnenych poli.
(() => {
  'use strict';
  const roots = ['#pageNew', '#pageDetail'];
  const selector = roots.map(root => root + ' input:not([type="file"]), ' + root + ' textarea, ' + root + ' select').join(', ');
  const style = document.createElement('style');
  style.textContent = [
    '#pageNew .field-empty, #pageDetail .field-empty {',
    '  border: 2px solid #e5484d;',
    '  background-color: #fff0f0;',
    '  box-shadow: inset 0 0 0 1px rgba(229,72,77,.10);',
    '}',
    '#pageNew .field-empty:focus, #pageDetail .field-empty:focus {',
    '  border-color: #c62828;',
    '  box-shadow: 0 0 0 3px rgba(229,72,77,.16);',
    '}'
  ].join('\n');
  document.head.appendChild(style);

  function refresh() {
    document.querySelectorAll(selector).forEach(field => {
      const empty = String(field.value ?? '').trim().length === 0;
      field.classList.toggle('field-empty', empty);
    });
  }
  window.updateEmptyHighlights = refresh;
  document.addEventListener('input', refresh);
  document.addEventListener('change', refresh);
  // Zachytava i hodnoty doplnene z kodu (testovaci VIN, otevreti zakazky, ulozeni).
  document.addEventListener('click', () => {
    requestAnimationFrame(refresh);
    setTimeout(refresh, 200);
  });
  refresh();
})();