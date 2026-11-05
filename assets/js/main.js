/* =========================================================
   Kuuruprasath Nelamurthi — Portfolio interactions
   GSAP + ScrollTrigger + Lenis. Everything degrades gracefully:
   no JS → all content visible; reduced motion → no animation.
   ========================================================= */
(() => {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const hasGSAP = !!(window.gsap && window.ScrollTrigger);
  const animate = hasGSAP && !reduceMotion;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);
  if (animate) root.classList.add("anim");

  /* ---------- Year ---------- */
  $$(".js-year").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Text splitting ---------- */
  function splitChars(el) {
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(" ")); return; }
            const word = document.createElement("span");
            word.className = "word";
            for (const ch of part) {
              const c = document.createElement("span");
              c.className = "char";
              c.textContent = ch;
              word.appendChild(c);
            }
            frag.appendChild(word);
          });
          child.replaceWith(frag);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    const heading = el.closest("h1, h2, h3") || el;
    if (!heading.hasAttribute("aria-label")) heading.setAttribute("aria-label", heading.textContent.replace(/\s+/g, " ").trim());
    walk(el);
    $$(".word", el).forEach((w) => w.setAttribute("aria-hidden", "true"));
    return $$(".char", el);
  }

  function splitWords(el) {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    words.forEach((w, i) => {
      const s = document.createElement("span");
      s.className = "word";
      s.textContent = w;
      el.appendChild(s);
      if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
    });
    return $$(".word", el);
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (animate && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.2 });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }

  function scrollToTarget(target, immediate = false) {
    const el = typeof target === "string" ? (target === "#top" ? 0 : $(target)) : target;
    if (el === null) return;
    if (lenis) {
      lenis.scrollTo(el, { offset: 0, duration: immediate ? 0 : 1.4, immediate, force: true });
    } else {
      const y = el === 0 ? 0 : el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior: immediate || reduceMotion ? "auto" : "smooth" });
    }
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href");
    if (id === "#" || (id !== "#top" && !$(id))) return;
    e.preventDefault();
    const go = () => scrollToTarget(id);
    if (body.classList.contains("menu-open")) { closeMenu(); setTimeout(go, 350); } else go();
    if (id !== "#top") history.replaceState(null, "", id);
    else history.replaceState(null, "", location.pathname);
  });

  /* ---------- Header: hide on scroll down, progress bar, active link ---------- */
  const header = $(".header");
  const progress = $(".progress span");
  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;
    if (progress) progress.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    header.classList.toggle("is-scrolled", y > 40);
    if (!body.classList.contains("menu-open")) {
      header.classList.toggle("is-hidden", y > lastY && y > window.innerHeight * 0.6);
    }
    lastY = y;
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = $$(".nav__list a");
  const sectionIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      navLinks.forEach((l) => l.classList.toggle("is-current", l.getAttribute("href") === "#" + en.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach((l) => { const s = $(l.getAttribute("href")); if (s) sectionIO.observe(s); });

  /* ---------- Mobile menu ---------- */
  const menuBtn = $(".menu-toggle");
  const menu = $("#mobile-menu");
  function openMenu() {
    menu.hidden = false;
    requestAnimationFrame(() => menu.classList.add("is-open"));
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close menu");
    body.classList.add("menu-open");
    header.classList.remove("is-hidden");
    lenis && lenis.stop();
    if (animate) gsap.fromTo($$("#mobile-menu ol a"), { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: 0.05, duration: 0.7, ease: "power3.out", delay: 0.15 });
  }
  function closeMenu() {
    menu.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
    body.classList.remove("menu-open");
    lenis && lenis.start();
    setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 700);
  }
  menuBtn.addEventListener("click", () => (menuBtn.getAttribute("aria-expanded") === "true" ? closeMenu() : openMenu()));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && body.classList.contains("menu-open")) closeMenu(); });
  window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => { if (e.matches && body.classList.contains("menu-open")) closeMenu(); });

  /* ---------- Tools marquee: auto-slides, reacts to scrolling, slows on hover ---------- */
  // One requestAnimationFrame loop moves both rows (no CSS animation), so hovering,
  // scrolling and resizing can never leave a row stuck. Items are repeated so half the
  // track is always wider than the screen (even on 4K), which makes the loop seamless.
  const marquee = $(".marquee");
  if (marquee && !reduceMotion) {
    const PX_PER_SEC = 55;
    const rows = $$(".marquee__track", marquee).map((t) => ({
      t, html: t.innerHTML, dir: t.classList.contains("marquee__track--reverse") ? 1 : -1, x: 0, half: 0,
    }));
    const build = () => {
      rows.forEach((r) => {
        r.t.style.transform = "";
        r.t.innerHTML = r.html;
        const n = r.t.children.length;
        const setWidth = r.t.scrollWidth || 1;
        const copies = Math.max(1, Math.ceil((window.innerWidth * 1.15) / setWidth));
        const halfHTML = r.html.repeat(copies);
        r.t.innerHTML = halfHTML + halfHTML;
        // Exact loop length = where the second half starts
        const kids = r.t.children;
        r.half = kids[n * copies].offsetLeft - kids[0].offsetLeft || r.t.scrollWidth / 2;
        r.x = r.dir < 0 ? 0 : -r.half;
      });
    };
    build();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);
    let lastW = window.innerWidth, rt;
    window.addEventListener("resize", () => {
      clearTimeout(rt);
      rt = setTimeout(() => { if (Math.abs(window.innerWidth - lastW) > 40) { lastW = window.innerWidth; build(); } }, 250);
    });

    // Scroll speed boost (scrolling up reverses direction), easing back to normal
    let rate = 1, target = 1;
    const kick = (velocity) => {
      const v = Math.max(-6, Math.min(6, velocity * 0.12));
      target = (velocity < -0.5 ? -1 : 1) * (1 + Math.abs(v));
    };
    if (lenis) lenis.on("scroll", ({ velocity }) => kick(velocity));
    else {
      let lastY = window.scrollY;
      window.addEventListener("scroll", () => { kick((window.scrollY - lastY) * 0.5); lastY = window.scrollY; }, { passive: true });
    }

    // Hover slows the rows right down (never fully stops), and the hover state is
    // re-checked on every scroll, because scrolling can move the band out from under
    // a mouse that hasn't moved.
    let hover = 0, hoverTarget = 0, px = -1, py = -1;
    const checkHover = () => {
      const r = marquee.getBoundingClientRect();
      hoverTarget = px >= r.left && px <= r.right && py >= r.top && py <= r.bottom ? 1 : 0;
    };
    window.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse") { px = e.clientX; py = e.clientY; checkHover(); } }, { passive: true });
    document.addEventListener("pointerleave", () => { px = py = -1; hoverTarget = 0; });
    window.addEventListener("scroll", checkHover, { passive: true });

    let raf = 0, last = 0, visible = true;
    const tick = (now) => {
      const dt = last ? Math.min(0.064, (now - last) / 1000) : 0;
      last = now;
      const k = Math.min(1, dt * 60); // frame-rate independent easing
      target += ((target < 0 ? -1 : 1) - target) * 0.05 * k;
      rate += (target - rate) * 0.12 * k;
      hover += (hoverTarget - hover) * 0.12 * k;
      const speed = PX_PER_SEC * rate * (1 - 0.85 * hover);
      rows.forEach((r) => {
        if (!r.half) return;
        r.x += r.dir * speed * dt;
        if (r.x <= -r.half) r.x += r.half;
        else if (r.x > 0) r.x -= r.half;
        r.t.style.transform = `translate3d(${r.x.toFixed(2)}px,0,0)`;
      });
      raf = visible && !document.hidden ? requestAnimationFrame(tick) : 0;
    };
    const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } };
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }).observe(marquee);
    document.addEventListener("visibilitychange", () => { if (!document.hidden && visible) start(); });
    start();
  }

  /* ---------- Hero dot-grid canvas ---------- */
  function heroCanvas() {
    const canvas = $(".hero__canvas");
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext("2d");
    const hero = $(".hero");
    let w = 0, h = 0, dpr = 1, dots = [], spacing = 32, raf = 0, running = false, t = 0;
    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, last: 0 };

    function resize() {
      const rect = hero.getBoundingClientRect();
      w = rect.width; h = rect.height;
      // Cap backing-store size so 4K screens stay smooth
      dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4.5e6 / Math.max(1, w * h)));
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const rem = parseFloat(getComputedStyle(root).fontSize) || 16;
      spacing = Math.max(22, rem * (w < 600 ? 1.6 : 2));
      dots = [];
      const cols = Math.ceil(w / spacing) + 1, rows = Math.ceil(h / spacing) + 1;
      const ox = (w - (cols - 1) * spacing) / 2, oy = (h - (rows - 1) * spacing) / 2;
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) dots.push({ x: ox + i * spacing, y: oy + j * spacing });
      if (!running) draw();
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      const idle = performance.now() - mouse.last > 2500;
      if (idle && !reduceMotion) {
        // Gentle autonomous "probe" so touch devices still see motion
        mouse.tx = w * (0.62 + 0.25 * Math.sin(t * 0.00035));
        mouse.ty = h * (0.38 + 0.22 * Math.sin(t * 0.0005 + 1.3));
      }
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      const R = Math.max(140, Math.min(w, h) * 0.28);
      const base = spacing * 0.045 + 0.6;
      // Neutral dots are batched into a few alpha buckets (one fill each) for speed
      const BUCKETS = 4;
      const paths = [];
      for (let b = 0; b < BUCKETS; b++) paths.push(new Path2D());
      const hot = [];
      for (let k = 0; k < dots.length; k++) {
        const d = dots[k];
        const dx = d.x - mouse.x, dy = d.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const f = dist < R ? 1 - dist / R : 0;
        const ease = f * f;
        const wave = reduceMotion ? 0 : Math.sin(d.x * 0.012 + d.y * 0.008 + t * 0.0012) * 0.5 + 0.5;
        if (ease > 0.02) {
          const push = ease * spacing * 0.55;
          const nd = dist || 1;
          hot.push([d.x + (dx / nd) * push, d.y + (dy / nd) * push, base + ease * spacing * 0.11 + wave * 0.35, ease]);
        } else {
          const b = Math.min(BUCKETS - 1, (wave * BUCKETS) | 0);
          const r = base + (b / BUCKETS) * 0.35;
          paths[b].moveTo(d.x + r, d.y);
          paths[b].arc(d.x, d.y, r, 0, Math.PI * 2);
        }
      }
      for (let b = 0; b < BUCKETS; b++) {
        ctx.fillStyle = `rgba(17,17,19,${0.09 + (b / (BUCKETS - 1)) * 0.07})`;
        ctx.fill(paths[b]);
      }
      for (let k = 0; k < hot.length; k++) {
        const [x, y, r, e] = hot[k];
        ctx.fillStyle = `rgba(215,30,36,${0.15 + e * 0.75})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(now) {
      t = now;
      draw();
      raf = requestAnimationFrame(loop);
    }
    function start() { if (running || reduceMotion) return; running = true; raf = requestAnimationFrame(loop); }
    function stop() { running = false; cancelAnimationFrame(raf); }

    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      mouse.tx = e.clientX - r.left; mouse.ty = e.clientY - r.top; mouse.last = performance.now();
    }, { passive: true });
    hero.addEventListener("pointerleave", () => { mouse.last = 0; });

    const io = new IntersectionObserver(([en]) => (en.isIntersecting ? start() : stop()));
    window.addEventListener("kn:ready", () => io.observe(hero), { once: true });
    document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
    resize();
  }
  heroCanvas();

  /* ---------- Custom cursor & magnetic buttons ---------- */
  if (finePointer && hasGSAP && !reduceMotion) {
    body.classList.add("has-cursor");
    const cursor = $(".cursor");
    const label = $(".cursor__label");
    const xTo = gsap.quickTo(cursor, "x", { duration: 0.45, ease: "power3" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("pointermove", (e) => { xTo(e.clientX); yTo(e.clientY); cursor.classList.remove("is-hidden"); }, { passive: true });
    document.addEventListener("pointerleave", () => cursor.classList.add("is-hidden"));
    document.addEventListener("pointerover", (e) => {
      const target = e.target.closest("[data-cursor]");
      const link = e.target.closest("a, button, input, textarea, label");
      if (target) {
        label.textContent = target.dataset.cursor;
        cursor.classList.add("is-active"); cursor.classList.remove("is-link");
      } else {
        cursor.classList.remove("is-active");
        cursor.classList.toggle("is-link", !!link);
      }
    });

    $$(".magnetic").forEach((el) => {
      const mx = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3" });
      const my = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3" });
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        mx((e.clientX - r.left - r.width / 2) * 0.3);
        my((e.clientY - r.top - r.height / 2) * 0.4);
      });
      el.addEventListener("pointerleave", () => { mx(0); my(0); });
    });
  }

  /* ---------- Case-study dialogs ---------- */
  let lastTrigger = null;
  function openCase(id) {
    const dlg = $("#case-" + id);
    if (!dlg || dlg.open) return;
    lastTrigger = document.activeElement;
    $(".case__inner", dlg).setAttribute("data-lenis-prevent", "");
    $(".case__inner", dlg).scrollTop = 0;
    dlg.showModal();
    lenis && lenis.stop();
    root.style.overflow = "hidden";
  }
  function closeCase(dlg) {
    if (!dlg.open || dlg.classList.contains("is-closing")) return;
    dlg.classList.add("is-closing");
    const done = () => {
      dlg.classList.remove("is-closing");
      dlg.close();
      root.style.overflow = "";
      lenis && lenis.start();
      lastTrigger && lastTrigger.focus({ preventScroll: true });
    };
    let finished = false;
    const once = () => { if (!finished) { finished = true; done(); } };
    $(".case__inner", dlg).addEventListener("animationend", once, { once: true });
    setTimeout(once, 600);
  }
  $$("[data-open]").forEach((btn) => btn.addEventListener("click", () => openCase(btn.dataset.open)));
  $$(".case").forEach((dlg) => {
    $(".case__close", dlg).addEventListener("click", () => closeCase(dlg));
    dlg.addEventListener("cancel", (e) => { e.preventDefault(); closeCase(dlg); });
    dlg.addEventListener("click", (e) => { if (e.target === dlg) closeCase(dlg); });
  });

  /* ---------- Contact form (Formspree) ---------- */
  const form = $(".form");
  if (form) {
    const status = $(".form__status", form);
    const btn = $("button[type=submit]", form);
    const btnLabel = $(".btn__label", btn);
    const emailOK = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
    const setStatus = (msg, type) => { status.textContent = msg; status.className = "form__status" + (type ? " is-" + type : ""); };

    $$("input, textarea", form).forEach((f) => f.addEventListener("input", () => f.closest(".field") && f.closest(".field").classList.remove("is-invalid")));

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      let firstBad = null;
      $$("[required]", form).forEach((f) => {
        const bad = !f.value.trim() || (f.type === "email" && !emailOK(f.value.trim()));
        f.closest(".field").classList.toggle("is-invalid", bad);
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        setStatus(firstBad.type === "email" && firstBad.value ? "Please enter a valid email address." : "Please fill in your name, email and message.", "error");
        firstBad.focus();
        return;
      }
      btn.disabled = true; btnLabel.textContent = "Sending…"; setStatus("");
      try {
        const res = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        if (res.ok) {
          form.reset();
          setStatus("Thanks! Your message has been sent. I'll get back to you soon.", "success");
        } else {
          const data = await res.json().catch(() => ({}));
          const msg = data && data.errors ? data.errors.map((x) => x.message).join(", ") : "";
          setStatus((msg ? msg + ". " : "Something went wrong. ") + "You can also email kuuruprasath@gmail.com directly.", "error");
        }
      } catch (err) {
        setStatus("Couldn't send right now. Please email kuuruprasath@gmail.com directly.", "error");
      } finally {
        btn.disabled = false; btnLabel.textContent = "Send message";
      }
    });
  }

  /* ---------- Counters ---------- */
  // Counts 0 → target with an ease-out curve. Uses requestAnimationFrame only,
  // so it works even if the animation libraries fail to load.
  function runCounter(el, delay = 0) {
    const to = parseFloat(el.dataset.to);
    const dec = parseInt(el.dataset.decimals || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 2200;
    const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
    let t0 = null;
    const step = (now) => {
      if (t0 === null) t0 = now + delay;
      const p = Math.max(0, Math.min(1, (now - t0) / duration));
      el.textContent = (to * easeOutExpo(p)).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.closest(".stat") && el.closest(".stat").classList.add("is-counted");
    };
    requestAnimationFrame(step);
  }
  function setupCounters() {
    const counters = $$(".js-counter");
    if (reduceMotion || !counters.length || !("IntersectionObserver" in window)) return;
    counters.forEach((el) => (el.textContent = (0).toFixed(parseInt(el.dataset.decimals || "0", 10)) + (el.dataset.suffix || "")));
    const io = new IntersectionObserver((entries) => {
      if (!entries.some((en) => en.isIntersecting)) return;
      io.disconnect();
      // Count all four together, slightly staggered, once the row is on screen
      counters.forEach((el, i) => runCounter(el, 250 + i * 150));
    }, { threshold: 0.4 });
    io.observe($(".stats") || counters[0]);
  }

  /* ---------- Reveal helpers (IntersectionObserver + CSS transitions: cheap on phones) ---------- */
  const onEnter = (els, cb, rootMargin = "0px 0px -8% 0px") => {
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      const entering = entries.filter((en) => en.isIntersecting).map((en) => en.target);
      if (!entering.length) return;
      entering.forEach((el) => io.unobserve(el));
      cb(entering);
    }, { rootMargin });
    els.forEach((el) => io.observe(el));
  };
  // Adds .is-in (with a small stagger), then strips the reveal classes once done so
  // the element's normal hover transitions take over again.
  const REVEAL_CLASSES = ["reveal-up", "reveal-card", "reveal-row", "reveal-chars", "reveal-chips", "reveal-lines", "is-in"];
  const reveal = (els) => onEnter(els, (entering) => {
    entering.forEach((el, i) => {
      el.style.setProperty("--d", i * 0.1 + "s");
      el.classList.add("is-in");
      if (el.classList.contains("client__media") || el.classList.contains("project")) return;
      setTimeout(() => { el.classList.remove(...REVEAL_CLASSES); el.style.removeProperty("--d"); }, 2600 + i * 100);
    });
  });

  /* ---------- Scroll animations ---------- */
  function setupScrollAnimations() {
    if (!animate) return;

    // Projects: pinned horizontal scroll on large screens (created first so later triggers account for the pin)
    const mm = gsap.matchMedia();
    mm.add("(min-width: 1024px) and (min-height: 620px)", () => {
      const section = $(".projects");
      const pin = $(".projects__pin");
      const trackEl = $(".projects__track");
      section.classList.add("is-horizontal");
      const dist = () => Math.max(0, trackEl.scrollWidth + trackEl.offsetLeft - root.clientWidth);
      const tween = gsap.to(trackEl, {
        x: () => -dist(), ease: "none",
        scrollTrigger: { trigger: pin, start: "top top", end: () => "+=" + dist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      $$(".project", trackEl).forEach((card) => {
        gsap.fromTo(card, { opacity: 0.35, scale: 0.92 }, {
          opacity: 1, scale: 1, ease: "none",
          scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 100%", end: "left 55%", scrub: true },
        });
      });
      return () => section.classList.remove("is-horizontal");
    });
    mm.add("(max-width: 1023px), (max-height: 619px)", () => {
      const projectCards = $$(".project");
      projectCards.forEach((c) => c.classList.add("reveal-up"));
      reveal(projectCards);
      return () => projectCards.forEach((c) => c.classList.remove("reveal-up", "is-in"));
    });

    // Hero parallax on scroll
    gsap.to(".hero__inner", {
      yPercent: -12, opacity: 0.25, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });

    // Section titles: characters rise in (CSS transitions, staggered per character)
    const titles = $$(".section__title");
    titles.forEach((title) => {
      const chars = splitChars($(".split", title));
      chars.forEach((c, i) => c.style.setProperty("--i", i));
      title.classList.add("reveal-chars");
    });
    reveal(titles);

    // Generic reveals (staggered when several enter together)
    reveal($$(".section .reveal-up"));
    reveal($$(".reveal-card"));
    reveal($$(".reveal-row"));
    reveal($$(".client__media"));

    // Skill chips pop in
    const chipLists = $$(".chips");
    chipLists.forEach((list) => {
      Array.from(list.children).forEach((li, i) => li.style.setProperty("--i", i));
      list.classList.add("reveal-chips");
    });
    reveal(chipLists);

    // About statement: words light up as you scroll
    $$(".scrub-text").forEach((el) => {
      const words = splitWords(el);
      gsap.fromTo(words, { opacity: 0.2 }, {
        opacity: 1, stagger: 0.08, ease: "none",
        scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 50%", scrub: true },
      });
    });

    // Timeline line draws as you scroll
    gsap.to(".timeline__line span", {
      scaleY: 1, ease: "none",
      scrollTrigger: { trigger: ".timeline", start: "top 70%", end: "bottom 70%", scrub: true },
    });

    // Timeline dots light up when the red line reaches them (the line's tip sits at 70% of the
    // screen height); the most recently reached dot keeps pulsing to show where you are.
    const jobs = $$(".timeline .job");
    const markCurrent = () => {
      const active = jobs.filter((j) => j.classList.contains("is-active"));
      jobs.forEach((j) => j.classList.toggle("is-current", j === active[active.length - 1]));
    };
    jobs.forEach((job) => {
      ScrollTrigger.create({
        // offsetTop ignores the reveal transform, so the dot lights exactly when the line reaches it
        trigger: ".timeline", start: () => `top+=${job.offsetTop + 8} 70%`,
        onEnter: () => { job.classList.add("is-active"); markCurrent(); },
        onLeaveBack: () => { job.classList.remove("is-active"); markCurrent(); },
      });
    });

    // Marquee tilt follows scroll
    gsap.fromTo(".marquee", { rotate: -3 }, { rotate: 0, ease: "none", scrollTrigger: { trigger: ".marquee", start: "top bottom", end: "bottom top", scrub: true } });

    // Footer headline
    const footBig = $(".footer__big");
    $$(".footer__big-line", footBig).forEach((line, i) => {
      const inner = document.createElement("span");
      inner.style.setProperty("--i", i);
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
    });
    footBig.classList.add("reveal-lines");
    reveal([footBig]);
  }

  /* ---------- Hero intro ---------- */
  function prepareHero() {
    if (!animate) return;
    const title = $(".hero__title");
    let n = 0;
    $$(".split", title).forEach((el) => splitChars(el).forEach((c) => c.style.setProperty("--i", n++)));
    title.classList.add("reveal-chars", "reveal-chars--hero");
    $$(".hero .reveal-up").forEach((el, i) => el.style.setProperty("--d", 0.55 + i * 0.1 + "s"));
  }
  function playHero() {
    if (!animate) return;
    $(".hero__title").classList.add("is-in");
    $$(".hero .reveal-up").forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Loader ---------- */
  function runLoader(done) {
    const loader = $(".loader");
    const finish = () => {
      body.classList.remove("is-loading");
      loader && loader.remove();
      lenis && lenis.start();
      window.dispatchEvent(new Event("kn:ready"));
    };
    if (!loader || !animate) { finish(); done(); return; }
    const seen = sessionStorage.getItem("kn-seen") === "1";
    sessionStorage.setItem("kn-seen", "1");
    const count = $(".js-count", loader);
    const obj = { v: 0 };
    const dur = seen ? 0.4 : 1;
    gsap.timeline()
      .to(obj, { v: 100, duration: dur, ease: "power2.inOut", onUpdate: () => (count.textContent = Math.round(obj.v)) })
      .to(".loader__bar span", { scaleX: 1, duration: dur, ease: "power2.inOut" }, 0)
      .to(loader, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, "+=0.1")
      .add(done, "-=0.5")
      .add(finish);
  }

  /* ---------- Boot ---------- */
  prepareHero();
  setupScrollAnimations();
  setupCounters();

  const start = () => runLoader(() => {
    playHero();
    if (location.hash && location.hash.length > 1 && $(location.hash)) {
      setTimeout(() => scrollToTarget(location.hash, true), 50);
    }
  });
  start();

  if (hasGSAP) {
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
  }
})();
