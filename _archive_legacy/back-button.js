(function () {
  var path = window.location.pathname;
  if (path === '/' || path === '/index.html') return;

  function init() {
    var header = document.querySelector('header');
    if (!header) return;

    var btn = document.createElement('a');
    btn.href = '#';
    btn.className = 'back-btn-js';
    btn.setAttribute('aria-label', '前のページに戻る');
    btn.innerHTML = '&#8592;&nbsp;戻る';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      history.back();
    });

    var logo = header.querySelector('.logo');
    if (logo) {
      logo.parentNode.insertBefore(btn, logo.nextSibling);
    } else {
      header.insertBefore(btn, header.firstChild);
    }

    var style = document.createElement('style');
    style.textContent = [
      '.back-btn-js {',
      '  font-size: 11px;',
      '  letter-spacing: 0.15em;',
      '  color: rgba(200,169,110,0.8);',
      '  text-decoration: none;',
      '  border: 1px solid rgba(200,169,110,0.35);',
      '  padding: 5px 13px;',
      '  margin-left: 24px;',
      '  transition: border-color .2s, color .2s, background .2s;',
      '  cursor: pointer;',
      '  white-space: nowrap;',
      '  flex-shrink: 0;',
      '}',
      '.back-btn-js:hover {',
      '  border-color: rgba(200,169,110,0.8);',
      '  color: #c8a96e;',
      '  background: rgba(200,169,110,0.08);',
      '}',
      '@media (max-width: 768px) {',
      '  .back-btn-js {',
      '    font-size: 10px;',
      '    padding: 4px 10px;',
      '    margin-left: 12px;',
      '    letter-spacing: 0.1em;',
      '  }',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
