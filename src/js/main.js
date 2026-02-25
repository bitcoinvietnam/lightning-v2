// ===== Navbar scroll effect =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
});

// ===== Scroll reveal with blur/scale =====
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -60px 0px' });
revealEls.forEach(el => revealObserver.observe(el));

// ===== Floating particles (dots + mini bolts) =====
const particlesContainer = document.getElementById('particles');
if (particlesContainer) {
  for (let i = 0; i < 25; i++) {
    const p = document.createElement('div');
    const isBolt = Math.random() > 0.7;
    p.className = 'particle ' + (isBolt ? 'particle--bolt' : 'particle--dot');
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (10 + Math.random() * 18) + 's';
    p.style.animationDelay = (Math.random() * 14) + 's';
    if (!isBolt) {
      const size = 1.5 + Math.random() * 2.5;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
    }
    particlesContainer.appendChild(p);
  }
}

// ===== Lightning streaks =====
const lightningBg = document.getElementById('lightningBg');
if (lightningBg) {
  for (let i = 0; i < 6; i++) {
    const streak = document.createElement('div');
    streak.className = 'lightning-streak';
    streak.style.left = (10 + Math.random() * 80) + '%';
    streak.style.top = (Math.random() * 60) + '%';
    streak.style.height = (80 + Math.random() * 160) + 'px';
    streak.style.animationDuration = (6 + Math.random() * 10) + 's';
    streak.style.animationDelay = (Math.random() * 8) + 's';
    lightningBg.appendChild(streak);
  }
}

// ===== Copy pubkey =====
function copyPubkey() {
  const box = document.getElementById('pubkey');
  const text = box.querySelector('span').textContent;
  navigator.clipboard.writeText(text).then(() => {
    const hint = box.querySelector('.pubkey-hint');
    const btn = box.querySelector('.copy-btn');
    const originalHint = hint.textContent;
    const originalBtn = btn.innerHTML;
    hint.textContent = 'Copied!';
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    box.classList.add('copied');
    setTimeout(() => {
      hint.textContent = originalHint;
      btn.innerHTML = originalBtn;
      box.classList.remove('copied');
    }, 2000);
  });
}

// ===== Count-up animation for stats =====
function animateCount(el) {
  const target = parseFloat(el.dataset.countTo);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const decimals = parseInt(el.dataset.decimals) || 0;
  const useComma = el.dataset.comma === 'true';
  const duration = 1800;
  const start = performance.now();

  function format(num) {
    let str = decimals > 0 ? num.toFixed(decimals) : Math.floor(num).toString();
    if (useComma) {
      str = parseInt(str).toLocaleString();
    }
    return prefix + str + suffix;
  }

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = target * ease;
    el.textContent = format(current);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = format(target);
    }
  }

  el.textContent = format(0);
  requestAnimationFrame(step);
}

const countEls = document.querySelectorAll('[data-count-to]');
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });
countEls.forEach(el => countObserver.observe(el));

