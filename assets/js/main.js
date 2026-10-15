/* Shared behaviour for index.html and resume.html.
   Every feature checks that its elements exist, so one file serves both pages. */
(() => {
  'use strict';

  const root = document.documentElement;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const canTransition = () => typeof document.startViewTransition === 'function' && !reducedMotion();

  /* Runs `update` inside a same-document view transition with the page-level
     cross-fade switched off, so only named elements (or a custom clip) animate. */
  function localTransition(update, onReady) {
    if (!canTransition()) { update(); return; }
    root.classList.add('vt-local');
    const t = document.startViewTransition(update);
    if (onReady) t.ready.then(onReady).catch(() => {});
    t.finished.finally(() => root.classList.remove('vt-local'));
    return t;
  }

  /* ---------------- Toast ---------------- */
  const toastEl = $('#toast');
  let toastTimer;
  function toast(message) {
    if (!toastEl) return;
    $('span', toastEl).textContent = message;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  /* ---------------- Theme ---------------- */
  const themeBtn = $('#themeToggle');
  const themeMeta = $('meta[name="theme-color"]');
  function setTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) { /* storage blocked: theme still applies this visit */ }
    if (themeMeta) themeMeta.setAttribute('content', theme === 'dark' ? '#09090B' : '#FAFAFA');
    if (themeBtn) themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
  function toggleTheme(originEl) {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    const r = (originEl || themeBtn || document.body).getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    localTransition(() => setTheme(next), () => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 520, easing: 'cubic-bezier(.16,1,.3,1)', pseudoElement: '::view-transition-new(root)' }
      );
    });
  }
  setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');
  if (themeBtn) themeBtn.addEventListener('click', () => toggleTheme(themeBtn));

  /* ---------------- Header border on scroll ---------------- */
  const header = $('#siteHeader');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------------- Current section in nav ---------------- */
  const navLinks = $$('.nav-link[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    const byId = new Map(navLinks.map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const link = byId.get(en.target.id);
        if (link && en.isIntersecting) {
          navLinks.forEach((a) => a.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    byId.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  /* ---------------- Scroll reveal ---------------- */
  const reveals = $$('.reveal');
  const settle = (el) => {
    const delay = parseFloat(getComputedStyle(el).transitionDelay) || 0;
    setTimeout(() => el.classList.remove('reveal', 'is-in'), 750 + delay * 1000);
  };
  if (!('IntersectionObserver' in window) || reducedMotion()) {
    reveals.forEach((el) => el.classList.remove('reveal'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io.unobserve(en.target);
        settle(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------------- Project filter ---------------- */
  const grid = $('#projectGrid');
  const filterBar = $('#filters');
  const cards = grid ? $$('.card', grid) : [];
  const matches = (card, f) => f === 'all' || card.dataset.tags.split(' ').includes(f);

  function moveIndicator(btn, animate = true) {
    const ind = $('.tab-indicator', filterBar);
    if (!ind || !btn) return;
    if (!animate) ind.style.transition = 'none';
    ind.style.width = btn.offsetWidth + 'px';
    ind.style.transform = `translateX(${btn.offsetLeft}px)`;
    if (!animate) requestAnimationFrame(() => (ind.style.transition = ''));
  }

  function applyFilter(f) {
    const tabs = $$('.tab', filterBar);
    const active = tabs.find((t) => t.dataset.filter === f);
    tabs.forEach((t) => t.setAttribute('aria-pressed', String(t === active)));
    moveIndicator(active);

    let applied = false;
    const update = () => {
      if (applied) return;
      applied = true;
      cards.forEach((c) => c.classList.toggle('is-hidden', !matches(c, f)));
    };
    if (canTransition()) {
      // The transition callback waits for a rendered frame; if the tab isn't
      // painting (backgrounded, throttled), apply the filter anyway.
      setTimeout(update, 400);
      cards.forEach((c, i) => {
        c.classList.remove('reveal', 'is-in');
        c.style.viewTransitionName = 'project-' + i;
      });
      const t = localTransition(update);
      t.finished.finally(() => cards.forEach((c) => (c.style.viewTransitionName = '')));
    } else {
      update();
    }

    const n = cards.filter((c) => matches(c, f)).length;
    const note = $('#filterNote');
    if (note) note.textContent = `Showing ${n} project${n === 1 ? '' : 's'}${f === 'all' ? '' : ' for ' + active.textContent.replace(/\d+/g, '').trim()}.`;
  }

  if (filterBar && cards.length) {
    $$('.tab', filterBar).forEach((tab) => {
      const n = cards.filter((c) => matches(c, tab.dataset.filter)).length;
      $('.count', tab).textContent = n;
      tab.addEventListener('click', () => applyFilter(tab.dataset.filter));
    });
    const place = () => moveIndicator($('.tab[aria-pressed="true"]', filterBar), false);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    place();
    addEventListener('resize', place);
  }

  /* ---------------- Card spotlight + d20 ---------------- */
  if (finePointer) {
    cards.forEach((card) => {
      let raf = 0;
      card.addEventListener('pointermove', (e) => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const r = card.getBoundingClientRect();
          card.style.setProperty('--mx', `${e.clientX - r.left}px`);
          card.style.setProperty('--my', `${e.clientY - r.top}px`);
        });
      });
    });
  }
  const d20 = $('#d20roll');
  const battle = $('#p-battle');
  if (d20 && battle) {
    let rolling = 0;
    battle.addEventListener('mouseenter', () => {
      if (reducedMotion()) { d20.textContent = 1 + Math.floor(Math.random() * 20); return; }
      clearInterval(rolling);
      let ticks = 0;
      rolling = setInterval(() => {
        d20.textContent = 1 + Math.floor(Math.random() * 20);
        if (++ticks > 9) clearInterval(rolling);
      }, 55);
    });
  }

  /* ---------------- Portrait tilt ---------------- */
  const fig = $('#heroFigure');
  const portrait = $('#portraitCard');
  if (fig && portrait && finePointer) {
    fig.addEventListener('pointermove', (e) => {
      if (reducedMotion()) return;
      const r = fig.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      portrait.style.setProperty('--ry', `${(px * 8).toFixed(2)}deg`);
      portrait.style.setProperty('--rx', `${(-py * 8).toFixed(2)}deg`);
    });
    fig.addEventListener('pointerleave', () => {
      portrait.style.setProperty('--ry', '0deg');
      portrait.style.setProperty('--rx', '0deg');
    });
  }

  /* ---------------- Copy to clipboard ---------------- */
  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast(`Copied ${text}`);
    } catch (e) {
      toast(`Discord username: ${text}`);
    }
  }
  $$('[data-copy]').forEach((el) => el.addEventListener('click', () => copyText(el.dataset.copy)));

  /* ---------------- Print / save resume as PDF ---------------- */
  $$('[data-print]').forEach((el) => el.addEventListener('click', () => window.print()));

  /* ---------------- Footer year ---------------- */
  $$('[data-year]').forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------------- Quick nav (⌘K / Ctrl+K) ---------------- */
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  $$('[data-mod-key]').forEach((k) => (k.textContent = isMac ? '⌘ K' : 'Ctrl K'));

  const dlg = $('#cmdk');
  if (dlg) {
    const input = $('#cmdkInput');
    const list = $('#cmdkList');
    const empty = $('#cmdkEmpty');
    const icon = (id) => `<svg aria-hidden="true"><use href="#${id}"/></svg>`;
    const go = (hash) => () => {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#' + hash);
    };
    const open = (url) => () => window.open(url, '_blank', 'noopener');

    const commands = [
      { group: 'Go to', label: 'Projects', icon: 'i-hash', run: go('projects') },
      { group: 'Go to', label: 'About', icon: 'i-hash', run: go('about') },
      { group: 'Go to', label: 'Contact form', keys: 'email message hire', icon: 'i-hash', run: go('contact') },
      { group: 'Go to', label: 'Resume', keys: 'cv pdf download', icon: 'i-sheet', run: () => (location.href = './resume.html') },
      ...cards.map((c) => ({
        group: 'Projects', label: c.dataset.title, keys: c.dataset.tags, icon: 'i-box',
        run: () => {
          if (c.classList.contains('is-hidden')) applyFilter('all');
          c.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
          c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash');
        },
      })),
      { group: 'Links', label: 'GitHub profile', icon: 'i-github', run: open('https://github.com/potat4190') },
      { group: 'Links', label: 'LinkedIn', icon: 'i-linkedin', run: open('https://www.linkedin.com/in/rhidaya-shrestha/') },
      { group: 'Links', label: 'Copy Discord username', keys: 'potat.4190', icon: 'i-discord', run: () => copyText('potat.4190') },
      { group: 'Settings', label: 'Switch light / dark theme', keys: 'dark mode', icon: 'i-moon', run: () => toggleTheme() },
    ];

    let shown = [];
    let selected = 0;

    function render(q = '') {
      const term = q.trim().toLowerCase();
      shown = commands.filter((c) => !term || (c.label + ' ' + (c.keys || '') + ' ' + c.group).toLowerCase().includes(term));
      selected = Math.min(selected, Math.max(shown.length - 1, 0));
      let html = '', lastGroup = '';
      shown.forEach((c, i) => {
        if (c.group !== lastGroup) { html += `<div class="cmdk-group" role="presentation">${c.group}</div>`; lastGroup = c.group; }
        html += `<button type="button" class="cmdk-item" role="option" id="cmdk-${i}" data-i="${i}" aria-selected="${i === selected}">${icon(c.icon)}<span>${c.label}</span></button>`;
      });
      list.innerHTML = html;
      empty.classList.toggle('hidden', shown.length > 0);
      input.setAttribute('aria-activedescendant', shown.length ? `cmdk-${selected}` : '');
    }
    function select(i) {
      if (!shown.length) return;
      selected = (i + shown.length) % shown.length;
      $$('.cmdk-item', list).forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.i === selected)));
      const el = $(`#cmdk-${selected}`, list);
      if (el) el.scrollIntoView({ block: 'nearest' });
      input.setAttribute('aria-activedescendant', `cmdk-${selected}`);
    }
    function run(i) {
      const cmd = shown[i];
      if (!cmd) return;
      dlg.close();
      setTimeout(cmd.run, 60);
    }
    function openPalette() {
      if (dlg.open) return;
      selected = 0;
      input.value = '';
      render();
      dlg.showModal();
      input.focus();
    }

    $$('[data-cmdk-open]').forEach((b) => b.addEventListener('click', openPalette));
    input.addEventListener('input', () => { selected = 0; render(input.value); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); select(selected + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); select(selected - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); run(selected); }
    });
    list.addEventListener('click', (e) => { const b = e.target.closest('.cmdk-item'); if (b) run(+b.dataset.i); });
    list.addEventListener('pointermove', (e) => { const b = e.target.closest('.cmdk-item'); if (b && +b.dataset.i !== selected) select(+b.dataset.i); });
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); // backdrop click

    document.addEventListener('keydown', (e) => {
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable;
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) { e.preventDefault(); dlg.open ? dlg.close() : openPalette(); }
      else if (e.key === '/' && !typing && !dlg.open) { e.preventDefault(); openPalette(); }
    });
  }

  /* ---------------- Contact form (Formspree) ---------------- */
  const form = $('#contactForm');
  if (form) {
    const status = $('#formStatus');
    const btn = $('#sendBtn');
    const fields = {
      name: { el: $('#f-name'), err: $('#e-name'), check: (v) => (v.trim() ? '' : 'Add your name so I know who to reply to.') },
      email: { el: $('#f-email'), err: $('#e-email'), check: (v) => (/^\S+@\S+\.\S+$/.test(v.trim()) ? '' : 'Enter an email address like name@example.com.') },
      message: { el: $('#f-message'), err: $('#e-message'), check: (v) => (v.trim().length >= 10 ? '' : 'Write at least a sentence (10+ characters).') },
    };
    let attempted = false;

    const validate = (key) => {
      const f = fields[key];
      const msg = f.check(f.el.value);
      f.err.textContent = msg;
      f.el.setAttribute('aria-invalid', String(!!msg));
      return !msg;
    };
    Object.keys(fields).forEach((k) => fields[k].el.addEventListener('input', () => attempted && validate(k)));

    function showStatus(kind, text) {
      status.classList.remove('show');
      void status.offsetWidth;
      status.className = 'form-status show mt-5 items-start gap-3 rounded-lg border p-4 text-sm ' +
        (kind === 'ok' ? 'border-border bg-muted text-foreground' : 'border-primary/30 bg-primary/5 text-accent');
      $('use', status).setAttribute('href', kind === 'ok' ? '#i-check' : '#i-alert');
      $('p', status).textContent = text;
    }
    function busy(on) {
      btn.disabled = on;
      $('.btn-label', btn).classList.toggle('hidden', on);
      $('.btn-busy', btn).classList.toggle('hidden', !on);
      $('.btn-busy', btn).classList.toggle('inline-flex', on);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      attempted = true;
      const bad = Object.keys(fields).filter((k) => !validate(k));
      if (bad.length) { fields[bad[0]].el.focus(); return; }

      if (form.action.includes('YOUR_FORM_ID')) {
        showStatus('error', "This form isn't connected yet. Reach me on LinkedIn for now.");
        return;
      }

      busy(true);
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (res.ok) {
          const email = fields.email.el.value.trim();
          form.reset();
          attempted = false;
          showStatus('ok', `Message sent. I'll reply to ${email}.`);
        } else {
          const data = await res.json().catch(() => ({}));
          const detail = data && data.errors ? data.errors.map((x) => x.message).join(' ') : `The form service returned ${res.status}.`;
          showStatus('error', `That didn't go through. ${detail} Try again, or message me on LinkedIn.`);
        }
      } catch (err) {
        showStatus('error', "Couldn't reach the form service. Check your connection and try again.");
      } finally {
        busy(false);
      }
    });
  }
})();
