// Theme from ?theme=dark, plus a tiny icon set (inline SVG, 24px grid).
(function () {
  if (/[?&]theme=dark/.test(location.search)) document.documentElement.dataset.theme = "dark";
  const P = {
    search: '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    doc: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    chev: '<path d="M6 9l6 6 6-6"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6L7 7M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c3 3.2 3 13.8 0 17M12 3.5c-3 3.2-3 13.8 0 17"/>',
    flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/>',
    brain: '<path d="M12 5v14M8 7a3 3 0 0 0-3 3 3 3 0 0 0 0 5 3 3 0 0 0 3 3M16 7a3 3 0 0 1 3 3 3 3 0 0 1 0 5 3 3 0 0 1-3 3"/>',
  };
  window.addEventListener("load", () => {
    if (/[?&]measure/.test(location.search)) document.title = "h=" + document.documentElement.scrollHeight;
  });
  window.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-i]").forEach((el) => {
      el.outerHTML = `<svg class="i" viewBox="0 0 24 24">${P[el.dataset.i] || ""}</svg>`;
    });
  });
})();