// ===== Hero network canvas animation =====
const networkCanvas = document.getElementById('networkCanvas');
if (networkCanvas) {
  const ctx = networkCanvas.getContext('2d');
  let canvasW, canvasH;
  const nodes = [];
  const nodeCount = 45;
  const connectDist = 160;
  const mouseInfluence = 160;
  const accent = { r: 232, g: 183, b: 48 };
  const blue = { r: 26, g: 111, b: 196 };
  let mouse = { x: -9999, y: -9999 };

  const heroVisual = networkCanvas.closest('.hero-visual');
  if (heroVisual) {
    heroVisual.addEventListener('mousemove', function (e) {
      const rect = networkCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    heroVisual.addEventListener('mouseleave', function () {
      mouse.x = -9999;
      mouse.y = -9999;
    });
  }

  function resizeCanvas() {
    const parent = networkCanvas.parentElement;
    const rect = parent.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvasW = rect.width + 240;
    canvasH = rect.height + 240;
    networkCanvas.width = canvasW * dpr;
    networkCanvas.height = canvasH * dpr;
    networkCanvas.style.width = canvasW + 'px';
    networkCanvas.style.height = canvasH + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const glowLerp = 0.03; // slow lerp factor for elegant fade

  function initNodes() {
    nodes.length = 0;
    for (let i = 0; i < nodeCount; i++) {
      const isAccent = Math.random() > 0.5;
      nodes.push({
        x: Math.random() * canvasW,
        y: Math.random() * canvasH,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: 1.5 + Math.random() * 2,
        color: isAccent ? accent : blue,
        baseOpacity: 0.3 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        glowAmount: 0 // smoothed proximity value 0..1
      });
    }
  }

  function drawNetwork(time) {
    ctx.clearRect(0, 0, canvasW, canvasH);

    // update
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < -10) n.x = canvasW + 10;
      if (n.x > canvasW + 10) n.x = -10;
      if (n.y < -10) n.y = canvasH + 10;
      if (n.y > canvasH + 10) n.y = -10;
    });

    // Find the 3 closest nodes to mouse
    const closestIds = new Set();
    if (mouse.x > -999) {
      const byDist = nodes
        .map((n, i) => ({ i, d: Math.sqrt((n.x - mouse.x) ** 2 + (n.y - mouse.y) ** 2) }))
        .filter(o => o.d < mouseInfluence)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3);
      byDist.forEach(o => closestIds.add(o.i));
    }

    // connections — use smoothed glow for line boost
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectDist) {
          const pairGlow = Math.min(nodes[i].glowAmount, nodes[j].glowAmount);
          const mBoost = pairGlow * 0.35;
          const opacity = (1 - dist / connectDist) * 0.2 + mBoost;
          const midColor = nodes[i].color === accent ? accent : blue;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = 'rgba(' + midColor.r + ',' + midColor.g + ',' + midColor.b + ',' + opacity + ')';
          ctx.lineWidth = 0.6 + pairGlow * 0.9;
          ctx.stroke();
        }
      }
    }

    // nodes — smooth glow fade in/out
    const t = time * 0.001;
    nodes.forEach((n, idx) => {
      // Compute target glow: 1 if among 3 closest, 0 otherwise
      let target = 0;
      if (closestIds.has(idx)) {
        const mDist = Math.sqrt((n.x - mouse.x) ** 2 + (n.y - mouse.y) ** 2);
        target = 1 - mDist / mouseInfluence;
      }
      // Lerp toward target for slow elegant fade
      n.glowAmount += (target - n.glowAmount) * glowLerp;

      const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + n.phase);
      const g = n.glowAmount;
      const opacity = Math.min(n.baseOpacity + pulse * 0.2 + g * 0.6, 1);
      const sizeBoost = 1 + g * 1.5;
      const glowBoost = 1 + g * 3;

      // glow
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * 4 * glowBoost, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + n.color.r + ',' + n.color.g + ',' + n.color.b + ',' + (opacity * 0.12) + ')';
      ctx.fill();

      // core
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r * sizeBoost, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + n.color.r + ',' + n.color.g + ',' + n.color.b + ',' + opacity + ')';
      ctx.fill();
    });

    requestAnimationFrame(drawNetwork);
  }

  resizeCanvas();
  initNodes();
  requestAnimationFrame(drawNetwork);
  window.addEventListener('resize', function () { resizeCanvas(); initNodes(); });

  // ===== Orb nodes mouse proximity glow =====
  const orbNodes = document.querySelectorAll('.hero-orb .orb-node');
  const orbCenter = document.querySelector('.hero-orb .orb-center');
  if (heroVisual && orbNodes.length) {
    heroVisual.style.cursor = 'default';
    heroVisual.addEventListener('mousemove', function (e) {
      const orbEl = document.querySelector('.hero-orb');
      if (!orbEl) return;
      const orbRect = orbEl.getBoundingClientRect();
      const mx = e.clientX;
      const my = e.clientY;

      orbNodes.forEach(node => {
        const nr = node.getBoundingClientRect();
        const nx = nr.left + nr.width / 2;
        const ny = nr.top + nr.height / 2;
        const dist = Math.sqrt((mx - nx) ** 2 + (my - ny) ** 2);
        const maxDist = 120;
        if (dist < maxDist) {
          const intensity = 1 - dist / maxDist;
          const glow = Math.round(intensity * 50);
          const scale = 1 + intensity * 1.2;
          node.style.boxShadow = '0 0 ' + (20 + glow) + 'px rgba(232, 183, 48, ' + (0.5 + intensity * 0.5) + '), 0 0 ' + (40 + glow * 2) + 'px rgba(232, 183, 48, ' + (0.2 + intensity * 0.4) + ')';
          node.style.transform = 'scale(' + scale + ')';
          node.style.opacity = 0.7 + intensity * 0.3;
        } else {
          node.style.boxShadow = '';
          node.style.transform = '';
          node.style.opacity = '';
        }
      });

      // Brighten orb center on proximity
      if (orbCenter) {
        const cr = orbCenter.getBoundingClientRect();
        const cx = cr.left + cr.width / 2;
        const cy = cr.top + cr.height / 2;
        const dist = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2);
        const maxDist = 160;
        if (dist < maxDist) {
          const intensity = 1 - dist / maxDist;
          orbCenter.style.filter = 'brightness(' + (1 + intensity * 0.8) + ')';
        } else {
          orbCenter.style.filter = '';
        }
      }
    });

    heroVisual.addEventListener('mouseleave', function () {
      orbNodes.forEach(node => {
        node.style.boxShadow = '';
        node.style.transform = '';
        node.style.opacity = '';
      });
      if (orbCenter) orbCenter.style.filter = '';
    });
  }
}

