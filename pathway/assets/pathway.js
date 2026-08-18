/* Scale each embedded deck so its 1600x900 viewport fits its container. */
(function () {
  var STAGE_WIDTH = 1600;

  function fitDecks() {
    document.querySelectorAll('.deck-embed').forEach(function (box) {
      var frame = box.querySelector('iframe');
      if (!frame || !box.clientWidth) return;
      frame.style.transform = 'scale(' + box.clientWidth / STAGE_WIDTH + ')';
    });
  }

  /* Scope the sidebar to the course you are already in: once a course section
     is active, its siblings -- Home and the other three courses -- come off the
     nav. On the home page nothing is active, so the full list stays. */
  function scopeNav() {
    var nav = document.querySelector('.md-nav--primary');
    var list = nav && nav.querySelector(':scope > .md-nav__list');
    if (!list) return;
    var items = Array.prototype.slice.call(list.children);
    var active = items.filter(function (li) {
      return li.classList.contains('md-nav__item--active');
    });
    if (active.length !== 1) return;
    items.forEach(function (li) {
      if (li === active[0]) return;
      /* Inline style, not the hidden attribute: Material sets
         `.md-nav__item--section { display: block }`, and a class rule outranks
         the user-agent `[hidden] { display: none }`. Home is a plain nav item so
         `hidden` alone appeared to work, while the course sections stayed. */
      li.hidden = true;
      li.style.display = 'none';
    });
  }

  function init() { fitDecks(); scopeNav(); }

  window.addEventListener('resize', fitDecks);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
