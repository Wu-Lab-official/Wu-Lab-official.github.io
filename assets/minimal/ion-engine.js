/* Wu-Lab 背景引擎 v2
   一个固定 canvas，五种模式共用同一批粒子：
   ion / chase / rod / spiral / photo
   页面只提供 data-mode；状态通过 sessionStorage 跨页面续接。 */

(function () {
  "use strict";

  var canvas = document.getElementById("bg-canvas");
  var bg = document.getElementById("bg");
  if (!canvas || !bg) return;

  var ctx = canvas.getContext("2d");
  var root = document.documentElement;

  var TAU = Math.PI * 2;
  var STORE_KEY = "wulab-bg-v3";
  var PAUSE_KEY = "wulab-bg-paused-v3";
  var MAX_SOURCES = 3;

  var LIGHT = {
    colors: [[102, 8, 116], [90, 104, 138], [154, 141, 128]],
    line: [102, 8, 116],
    light: [255, 246, 224]
  };

  var DARK = {
    colors: [[216, 190, 255], [150, 210, 255], [255, 236, 200]],
    line: [186, 204, 255],
    light: [255, 244, 214]
  };

  var MODES = { ion: 1, chase: 1, rod: 1, spiral: 1, photo: 1 };

  /* 螺旋微粒的“物种”：只做细长型，振幅统一压到 ≈2.5px，长度靠圈数体现。
     长径比 8.4–12.4 : 1；螺距固定，长粒子圈数自然更多。 */
  var SPIRAL_SPECIES = [
    { len: 42, aspect: 8.4, weight: 0.48 },
    { len: 52, aspect: 10.4, weight: 0.34 },
    { len: 62, aspect: 12.4, weight: 0.18 }
  ];
  var SPIRAL_PITCH = 15;

  function pickSpiralSpecies() {
    var r = Math.random();
    var acc = 0;
    for (var i = 0; i < SPIRAL_SPECIES.length; i++) {
      acc += SPIRAL_SPECIES[i].weight;
      if (r <= acc) return SPIRAL_SPECIES[i];
    }
    return SPIRAL_SPECIES[SPIRAL_SPECIES.length - 1];
  }

  function isDarkRoot() {
    return root.getAttribute("data-theme") === "dark" || root.classList.contains("theme-dark");
  }

  var mode = bg.getAttribute("data-mode") || "ion";
  if (!MODES[mode]) mode = "ion";

  var theme = isDarkRoot() ? "dark" : "light";
  if (mode === "photo") {
    theme = "dark";
    root.setAttribute("data-theme", "dark");
    root.classList.add("theme-dark");
  }
  var pageDark = theme === "dark";
  var darkGuardBusy = false;

  var DARK_VARS = {
    "--paper": "#0d0f13",
    "--ink": "#f2efe8",
    "--muted": "#a9a49a",
    "--rule": "#2a2d34",
    "--accent": "#d8b6e8",
    "--accent-soft": "#2a1f31",
    "--lede": "#d6d1c8",
    "--bg-a": "rgba(76,66,104,.30)",
    "--bg-b": "rgba(28,42,66,.30)",
    "--bg-fade-a": "rgba(13,15,19,.48)",
    "--bg-fade-b": "rgba(13,15,19,.52)",
    "--bg-vignette": "rgba(13,15,19,.36)"
  };

  function applyDarkHardening() {
    if (!pageDark) return;
    root.classList.add("theme-dark");
    root.setAttribute("data-theme", "dark");
    for (var key in DARK_VARS) {
      if (Object.prototype.hasOwnProperty.call(DARK_VARS, key)) {
        root.style.setProperty(key, DARK_VARS[key]);
      }
    }
    root.style.setProperty("background", "#0d0f13", "important");
    root.style.setProperty("color", "#f2efe8", "important");
    root.style.setProperty("color-scheme", "dark");
    if (document.body) {
      document.body.style.setProperty("background", "transparent", "important");
      document.body.style.setProperty("color", "var(--ink)", "important");
    }
  }

  var state = {
    mode: mode,
    theme: theme,
    w: 0,
    h: 0,
    dpr: 1,
    t: 0,
    running: false,
    paused: false,
    reduced: false,
    last: 0,
    raf: 0,
    spawnTimer: 3,
    drawn: false,
    lastSave: 0
  };

  var parts = [];
  var sources = [];
  var baits = [];
  var palette = LIGHT;
  var glowSprites = [];
  var lightSprite = null;
  var gaussSpare = null;

  function spiralSpawnPosition() {
    var vw = state.w || window.innerWidth || 1;
    var vh = state.h || window.innerHeight || 1;
    var minDist = Math.min(vw, vh) * 0.08;
    var bestX = Math.random() * vw;
    var bestY = Math.random() * vh;
    var bestD = -1;

    for (var attempt = 0; attempt < 30; attempt++) {
      var x = Math.random() * vw;
      var y = Math.random() * vh;
      var min = Infinity;
      for (var i = 0; i < parts.length; i++) {
        var dx = x - parts[i].x;
        var dy = y - parts[i].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < min) min = d;
      }
      if (min === Infinity || min > minDist) return { x: x, y: y };
      if (min > bestD) {
        bestD = min;
        bestX = x;
        bestY = y;
      }
    }
    return { x: bestX, y: bestY };
  }

  var pointer = {
    x: 0,
    y: 0,
    sx: 0,
    sy: 0,
    vx: 0,
    vy: 0,
    active: false,
    allowed: true,
    down: false,
    downX: 0,
    downY: 0,
    lastMove: 0,
    idle: 99,
    strength: 0,
    type: "mouse"
  };

  /* ---------------- 基础工具 ---------------- */

  function rand(a, b) {
    return a + Math.random() * (b - a);
  }

  function clamp(v, a, b) {
    return v < a ? a : v > b ? b : v;
  }

  function gauss() {
    if (gaussSpare !== null) {
      var s = gaussSpare;
      gaussSpare = null;
      return s;
    }
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    var mag = Math.sqrt(-2 * Math.log(u));
    gaussSpare = mag * Math.sin(TAU * v);
    return mag * Math.cos(TAU * v);
  }

  function lerpAngle(a, b, t) {
    var d = ((b - a + Math.PI) % TAU + TAU) % TAU - Math.PI;
    return a + d * t;
  }

  function rgba(c, a) {
    return "rgba(" + c[0] + "," + c[1] + "," + c[2] + "," + a + ")";
  }

  function pickColor() {
    var r = Math.random();
    if (r < 0.56) return 0;
    if (r < 0.86) return 1;
    return 2;
  }

  function wrap(p, m) {
    if (p.x < -m) p.x = state.w + m;
    else if (p.x > state.w + m) p.x = -m;
    if (p.y < -m) p.y = state.h + m;
    else if (p.y > state.h + m) p.y = -m;
  }

  function noiseStep(p, dt, sigma, tau) {
    var k = Math.exp(-dt / tau);
    p.noiseX = p.noiseX * k + sigma * Math.sqrt(dt) * gauss();
    p.noiseY = p.noiseY * k + sigma * Math.sqrt(dt) * gauss();
  }

  /* ---------------- 光晕精灵 ---------------- */

  function makeGlow(c) {
    var s = document.createElement("canvas");
    s.width = s.height = 64;
    var g = s.getContext("2d");
    var grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, rgba(c, 0.9));
    grad.addColorStop(0.22, rgba(c, 0.5));
    grad.addColorStop(0.55, rgba(c, 0.14));
    grad.addColorStop(1, rgba(c, 0));
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    return s;
  }

  function buildSprites() {
    palette = state.theme === "dark" ? DARK : LIGHT;
    glowSprites = palette.colors.map(makeGlow);
    lightSprite = makeGlow(palette.light);
  }

  function drawSprite(sprite, x, y, size, alpha) {
    if (!sprite || alpha <= 0) return;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
    ctx.globalAlpha = 1;
  }

  function drawDot(x, y, r, c, alpha) {
    if (alpha <= 0 || r <= 0) return;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, TAU);
    ctx.fillStyle = rgba(c, Math.min(1, alpha));
    ctx.fill();
  }

  /* ---------------- 粒子创建 / 模式准备 ---------------- */

  function targetCount() {
    var factor = mode === "chase" ? 1.05 : mode === "rod" ? 0.70 : mode === "spiral" ? 0.50 : 1;
    var n = Math.round((state.w * state.h / 16000) * factor);
    var max = state.w < 720 ? 58 : 115;
    var min = state.w < 720 ? 28 : 30;
    return Math.max(min, Math.min(max, n));
  }

  function spawnParticle() {
    var vw = state.w || window.innerWidth || 1;
    var vh = state.h || window.innerHeight || 1;
    var px, py;
    if (mode === "spiral") {
      var spot = spiralSpawnPosition();
      px = spot.x;
      py = spot.y;
    } else {
      px = Math.random() * vw;
      py = Math.random() * vh;
    }
    var p = {
      x: px,
      y: py,
      vx: 0,
      vy: 0,
      heading: Math.random() * TAU,
      speed: 20,
      size: 2,
      alpha: 0.14,
      color: pickColor(),
      spin: Math.random() * TAU,
      phase: Math.random() * TAU,
      omega: 0,
      len: 22,
      wid: 2,
      turns: 2.3,
      noiseX: 0,
      noiseY: 0,
      noiseA: 0,
      target: -1,
      targetTimer: 0,
      tumble: rand(1, 4),
      pointerAffinity: rand(0.45, 1),
      lightAffinity: rand(0.7, 1.3)
    };
    prepareParticle(p, true);
    return p;
  }

  function prepareParticle(p, fresh) {
    if (p.color == null) p.color = pickColor();
    if (p.phase == null) p.phase = Math.random() * TAU;
    if (p.pointerAffinity == null) p.pointerAffinity = rand(0.45, 1);
    if (p.lightAffinity == null) p.lightAffinity = rand(0.7, 1.3);

    if (mode === "ion") {
      if (fresh || !p.speed) p.speed = rand(9, 21);
      p.speed = clamp(p.speed, 8, 22);
      p.size = fresh ? rand(1.3, 3.4) : clamp(p.size || 2.2, 1.2, 3.4);
      p.alpha = fresh ? rand(0.13, 0.28) : clamp(p.alpha || 0.20, 0.12, 0.30);
      p.vx = Math.cos(p.heading) * p.speed;
      p.vy = Math.sin(p.heading) * p.speed;
    } else if (mode === "chase") {
      if (fresh || !p.speed) p.speed = rand(18, 28);
      p.speed = clamp(p.speed, 18, 30);
      p.size = fresh ? rand(2.2, 3.8) : clamp(p.size || 2.7, 2.0, 3.8);
      p.alpha = fresh ? rand(0.18, 0.32) : clamp(p.alpha || 0.24, 0.16, 0.34);
      p.vx = Math.cos(p.heading) * p.speed;
      p.vy = Math.sin(p.heading) * p.speed;
      p.target = -1;
      p.targetTimer = 0;
    } else if (mode === "rod") {
      if (fresh || !p.speed) p.speed = rand(14, 23);
      p.speed = clamp(p.speed, 12, 24);
      p.len = fresh ? rand(18, 28) : clamp(p.len || 23, 16, 30);
      p.wid = fresh ? rand(2.2, 3.2) : clamp(p.wid || 2.6, 2.0, 3.4);
      p.size = p.wid;
      p.alpha = fresh ? rand(0.18, 0.30) : clamp(p.alpha || 0.22, 0.16, 0.32);
    } else if (mode === "spiral") {
      if (fresh || !p.speed) p.speed = rand(26, 34);
      p.speed = clamp(p.speed, 24, 36);
      if (fresh || !p.len || !p.amp) {
        var sp = pickSpiralSpecies();
        p.len = sp.len * rand(0.97, 1.03);
        p.amp = p.len / (2 * sp.aspect);
      } else {
        p.len = clamp(p.len, 38, 66);
        p.amp = clamp(p.amp, 2.2, 2.8);
      }
      p.wid = fresh ? 1.8 : clamp(p.wid || 1.8, 1.6, 2.0);
      p.turns = p.len / SPIRAL_PITCH;
      p.size = p.len;
      p.alpha = fresh ? rand(0.30, 0.42) : clamp(p.alpha || 0.36, 0.26, 0.44);
      p.omega = 0.38 * p.speed;
      if (fresh) p.spin = Math.random() * TAU;
    } else if (mode === "photo") {
      if (fresh || !p.speed) p.speed = rand(22, 32);
      p.speed = clamp(p.speed, 20, 34);
      p.size = fresh ? rand(1.4, 2.6) : clamp(p.size || 2, 1.2, 2.7);
      p.alpha = fresh ? rand(0.42, 0.68) : clamp(p.alpha || 0.54, 0.38, 0.70);
      p.vx = Math.cos(p.heading) * p.speed;
      p.vy = Math.sin(p.heading) * p.speed;
    }
    p.heading = ((p.heading % TAU) + TAU) % TAU;
  }

  function ensurePopulation() {
    var target = targetCount();
    while (parts.length < target) parts.push(spawnParticle());
    if (parts.length > target) {
      var remove = parts.length - target;
      for (var i = 0; i < remove; i++) {
        var idx = Math.floor(Math.random() * parts.length);
        parts.splice(idx, 1);
      }
      if (mode === "chase") {
        for (var j = 0; j < parts.length; j++) parts[j].target = -1;
      }
    }
  }

  /* ---------------- 光源 / 诱饵 ---------------- */

  function addSource(x, y, pinned) {
    var s = {
      x: x,
      y: y,
      radius: pinned ? rand(190, 240) : rand(180, 240),
      life: rand(2.0, 3.0),
      maxLife: pinned ? rand(12, 16) : rand(13, 18),
      base: pinned ? 1.05 : rand(0.80, 1.0),
      intensity: pinned ? 0.95 : 0.82,
      pinned: !!pinned,
      phase: Math.random() * TAU
    };
    if (sources.length >= MAX_SOURCES) {
      var oldest = sources[0];
      oldest.life = Math.min(oldest.life, oldest.maxLife * 0.82);
    }
    sources.push(s);
    if (sources.length > MAX_SOURCES + 1) {
      sources.shift();
    }
    return s;
  }

  function ensureSources(initial) {
    if (mode !== "photo") {
      sources = [];
      return;
    }
    var count = initial ? 2 : 0;
    while (sources.length < count) {
      addSource(rand(state.w * 0.18, state.w * 0.82), rand(state.h * 0.16, state.h * 0.78), false);
    }
    state.spawnTimer = rand(3, 6);
  }

  function addBait(x, y) {
    baits.push({ x: x, y: y, life: 0, maxLife: 5 });
    if (baits.length > 2) baits.shift();
  }

  function updateSources(dt) {
    if (mode !== "photo") return;

    for (var i = sources.length - 1; i >= 0; i--) {
      var s = sources[i];
      s.life += dt;
      var u = s.life / s.maxLife;
      var env = u < 0.28 ? u / 0.28 : u > 0.82 ? Math.max(0, (1 - u) / 0.18) : 1;
      s.intensity = s.base * env;
      s.x += Math.sin(state.t * 0.00018 + s.phase) * 2.4 * dt;
      s.y += Math.cos(state.t * 0.00015 + s.phase * 1.3) * 1.8 * dt;
      if (s.life >= s.maxLife) sources.splice(i, 1);
    }

    state.spawnTimer -= dt;
    if (sources.length < MAX_SOURCES && state.spawnTimer <= 0) {
      addSource(
        rand(state.w * 0.12, state.w * 0.88),
        rand(state.h * 0.12, state.h * 0.85),
        false
      );
      state.spawnTimer = rand(5, 8);
    }
  }

  /* ---------------- 指针 ---------------- */

  function isInteractive(el) {
    return !!(el && el.closest && el.closest("a,button,input,select,textarea,summary,label"));
  }

  function handleClick(x, y) {
    if (state.paused) return;
    if (mode === "chase") addBait(x, y);
    else if (mode === "photo") addSource(x, y, true);
  }

  function updatePointer(dt) {
    var prevX = pointer.sx;
    var prevY = pointer.sy;
    var k = 1 - Math.exp(-dt * 14);
    pointer.sx += (pointer.x - pointer.sx) * k;
    pointer.sy += (pointer.y - pointer.sy) * k;
    pointer.vx = dt > 0 ? (pointer.sx - prevX) / dt : 0;
    pointer.vy = dt > 0 ? (pointer.sy - prevY) / dt : 0;

    if (pointer.active) {
      pointer.idle = (performance.now() - pointer.lastMove) / 1000;
    } else {
      pointer.idle = 99;
    }

    pointer.strength =
      pointer.active && pointer.allowed && !state.paused
        ? Math.exp(-pointer.idle / 1.5)
        : 0;
    if (pointer.strength < 0.01) pointer.strength = 0;
  }

  function bindPointer() {
    window.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch") return;
      pointer.type = e.pointerType || "mouse";
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.allowed = !isInteractive(e.target);
      pointer.lastMove = performance.now();
    }, { passive: true });

    window.addEventListener("pointerdown", function (e) {
      pointer.type = e.pointerType || "mouse";
      pointer.down = true;
      pointer.downX = e.clientX;
      pointer.downY = e.clientY;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.sx = e.clientX;
      pointer.sy = e.clientY;
      pointer.allowed = !isInteractive(e.target);
      if (e.pointerType !== "touch") {
        pointer.active = true;
        pointer.lastMove = performance.now();
      }
    }, { passive: true });

    window.addEventListener("pointerup", function (e) {
      var wasDown = pointer.down;
      pointer.down = false;
      if (!wasDown) return;

      var dx = e.clientX - pointer.downX;
      var dy = e.clientY - pointer.downY;
      var moved = Math.sqrt(dx * dx + dy * dy);
      var selected = false;
      try {
        selected = !!(window.getSelection && !window.getSelection().isCollapsed);
      } catch (err) {
        selected = false;
      }

      if (moved < 8 && !selected && !isInteractive(e.target)) {
        handleClick(e.clientX, e.clientY);
      }

      if (e.pointerType === "touch") {
        pointer.active = false;
        pointer.strength = 0;
      }
    }, { passive: true });

    window.addEventListener("pointercancel", function () {
      pointer.down = false;
      pointer.active = false;
      pointer.strength = 0;
    }, { passive: true });

    window.addEventListener("blur", function () {
      pointer.down = false;
      pointer.active = false;
      pointer.strength = 0;
    });
  }

  /* ---------------- 模式更新 ---------------- */

  function updateIon(dt) {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var ss = 0, cc = 0, cnt = 0;
      for (var j = 0; j < parts.length; j++) {
        if (i === j) continue;
        var q = parts[j];
        var dx = q.x - p.x, dy = q.y - p.y;
        if (dx * dx + dy * dy < 110 * 110) {
          ss += Math.sin(q.heading);
          cc += Math.cos(q.heading);
          cnt++;
        }
      }
      if (cnt > 2) p.heading = lerpAngle(p.heading, Math.atan2(ss, cc), 0.012);

      var flow =
        -0.28 +
        0.95 * Math.sin(p.x * 0.0022 + state.t * 0.00016) +
        0.55 * Math.cos(p.y * 0.0018 - state.t * 0.00011);
      p.heading = lerpAngle(p.heading, flow, 0.006);
      p.heading += Math.sqrt(2 * 0.3 * dt) * gauss();
      noiseStep(p, dt, 5, 0.9);

      p.vx = Math.cos(p.heading) * p.speed + p.noiseX;
      p.vy = Math.sin(p.heading) * p.speed + p.noiseY;

      if (pointer.strength > 0 && pointer.allowed) {
        var pdx = p.x - pointer.sx, pdy = p.y - pointer.sy;
        var pd = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
        if (pd < 130) {
          var pf = (1 - pd / 130) * pointer.strength * 26;
          p.vx += (pdx / pd) * pf;
          p.vy += (pdy / pd) * pf;
        }
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      wrap(p, 40);
    }
  }

  function chooseTarget(i) {
    var p = parts[i];
    var options = [];
    for (var j = 0; j < parts.length; j++) {
      if (j === i) continue;
      var q = parts[j];
      var dx = q.x - p.x, dy = q.y - p.y;
      var d2 = dx * dx + dy * dy;
      if (d2 < 240 * 240 && d2 > 100) options.push(j);
    }
    if (options.length) p.target = options[Math.floor(Math.random() * options.length)];
    else {
      do {
        p.target = Math.floor(Math.random() * parts.length);
      } while (parts.length > 1 && p.target === i);
    }
    p.targetTimer = rand(2, 4);
  }

  function updateChase(dt) {
    var cx = state.w * 0.5, cy = state.h * 0.5;

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];

      var sepX = 0, sepY = 0;
      var aliX = 0, aliY = 0;
      var cohX = 0, cohY = 0;
      var cnt = 0;

      for (var j = 0; j < parts.length; j++) {
        if (i === j) continue;
        var q = parts[j];
        var dx = q.x - p.x, dy = q.y - p.y;
        var d2 = dx * dx + dy * dy;
        if (d2 > 150 * 150) continue;
        cnt++;
        cohX += q.x;
        cohY += q.y;
        aliX += q.vx;
        aliY += q.vy;
        if (d2 < 27 * 27 && d2 > 0.01) {
          var d = Math.sqrt(d2);
          sepX -= dx / d;
          sepY -= dy / d;
        }
      }

      var ax = sepX * 1.8;
      var ay = sepY * 1.8;

      if (cnt > 0) {
        var cdx = cohX / cnt - p.x;
        var cdy = cohY / cnt - p.y;
        var cd = Math.sqrt(cdx * cdx + cdy * cdy) || 1;
        ax += (cdx / cd) * 0.18;
        ay += (cdy / cd) * 0.18;

        var am = Math.sqrt(aliX * aliX + aliY * aliY) || 1;
        ax += (aliX / am) * 0.62;
        ay += (aliY / am) * 0.62;
      }

      if (cnt > 8) {
        var crowdX = p.x - cohX / cnt;
        var crowdY = p.y - cohY / cnt;
        var crowdD = Math.sqrt(crowdX * crowdX + crowdY * crowdY) || 1;
        var crowd = Math.min(4, cnt - 8) * 0.35;
        ax += (crowdX / crowdD) * crowd;
        ay += (crowdY / crowdD) * crowd;
        p.tumble = Math.min(p.tumble, 0.25);
      }

      if (p.target < 0 || p.target >= parts.length || p.targetTimer <= 0) {
        chooseTarget(i);
      }
      var target = parts[p.target];
      if (target) {
        var tdx = target.x - p.x, tdy = target.y - p.y;
        var td = Math.sqrt(tdx * tdx + tdy * tdy);
        if (td < 30) {
          p.target = -1;
          p.targetTimer = 0;
        } else {
          ax += (tdx / td) * 1.0;
          ay += (tdy / td) * 1.0;
        }
      }
      p.targetTimer -= dt;

      for (var b = 0; b < baits.length; b++) {
        var bait = baits[b];
        var bdx = bait.x - p.x, bdy = bait.y - p.y;
        var bd = Math.sqrt(bdx * bdx + bdy * bdy) || 1;
        if (bd < 320) {
          var bw = (1 - bd / 320) * 1.6;
          ax += (bdx / bd) * bw;
          ay += (bdy / bd) * bw;
        }
      }

      if (pointer.strength > 0 && pointer.allowed) {
        var pdx = pointer.sx - p.x, pdy = pointer.sy - p.y;
        var pd = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
        if (pd < 240) {
          var radial = (pd - 60) / 60;
          var pf = radial * 0.85 * pointer.strength * p.pointerAffinity;
          ax += (pdx / pd) * pf;
          ay += (pdy / pd) * pf;
          ax += (-pdy / pd) * 0.35 * pointer.strength * p.pointerAffinity;
          ay += (pdx / pd) * 0.35 * pointer.strength * p.pointerAffinity;
        }
      }

      var sdx = p.x - cx, sdy = p.y - cy;
      var sd = Math.sqrt(sdx * sdx + sdy * sdy) || 1;
      ax += (-sdy / sd) * 0.10;
      ay += (sdx / sd) * 0.10;

      var vmax = 26 * (1 + 0.10 * Math.min(1, cnt / 10));
      p.vx += ax * 60 * dt;
      p.vy += ay * 60 * dt;
      var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (sp > vmax) {
        p.vx = (p.vx / sp) * vmax;
        p.vy = (p.vy / sp) * vmax;
      }

      noiseStep(p, dt, 4, 1.0);
      p.x += (p.vx + p.noiseX) * dt;
      p.y += (p.vy + p.noiseY) * dt;

      p.tumble -= dt;
      if (p.tumble <= 0) {
        var turn = (Math.random() < 0.5 ? -1 : 1) * rand(0.35, 0.95);
        var cos = Math.cos(turn), sin = Math.sin(turn);
        var nvx = p.vx * cos - p.vy * sin;
        var nvy = p.vx * sin + p.vy * cos;
        p.vx = nvx;
        p.vy = nvy;
        p.tumble = rand(2, 4.5);
      }

      p.heading = Math.atan2(p.vy, p.vx);
      wrap(p, 30);
    }
  }

  function updateRods(dt, spiral) {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var s2 = 0, c2 = 0, cnt = 0;
      var sepX = 0, sepY = 0;
      var attrX = 0, attrY = 0;
      var sepR = spiral ? 32 : 21;

      for (var j = 0; j < parts.length; j++) {
        if (i === j) continue;
        var q = parts[j];
        var dx = q.x - p.x, dy = q.y - p.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 120 * 120) {
          s2 += Math.sin(2 * q.heading);
          c2 += Math.cos(2 * q.heading);
          cnt++;
        }
        if (d2 < sepR * sepR && d2 > 0.01) {
          var d = Math.sqrt(d2);
          sepX -= dx / d;
          sepY -= dy / d;
        }
        if (!spiral && d2 < 100 * 100 && d2 > 30 * 30) {
          var ad = Math.sqrt(d2);
          attrX += dx / ad;
          attrY += dy / ad;
        }
      }

      if (cnt > 2) {
        p.heading = lerpAngle(p.heading, 0.5 * Math.atan2(s2, c2), spiral ? 0.045 : 0.018);
      }
      if (spiral) {
        p.heading = lerpAngle(
          p.heading,
          -0.35 + 0.05 * Math.sin(state.t * 0.0002 + p.phase),
          0.012
        );
      }
      p.heading += Math.sqrt(2 * (spiral ? 0.05 : 0.14) * dt) * gauss();
      p.heading += p.noiseA * dt;
      p.noiseA = p.noiseA * Math.exp(-dt / 0.8) + (spiral ? 0.22 : 0.7) * Math.sqrt(dt) * gauss();

      if (pointer.down && pointer.strength > 0.03) {
        var pdx = p.x - pointer.sx, pdy = p.y - pointer.sy;
        var pd = Math.sqrt(pdx * pdx + pdy * pdy) || 1;
        if (pd < 210) {
          p.heading += (1 - pd / 210) * pointer.strength * 1.2 * dt;
        }
      }

      noiseStep(p, dt, spiral ? 1.2 : 3, 1.0);
      p.vx = Math.cos(p.heading) * p.speed + p.noiseX;
      p.vy = Math.sin(p.heading) * p.speed + p.noiseY;
      p.x += (p.vx + sepX * 26 + attrX * 2.75) * dt;
      p.y += (p.vy + sepY * 26 + attrY * 2.75) * dt;

      if (spiral) {
        p.spin += p.omega * dt;
      }

      wrap(p, 45);
    }
  }

  function updatePhoto(dt) {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var lfx = 0, lfy = 0;
      var rfx = 0, rfy = 0;

      for (var s = 0; s < sources.length; s++) {
        var src = sources[s];
        /* 按可见亮度扣掉黑位：光越暗，吸引力越接近 0，避免余辉拖住粒子 */
        if (src.intensity <= 0.10) continue;
        var vis = (src.intensity - 0.10) / 0.90;
        var dx = src.x - p.x, dy = src.y - p.y;
        var d = Math.sqrt(dx * dx + dy * dy) || 1;
        if (d > 420) continue;
        var w = vis * Math.exp(-d / 220);
        lfx += (dx / d) * w;
        lfy += (dy / d) * w;
      }

      /* 粒子间短程排斥：成对累加，不在归一化里与光源力混在一起 */
      for (var j = 0; j < parts.length; j++) {
        if (j === i) continue;
        var q = parts[j];
        var rdx = p.x - q.x, rdy = p.y - q.y;
        var rd2 = rdx * rdx + rdy * rdy;
        if (rd2 < 26 * 26 && rd2 > 0.01) {
          var rd = Math.sqrt(rd2);
          var rf = (1 - rd / 26) * 1.05;
          rfx += (rdx / rd) * rf;
          rfy += (rdy / rd) * rf;
        }
      }

      var lm = Math.sqrt(lfx * lfx + lfy * lfy);
      if (lm > 0.001) {
        p.vx += (lfx / lm) * 70 * dt;
        p.vy += (lfy / lm) * 70 * dt;
      }
      p.vx += rfx * 55 * dt;
      p.vy += rfy * 55 * dt;

      /* 布朗扰动：OU 速度噪声，避免斥力/引力平衡后压成密堆 */
      noiseStep(p, dt, 18, 0.6);

      var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      var vmax = 48;
      if (sp > vmax) {
        p.vx = (p.vx / sp) * vmax;
        p.vy = (p.vy / sp) * vmax;
      }

      p.x += (p.vx + p.noiseX * 0.80) * dt;
      p.y += (p.vy + p.noiseY * 0.80) * dt;
      p.heading = Math.atan2(p.vy, p.vx);
      wrap(p, 40);
    }
  }

  /* ---------------- 绘制 ---------------- */

  function drawIon() {
    var maxD = 88;
    var counts = new Array(parts.length);
    for (var i = 0; i < counts.length; i++) counts[i] = 0;

    ctx.lineWidth = 0.5;
    for (i = 0; i < parts.length; i++) {
      var p = parts[i];
      for (var j = i + 1; j < parts.length; j++) {
        var q = parts[j];
        var dx = q.x - p.x, dy = q.y - p.y;
        if (Math.abs(dx) > maxD || Math.abs(dy) > maxD) continue;
        var d2 = dx * dx + dy * dy;
        if (d2 > maxD * maxD) continue;
        if (counts[i] >= 2 || counts[j] >= 2) continue;
        var d = Math.sqrt(d2);
        ctx.strokeStyle = rgba(palette.line, 0.065 * (1 - d / maxD));
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(q.x, q.y);
        ctx.stroke();
        counts[i]++;
        counts[j]++;
      }
    }

    for (i = 0; i < parts.length; i++) {
      p = parts[i];
      var c = palette.colors[p.color];
      var spr = glowSprites[p.color];
      var tail = 4 + 8 * (p.size / 2.8);
      ctx.strokeStyle = rgba(c, p.alpha * 0.18);
      ctx.lineWidth = 0.4 + p.size * 0.2;
      ctx.beginPath();
      ctx.moveTo(p.x - Math.cos(p.heading) * tail, p.y - Math.sin(p.heading) * tail);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      drawSprite(spr, p.x, p.y, 13 + p.size * 8, p.alpha * 0.58);
      drawDot(p.x, p.y, p.size, c, p.alpha * 1.45);
    }
  }

  function drawChase() {
    for (var b = 0; b < baits.length; b++) {
      var bait = baits[b];
      var fade = Math.min(1, bait.life / 0.4) * Math.min(1, (bait.maxLife - bait.life) / 1.0);
      drawSprite(glowSprites[0], bait.x, bait.y, 46, 0.18 * fade);
      drawDot(bait.x, bait.y, 2.2, palette.colors[0], 0.35 * fade);
    }

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var c = palette.colors[p.color];
      var spr = glowSprites[p.color];
      drawSprite(spr, p.x, p.y, 12 + p.size * 6, p.alpha * 0.58);
      drawDot(p.x, p.y, p.size, c, p.alpha * 1.40);
    }
  }

  function drawRods() {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var c = palette.colors[p.color];
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.heading);
      ctx.lineCap = "round";

      ctx.strokeStyle = rgba(c, p.alpha * 0.16);
      ctx.lineWidth = p.wid + 8;
      ctx.beginPath();
      ctx.moveTo(-p.len / 2, 0);
      ctx.lineTo(p.len / 2, 0);
      ctx.stroke();

      ctx.strokeStyle = rgba(c, p.alpha);
      ctx.lineWidth = p.wid;
      ctx.beginPath();
      ctx.moveTo(-p.len / 2, 0);
      ctx.lineTo(p.len / 2, 0);
      ctx.stroke();

      ctx.strokeStyle = rgba([255, 255, 255], p.alpha * 0.22);
      ctx.lineWidth = Math.max(0.5, p.wid * 0.3);
      ctx.beginPath();
      ctx.moveTo(-p.len / 2 + 2, -p.wid * 0.18);
      ctx.lineTo(p.len / 2 - 2, -p.wid * 0.18);
      ctx.stroke();

      drawDot(p.len / 2, 0, p.wid * 0.9, c, p.alpha * 1.4);
      ctx.restore();
    }
  }

  function drawSpirals() {
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var c = palette.colors[p.color];
      var L = p.len;
      var amp = p.amp || Math.max(4.5, p.wid * 3.0);
      var turns = p.turns;
      var segs = Math.max(48, Math.round(turns * 22));

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.heading);
      ctx.lineCap = "round";

      /* 侧视单螺旋：一条正弦链，绕长轴自旋 */
      ctx.strokeStyle = rgba(c, p.alpha * 0.14);
      ctx.lineWidth = Math.max(3.4, amp * 1.3);
      ctx.beginPath();
      for (var k = 0; k <= segs; k++) {
        var t = k / segs;
        var x = -L / 2 + L * t;
        var y = Math.sin(t * turns * TAU + p.spin) * amp;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = rgba(c, p.alpha);
      ctx.lineWidth = 2.3;
      ctx.beginPath();
      for (k = 0; k <= segs; k++) {
        t = k / segs;
        x = -L / 2 + L * t;
        y = Math.sin(t * turns * TAU + p.spin) * amp;
        if (k === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      for (k = 2; k <= segs - 2; k += 3) {
        t = k / segs;
        x = -L / 2 + L * t;
        var sa = t * turns * TAU + p.spin;
        if (Math.cos(sa) > 0.35) {
          drawDot(x, Math.sin(sa) * amp, 0.85, c, p.alpha * 0.5);
        }
      }

      ctx.restore();
    }
  }

  function drawLight(x, y, radius, inten) {
    drawSprite(lightSprite, x, y, radius * 1.65, 0.55 * inten);
    drawSprite(lightSprite, x, y, radius * 0.85, 0.30 * inten);
    drawSprite(lightSprite, x, y, radius * 0.38, 0.50 * inten);
    drawSprite(lightSprite, x, y, radius * 0.16, 0.42 * inten);
  }

  function drawPhoto() {
    for (var s = 0; s < sources.length; s++) {
      var src = sources[s];
      if (src.intensity <= 0.01) continue;
      var inten = Number(src.intensity);
      if (!isFinite(inten)) inten = 0.8;
      inten = clamp(inten, 0, 1.2);
      drawLight(src.x, src.y, 230, inten);
    }

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      var c = palette.colors[p.color];
      var spr = glowSprites[p.color];
      ctx.strokeStyle = rgba(c, p.alpha * 0.18);
      ctx.lineWidth = 0.6;
      ctx.beginPath();
      ctx.moveTo(p.x - p.vx * 0.10, p.y - p.vy * 0.10);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();

      drawSprite(spr, p.x, p.y, 10 + p.size * 6, p.alpha * 0.50);
      drawDot(p.x, p.y, p.size, c, p.alpha * 1.2);
    }
  }

  function draw() {
    if (!state.w || !state.h) return;
    ctx.clearRect(0, 0, state.w, state.h);

    if (state.mode === "ion") drawIon();
    else if (state.mode === "chase") drawChase();
    else if (state.mode === "rod") drawRods();
    else if (state.mode === "spiral") drawSpirals();
    else if (state.mode === "photo") drawPhoto();

    if (!state.drawn) {
      state.drawn = true;
      requestAnimationFrame(function () {
        bg.classList.add("is-ready");
      });
    }
  }

  /* ---------------- 帧循环 ---------------- */

  function update(dt) {
    state.t += dt * 1000;
    updatePointer(dt);

    for (var i = baits.length - 1; i >= 0; i--) {
      baits[i].life += dt;
      if (baits[i].life >= baits[i].maxLife) baits.splice(i, 1);
    }

    updateSources(dt);

    if (state.mode === "ion") updateIon(dt);
    else if (state.mode === "chase") updateChase(dt);
    else if (state.mode === "rod") updateRods(dt, false);
    else if (state.mode === "spiral") updateRods(dt, true);
    else if (state.mode === "photo") updatePhoto(dt);
  }

  function loop(ts) {
    if (!state.running) return;
    state.raf = requestAnimationFrame(loop);

    if (!state.last) state.last = ts;
    var dt = (ts - state.last) / 1000;
    state.last = ts;
    if (dt <= 0) dt = 1 / 60;
    if (dt > 0.05) dt = 0.05;

    update(dt);
    draw();
  }

  function start() {
    if (state.running || state.paused) return;
    state.running = true;
    state.last = 0;
    state.raf = requestAnimationFrame(loop);
  }

  function stop() {
    state.running = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = 0;
  }

  function simulate(frames) {
    for (var i = 0; i < frames; i++) {
      update(1 / 60);
    }
    draw();
  }

  /* ---------------- 尺寸 / 主题 / 模式 ---------------- */

  function applyTheme() {
    state.theme = pageDark || isDarkRoot() ? "dark" : "light";
    if (state.mode === "photo") state.theme = "dark";
    buildSprites();
  }

  function resize() {
    var oldW = state.w || window.innerWidth;
    var oldH = state.h || window.innerHeight;
    var newW = window.innerWidth;
    var newH = window.innerHeight;

    if (Math.abs(newW - oldW) < 2 && Math.abs(newH - oldH) < 2 && state.w) {
      return;
    }

    if (state.w && state.h && parts.length) {
      var sx = newW / state.w;
      var sy = newH / state.h;
      for (var i = 0; i < parts.length; i++) {
        parts[i].x *= sx;
        parts[i].y *= sy;
      }
      for (i = 0; i < sources.length; i++) {
        sources[i].x *= sx;
        sources[i].y *= sy;
      }
      for (i = 0; i < baits.length; i++) {
        baits[i].x *= sx;
        baits[i].y *= sy;
      }
    }

    state.w = newW;
    state.h = newH;
    state.dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    canvas.width = Math.round(state.w * state.dpr);
    canvas.height = Math.round(state.h * state.dpr);
    canvas.style.width = state.w + "px";
    canvas.style.height = state.h + "px";
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    applyTheme();
    if (!parts.length) ensurePopulation();
    draw();
  }

  function setMode(nextMode) {
    if (!MODES[nextMode]) return;
    var changed = nextMode !== state.mode;
    mode = nextMode;
    state.mode = nextMode;
    bg.setAttribute("data-mode", nextMode);

    if (changed) {
      parts = [];
      sources = [];
      baits = [];
    }

    if (nextMode === "photo") {
      state.theme = "dark";
      pageDark = true;
      root.setAttribute("data-theme", "dark");
      root.classList.add("theme-dark");
      applyDarkHardening();
    }
    applyTheme();

    for (var i = 0; i < parts.length; i++) {
      prepareParticle(parts[i], false);
    }

    if (nextMode === "chase") {
      for (i = 0; i < parts.length; i++) parts[i].target = -1;
      baits = [];
    } else if (nextMode === "photo") {
      baits = [];
      if (!sources.length) ensureSources(true);
    } else {
      sources = [];
      baits = [];
    }

    ensurePopulation();
    draw();
  }

  /* ---------------- 跨页面状态 ---------------- */

  function save() {
    if (!parts.length) return;
    var data = {
      v: 2,
      t: state.t,
      mode: state.mode,
      w: state.w,
      h: state.h,
      saved: Date.now(),
      parts: [],
      sources: [],
      baits: []
    };

    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      data.parts.push({
        x: p.x / state.w,
        y: p.y / state.h,
        vx: p.vx,
        vy: p.vy,
        heading: p.heading,
        speed: p.speed,
        size: p.size,
        alpha: p.alpha,
        color: p.color,
        spin: p.spin,
        omega: p.omega,
        len: p.len,
        wid: p.wid,
        amp: p.amp,
        turns: p.turns,
        noiseX: p.noiseX,
        noiseY: p.noiseY,
        noiseA: p.noiseA,
        targetTimer: p.targetTimer,
        pointerAffinity: p.pointerAffinity,
        lightAffinity: p.lightAffinity
      });
    }

    for (i = 0; i < sources.length; i++) {
      var s = sources[i];
      data.sources.push({
        x: s.x / state.w,
        y: s.y / state.h,
        radius: s.radius,
        life: s.life,
        maxLife: s.maxLife,
        base: s.base,
        pinned: s.pinned,
        phase: s.phase
      });
    }

    for (i = 0; i < baits.length; i++) {
      data.baits.push({
        x: baits[i].x / state.w,
        y: baits[i].y / state.h,
        life: baits[i].life,
        maxLife: baits[i].maxLife
      });
    }

    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(data));
      state.lastSave = Date.now();
    } catch (err) {
      /* sessionStorage 不可用时不持久化 */
    }
  }

  function restore() {
    var raw;
    try {
      raw = sessionStorage.getItem(STORE_KEY);
    } catch (err) {
      return false;
    }
    if (!raw) return false;

    var data;
    try {
      data = JSON.parse(raw);
    } catch (err) {
      return false;
    }

    if (!data || data.v !== 2 || !data.parts || !data.parts.length) return false;
    if (Date.now() - data.saved > 30 * 60 * 1000) return false;
    /* 模式变化时不继承上一模式的粒子分布，避免把螺旋/棒状排布硬套到另一种模式 */
    if (data.mode !== state.mode) return false;

    state.t = data.t || 0;
    parts = data.parts.map(function (d) {
      return {
        x: clamp(d.x, 0, 1) * state.w,
        y: clamp(d.y, 0, 1) * state.h,
        vx: d.vx || 0,
        vy: d.vy || 0,
        heading: d.heading || 0,
        speed: d.speed || 20,
        size: d.size || 2,
        alpha: d.alpha || 0.14,
        color: d.color || 0,
        spin: d.spin || 0,
        phase: d.phase || Math.random() * TAU,
        omega: d.omega || 0,
        len: d.len || 22,
        wid: d.wid || 2,
        amp: d.amp || 0,
        turns: d.turns || 2.3,
        noiseX: d.noiseX || 0,
        noiseY: d.noiseY || 0,
        noiseA: d.noiseA || 0,
        target: -1,
        targetTimer: d.targetTimer || 0,
        tumble: rand(1, 4),
        pointerAffinity: d.pointerAffinity || rand(0.45, 1),
        lightAffinity: d.lightAffinity || rand(0.7, 1.3)
      };
    });

    sources = (data.sources || []).map(function (s) {
      return {
        x: clamp(s.x, 0, 1) * state.w,
        y: clamp(s.y, 0, 1) * state.h,
        radius: s.radius || 170,
        life: s.life || 0,
        maxLife: s.maxLife || 10,
        base: s.base || 0.8,
        intensity: 0,
        pinned: !!s.pinned,
        phase: s.phase || 0
      };
    });

    baits = (data.baits || []).map(function (b) {
      return {
        x: clamp(b.x, 0, 1) * state.w,
        y: clamp(b.y, 0, 1) * state.h,
        life: b.life || 0,
        maxLife: b.maxLife || 5
      };
    });

    if (state.mode === "spiral") {
      var minX = state.w, maxX = 0, minY = state.h, maxY = 0;
      for (var k = 0; k < parts.length; k++) {
        if (parts[k].x < minX) minX = parts[k].x;
        if (parts[k].x > maxX) maxX = parts[k].x;
        if (parts[k].y < minY) minY = parts[k].y;
        if (parts[k].y > maxY) maxY = parts[k].y;
      }
      if (maxX - minX < state.w * 0.2 && maxY - minY < state.h * 0.2) {
        parts = [];
        sources = [];
        baits = [];
        return false;
      }
    }

    return true;
  }

  /* ---------------- 暂停 ---------------- */

  function syncPauseButtons() {
    var buttons = document.querySelectorAll("[data-bg-pause]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].textContent = state.paused ? "播放背景动效" : "暂停背景动效";
      buttons[i].setAttribute("aria-pressed", state.paused ? "true" : "false");
    }
  }

  function setPaused(paused, remember) {
    state.paused = !!paused;
    bg.setAttribute("data-bg-paused", state.paused ? "1" : "0");
    if (state.paused) {
      stop();
      draw();
    } else {
      state.last = 0;
      start();
    }
    syncPauseButtons();
    if (remember) {
      try {
        sessionStorage.setItem(PAUSE_KEY, state.paused ? "1" : "0");
      } catch (err) {
        /* ignore */
      }
    }
  }

  function bindPause() {
    var buttons = document.querySelectorAll("[data-bg-pause]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        setPaused(!state.paused, true);
      });
    }
  }

  /* ---------------- 启动 ---------------- */

  function init() {
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    var isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 720;
    state.reduced = reduce.matches;

    var remembered = null;
    try {
      remembered = sessionStorage.getItem(PAUSE_KEY);
    } catch (err) {
      remembered = null;
    }

    /* 移动端默认播放：系统“减少动态效果”或旧会话暂停不再让画面静止；
       只有用户主动暂停（v3 键）才保持暂停。 */
    state.paused = remembered === "1" || (reduce.matches && !isMobile);
    bg.setAttribute("data-bg-paused", state.paused ? "1" : "0");

    state.w = window.innerWidth;
    state.h = window.innerHeight;
    state.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(state.w * state.dpr);
    canvas.height = Math.round(state.h * state.dpr);
    canvas.style.width = state.w + "px";
    canvas.style.height = state.h + "px";
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    applyTheme();

    var restored = restore();
    if (!restored) {
      ensurePopulation();
    }

    setMode(state.mode);
    ensurePopulation();

    if (state.paused) {
      simulate(150);
    } else {
      draw();
      start();
    }

    syncPauseButtons();
    bindPause();
    bindPointer();

    /* 某些 Edge 扩展会在页面加载后改动 html 属性/样式；404 深色页额外守住主题。 */
    if (pageDark) {
      applyDarkHardening();
      try {
        new MutationObserver(function () {
          if (darkGuardBusy) return;
          darkGuardBusy = true;
          applyDarkHardening();
          setTimeout(function () {
            darkGuardBusy = false;
          }, 50);
        }).observe(root, { attributes: true, attributeFilter: ["data-theme", "class"] });
      } catch (err) {
        /* MutationObserver 不可用时依赖内联变量/样式 */
      }
    }

    if (reduce.addEventListener) {
      reduce.addEventListener("change", function (e) {
        if (e.matches) setPaused(true, false);
      });
    }

    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    }, { passive: true });

    window.addEventListener("orientationchange", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 220);
    }, { passive: true });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        save();
        stop();
      } else if (!state.paused) {
        state.last = 0;
        start();
      }
    });

    window.addEventListener("pagehide", save);
    window.addEventListener("beforeunload", save);

    setInterval(save, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