// ===== Lightning Network diagram (What-is section) =====
const lnCanvas = document.getElementById('lightningNetCanvas');
if (lnCanvas) {
  const lnCtx = lnCanvas.getContext('2d');
  const S = 400; // logical size
  const dpr = window.devicePixelRatio || 1;
  lnCanvas.width = S * dpr;
  lnCanvas.height = S * dpr;
  lnCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const gold = { r: 232, g: 183, b: 48 };
  const blu = { r: 26, g: 111, b: 196 };
  const grn = { r: 52, g: 211, b: 153 };

  // Base node positions + depth layer for parallax
  // depth: 0 = hub (barely moves), 1 = inner (medium), 2 = outer (most sway)
  const hubBase = { bx: 200, by: 200, r: 10, color: gold, depth: 0 };
  const innerRingBase = [
    { bx: 200, by: 100 }, { bx: 287, by: 150 }, { bx: 287, by: 250 },
    { bx: 200, by: 300 }, { bx: 113, by: 250 }, { bx: 113, by: 150 }
  ].map(function (p, i) { return { bx: p.bx, by: p.by, r: 6, color: blu, depth: 1, phase: i * 1.05 }; });

  const outerRingBase = [
    { bx: 200, by: 40 }, { bx: 330, by: 85 }, { bx: 360, by: 200 },
    { bx: 330, by: 315 }, { bx: 200, by: 360 }, { bx: 70, by: 315 },
    { bx: 40, by: 200 }, { bx: 70, by: 85 }
  ].map(function (p, i) { return { bx: p.bx, by: p.by, r: 4, color: blu, depth: 2, phase: i * 0.78 }; });

  var allNodes = [hubBase].concat(innerRingBase).concat(outerRingBase);

  // Channels: hub↔inner, inner↔inner(adjacent), inner↔outer
  var channels = [];
  for (var i = 0; i < innerRingBase.length; i++) {
    channels.push([0, 1 + i]);
  }
  for (var i = 0; i < innerRingBase.length; i++) {
    channels.push([1 + i, 1 + (i + 1) % innerRingBase.length]);
  }
  var innerOuterMap = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5, 6], [5, 6, 7], [0, 7]];
  for (var i = 0; i < innerRingBase.length; i++) {
    var outers = innerOuterMap[i] || [];
    for (var j = 0; j < outers.length; j++) {
      channels.push([1 + i, 7 + outers[j]]);
    }
  }
  channels.push([7, 8]);
  channels.push([9, 10]);
  channels.push([11, 12]);
  channels.push([13, 14]);

  // Payment packets — slower speed
  var packets = [];
  function spawnPacket() {
    var ch = channels[Math.floor(Math.random() * channels.length)];
    var forward = Math.random() > 0.5;
    packets.push({
      fromIdx: forward ? ch[0] : ch[1],
      toIdx: forward ? ch[1] : ch[0],
      progress: 0,
      speed: 0.002 + Math.random() * 0.004,
      color: Math.random() > 0.3 ? gold : grn
    });
  }
  for (var i = 0; i < 4; i++) spawnPacket();

  // 3D parallax sway: compute animated x,y from base position
  function getAnimPos(node, t) {
    var swayAmt = [2, 10, 18][node.depth]; // hub barely, outer most
    var swaySpeed = [0.3, 0.25, 0.2][node.depth];
    var phase = node.phase || 0;
    var dx = Math.sin(t * swaySpeed + phase) * swayAmt;
    var dy = Math.cos(t * swaySpeed * 0.7 + phase + 1.2) * swayAmt * 0.3;
    return { x: node.bx + dx, y: node.by + dy };
  }

  function lnDraw(time) {
    lnCtx.clearRect(0, 0, S, S);
    var t = time * 0.001;

    // Compute current positions
    var pos = allNodes.map(function (n) { return getAnimPos(n, t); });

    // Draw channels
    for (var i = 0; i < channels.length; i++) {
      var a = pos[channels[i][0]];
      var b = pos[channels[i][1]];
      lnCtx.beginPath();
      lnCtx.moveTo(a.x, a.y);
      lnCtx.lineTo(b.x, b.y);
      lnCtx.strokeStyle = 'rgba(26, 111, 196, 0.12)';
      lnCtx.lineWidth = 1;
      lnCtx.stroke();
    }

    // Update & draw packets
    for (var i = packets.length - 1; i >= 0; i--) {
      var pkt = packets[i];
      pkt.progress += pkt.speed;
      if (pkt.progress >= 1) {
        packets.splice(i, 1);
        spawnPacket();
        continue;
      }
      var from = pos[pkt.fromIdx];
      var to = pos[pkt.toIdx];
      var px = from.x + (to.x - from.x) * pkt.progress;
      var py = from.y + (to.y - from.y) * pkt.progress;

      // Glow the channel
      lnCtx.beginPath();
      lnCtx.moveTo(from.x, from.y);
      lnCtx.lineTo(to.x, to.y);
      lnCtx.strokeStyle = 'rgba(' + pkt.color.r + ',' + pkt.color.g + ',' + pkt.color.b + ',0.25)';
      lnCtx.lineWidth = 2;
      lnCtx.stroke();

      // Packet trail
      var grad = lnCtx.createRadialGradient(px, py, 0, px, py, 16);
      grad.addColorStop(0, 'rgba(' + pkt.color.r + ',' + pkt.color.g + ',' + pkt.color.b + ',0.5)');
      grad.addColorStop(1, 'rgba(' + pkt.color.r + ',' + pkt.color.g + ',' + pkt.color.b + ',0)');
      lnCtx.beginPath();
      lnCtx.arc(px, py, 16, 0, Math.PI * 2);
      lnCtx.fillStyle = grad;
      lnCtx.fill();

      // Packet core
      lnCtx.beginPath();
      lnCtx.arc(px, py, 3, 0, Math.PI * 2);
      lnCtx.fillStyle = 'rgba(' + pkt.color.r + ',' + pkt.color.g + ',' + pkt.color.b + ',0.9)';
      lnCtx.fill();
    }

    // Draw nodes
    for (var i = 0; i < allNodes.length; i++) {
      var n = allNodes[i];
      var p = pos[i];
      var pulse = 0.7 + 0.3 * Math.sin(t * 1.2 + i * 0.8);

      // Outer glow
      var glow = lnCtx.createRadialGradient(p.x, p.y, 0, p.x, p.y, n.r * 4);
      glow.addColorStop(0, 'rgba(' + n.color.r + ',' + n.color.g + ',' + n.color.b + ',' + (0.15 * pulse) + ')');
      glow.addColorStop(1, 'rgba(' + n.color.r + ',' + n.color.g + ',' + n.color.b + ',0)');
      lnCtx.beginPath();
      lnCtx.arc(p.x, p.y, n.r * 4, 0, Math.PI * 2);
      lnCtx.fillStyle = glow;
      lnCtx.fill();

      // Node body
      lnCtx.beginPath();
      lnCtx.arc(p.x, p.y, n.r * pulse, 0, Math.PI * 2);
      lnCtx.fillStyle = 'rgba(' + n.color.r + ',' + n.color.g + ',' + n.color.b + ',' + (0.8 * pulse) + ')';
      lnCtx.fill();
    }

    // Hub lightning bolt icon — follows hub position
    var hubPos = pos[0];
    lnCtx.save();
    lnCtx.translate(hubPos.x, hubPos.y);
    lnCtx.scale(0.8, 0.8);
    lnCtx.beginPath();
    lnCtx.moveTo(2, -12);
    lnCtx.lineTo(-8, 2);
    lnCtx.lineTo(0, 2);
    lnCtx.lineTo(-2, 12);
    lnCtx.lineTo(8, -2);
    lnCtx.lineTo(0, -2);
    lnCtx.closePath();
    var boltPulse = 0.7 + 0.3 * Math.sin(t * 1.5);
    lnCtx.fillStyle = 'rgba(232, 183, 48, ' + boltPulse + ')';
    lnCtx.fill();
    lnCtx.restore();

    requestAnimationFrame(lnDraw);
  }

  requestAnimationFrame(lnDraw);
}

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
