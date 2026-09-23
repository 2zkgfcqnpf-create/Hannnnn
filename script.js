(function () {
  "use strict";

  const root = document.getElementById("experience");
  const canvas = document.getElementById("circuit-canvas");
  const ctx = canvas.getContext("2d", { alpha: true });
  const enableCanvasEffects = true;
  canvas.hidden = !enableCanvasEffects;
  const controls = Array.from(document.querySelectorAll("[data-scene]"));
  const navItems = Array.from(document.querySelectorAll(".nav-item"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  const depthValue = document.getElementById("depth-value");
  const leadForm = document.getElementById("lead-form");
  const formStatus = document.getElementById("form-status");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sceneOrder = ["home", "solutions", "cases", "about", "contact"];

  const sceneConfig = {
    home: {
      depth: 1,
      pulse: [0.7, 0.46],
      intensity: 0.38,
      speed: 0.000072,
      tail: 0.1,
      routes: [
        [[0.42, 0.68], [0.51, 0.63], [0.6, 0.56], [0.7, 0.5], [0.84, 0.47], [0.98, 0.46]],
        [[0.49, 0.44], [0.58, 0.47], [0.66, 0.45], [0.75, 0.39], [0.91, 0.37]],
        [[0.53, 0.76], [0.59, 0.66], [0.68, 0.59], [0.81, 0.59], [0.96, 0.68]],
        [[0.6, 0.29], [0.65, 0.38], [0.73, 0.45], [0.84, 0.5], [0.97, 0.55]],
      ],
    },
    solutions: {
      depth: 2,
      pulse: [0.7, 0.465],
      intensity: 0.58,
      speed: 0.000084,
      tail: 0.09,
      routes: [
        [[0.34, 0.7], [0.46, 0.64], [0.57, 0.56], [0.7, 0.5], [0.84, 0.47], [0.98, 0.45]],
        [[0.4, 0.44], [0.52, 0.48], [0.62, 0.45], [0.71, 0.39], [0.9, 0.36]],
        [[0.47, 0.79], [0.55, 0.68], [0.67, 0.59], [0.82, 0.59], [0.97, 0.69]],
        [[0.55, 0.25], [0.62, 0.36], [0.71, 0.45], [0.84, 0.51], [0.98, 0.56]],
        [[0.46, 0.58], [0.57, 0.54], [0.67, 0.5], [0.79, 0.53], [0.93, 0.62]],
      ],
    },
    cases: {
      depth: 3,
      pulse: [0.69, 0.47],
      intensity: 0.78,
      speed: 0.0001,
      tail: 0.085,
      routes: [
        [[0.24, 0.72], [0.38, 0.64], [0.51, 0.57], [0.64, 0.51], [0.79, 0.45], [0.97, 0.42]],
        [[0.28, 0.44], [0.42, 0.47], [0.54, 0.45], [0.66, 0.39], [0.82, 0.36], [0.98, 0.39]],
        [[0.33, 0.84], [0.43, 0.72], [0.55, 0.62], [0.68, 0.59], [0.84, 0.65], [0.98, 0.76]],
        [[0.42, 0.21], [0.49, 0.33], [0.59, 0.43], [0.71, 0.5], [0.89, 0.54]],
        [[0.31, 0.59], [0.45, 0.56], [0.57, 0.53], [0.7, 0.54], [0.88, 0.62]],
        [[0.54, 0.78], [0.59, 0.66], [0.68, 0.56], [0.8, 0.49], [0.96, 0.45]],
      ],
    },
    about: {
      depth: 4,
      pulse: [0.675, 0.47],
      intensity: 0.98,
      speed: 0.00012,
      tail: 0.08,
      routes: [
        [[0.16, 0.74], [0.3, 0.65], [0.43, 0.57], [0.55, 0.52], [0.67, 0.47], [0.83, 0.42], [0.98, 0.4]],
        [[0.2, 0.41], [0.34, 0.44], [0.48, 0.47], [0.59, 0.49], [0.72, 0.52], [0.9, 0.58]],
        [[0.32, 0.88], [0.42, 0.73], [0.54, 0.62], [0.67, 0.47], [0.73, 0.34], [0.8, 0.17]],
        [[0.49, 0.13], [0.53, 0.28], [0.59, 0.4], [0.67, 0.47], [0.81, 0.53], [0.98, 0.65]],
        [[0.26, 0.6], [0.4, 0.57], [0.53, 0.53], [0.67, 0.47], [0.8, 0.44], [0.92, 0.3]],
        [[0.43, 0.8], [0.51, 0.67], [0.59, 0.57], [0.67, 0.47], [0.69, 0.33], [0.67, 0.18]],
      ],
    },
    contact: {
      depth: 5,
      pulse: [0.592, 0.472],
      intensity: 1.46,
      speed: 0.00029,
      tail: 0.052,
      routes: [
        [[0.03, 0.72], [0.14, 0.67], [0.26, 0.61], [0.39, 0.55], [0.52, 0.5], [0.64, 0.44], [0.78, 0.36]],
        [[0.08, 0.46], [0.21, 0.49], [0.33, 0.51], [0.47, 0.49], [0.59, 0.47], [0.74, 0.48], [0.94, 0.45]],
        [[0.22, 0.91], [0.31, 0.79], [0.41, 0.67], [0.5, 0.57], [0.59, 0.47], [0.66, 0.33], [0.73, 0.16]],
        [[0.37, 0.08], [0.42, 0.23], [0.48, 0.36], [0.54, 0.43], [0.59, 0.47], [0.72, 0.53], [0.91, 0.61]],
        [[0.98, 0.26], [0.88, 0.33], [0.78, 0.39], [0.68, 0.44], [0.59, 0.47], [0.48, 0.54], [0.36, 0.66]],
        [[0.98, 0.76], [0.87, 0.67], [0.77, 0.59], [0.67, 0.52], [0.59, 0.47], [0.49, 0.4], [0.36, 0.31]],
        [[0.6, 0.97], [0.6, 0.82], [0.59, 0.67], [0.59, 0.55], [0.59, 0.47], [0.59, 0.34], [0.6, 0.17]],
        [[0.04, 0.87], [0.18, 0.8], [0.33, 0.72], [0.47, 0.63], [0.59, 0.55], [0.73, 0.47], [0.92, 0.39]],
        [[0.13, 0.24], [0.26, 0.31], [0.39, 0.37], [0.5, 0.42], [0.59, 0.47], [0.71, 0.58], [0.84, 0.71]],
      ],
    },
  };

  const state = {
    view: "home",
    width: 0,
    height: 0,
    dpr: 1,
    burst: 0.48,
    lastTime: performance.now(),
    lastDrawnAt: 0,
    reducedMotion: reducedMotion.matches,
  };

  const frameInterval = 1000 / 12;

  function resize() {
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    state.dpr = 1;
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  }

  function pointsForRoute(route) {
    return route.map(([x, y]) => ({ x: x * state.width, y: y * state.height }));
  }

  function routeMetrics(points) {
    const lengths = [];
    let total = 0;
    for (let index = 0; index < points.length - 1; index += 1) {
      const length = Math.hypot(points[index + 1].x - points[index].x, points[index + 1].y - points[index].y);
      lengths.push(length);
      total += length;
    }
    return { lengths, total };
  }

  function pointAt(points, metrics, progress) {
    const target = Math.max(0, Math.min(1, progress)) * metrics.total;
    let travelled = 0;
    for (let index = 0; index < metrics.lengths.length; index += 1) {
      const next = travelled + metrics.lengths[index];
      if (target <= next) {
        const local = (target - travelled) / Math.max(1, metrics.lengths[index]);
        return {
          x: points[index].x + (points[index + 1].x - points[index].x) * local,
          y: points[index].y + (points[index + 1].y - points[index].y) * local,
        };
      }
      travelled = next;
    }
    return points[points.length - 1];
  }

  function traceRoute(points) {
    if (points.length < 2) return;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let index = 1; index < points.length; index += 1) {
      const point = points[index];
      const previous = points[index - 1];
      ctx.quadraticCurveTo(previous.x, previous.y, (previous.x + point.x) * 0.5, (previous.y + point.y) * 0.5);
    }
    const last = points[points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  function drawPulse(points, metrics, head, strength, tailLength) {
    const normalizedHead = ((head % 1) + 1) % 1;
    const trailStart = Math.max(0, normalizedHead - tailLength);
    const trail = [];
    for (let index = 0; index <= 10; index += 1) {
      const progress = trailStart + ((normalizedHead - trailStart) * index) / 10;
      trail.push(pointAt(points, metrics, progress));
    }
    if (trail.length < 2) return;

    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 5 + strength * 2.4;
    ctx.strokeStyle = `rgba(23, 105, 255, ${0.1 + strength * 0.075})`;
    traceRoute(trail);
    ctx.stroke();
    ctx.lineWidth = 2.2 + strength * 1.2;
    ctx.strokeStyle = `rgba(24, 221, 236, ${0.25 + strength * 0.18})`;
    traceRoute(trail);
    ctx.stroke();
    ctx.lineWidth = 1 + strength * 0.72;
    ctx.strokeStyle = `rgba(238, 255, 255, ${0.64 + Math.min(strength, 1.4) * 0.23})`;
    traceRoute(trail.slice(8));
    ctx.stroke();

    const tip = trail[trail.length - 1];
    const glowRadius = 15 + strength * 11;
    const glow = ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, glowRadius);
    glow.addColorStop(0, `rgba(250, 255, 255, ${Math.min(1, 0.72 * strength)})`);
    glow.addColorStop(0.2, `rgba(52, 228, 236, ${0.34 * strength})`);
    glow.addColorStop(1, "rgba(32, 96, 255, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(tip.x, tip.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCore(config, time, strength) {
    const x = config.pulse[0] * state.width;
    const y = config.pulse[1] * state.height;
    const breathe = state.reducedMotion ? 1 : 0.86 + Math.sin(time * 0.004) * 0.14;
    const radius = (28 + state.burst * 46 + config.depth * 3) * breathe;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, radius);
    glow.addColorStop(0, `rgba(247, 255, 255, ${0.25 + state.burst * 0.4})`);
    glow.addColorStop(0.14, `rgba(54, 226, 235, ${0.15 + state.burst * 0.24})`);
    glow.addColorStop(0.55, `rgba(40, 106, 255, ${0.045 + strength * 0.024})`);
    glow.addColorStop(1, "rgba(25, 72, 205, 0)");
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function draw(time) {
    const config = sceneConfig[state.view];
    const delta = Math.min(40, time - state.lastTime);
    state.lastTime = time;
    state.burst = Math.max(0, state.burst - delta * (state.reducedMotion ? 0.004 : 0.00072));
    ctx.clearRect(0, 0, state.width, state.height);
    const strength = config.intensity + state.burst * 0.7;

    config.routes.forEach((route, routeIndex) => {
      const points = pointsForRoute(route);
      const metrics = routeMetrics(points);
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = state.view === "contact" ? 1.25 : 1.05;
      ctx.strokeStyle = `rgba(36, 160, 226, ${0.03 + strength * 0.026})`;
      traceRoute(points);
      ctx.stroke();
      ctx.restore();

      const speed = state.reducedMotion ? 0 : config.speed + routeIndex * 0.000004;
      const head = time * speed + routeIndex * 0.147;
      drawPulse(points, metrics, head, strength, config.tail);
    });

    drawCore(config, time, strength);
  }

  function animate(time) {
    if (!document.hidden && !state.reducedMotion && time - state.lastDrawnAt >= frameInterval) {
      state.lastDrawnAt = time;
      draw(time);
    }
    requestAnimationFrame(animate);
  }

  function charge() {
    root.classList.remove("is-charging");
    void root.offsetWidth;
    root.classList.add("is-charging");
    state.burst = state.reducedMotion ? 0.22 : 1;
  }

  function setView(view, updateHash = true) {
    if (!sceneConfig[view]) return;
    const config = sceneConfig[view];
    state.view = view;
    root.dataset.view = view;
    root.style.setProperty("--pulse-x", `${config.pulse[0] * 100}%`);
    root.style.setProperty("--pulse-y", `${config.pulse[1] * 100}%`);
    root.style.setProperty("--depth", `${config.depth * 20}%`);
    depthValue.textContent = String(config.depth).padStart(2, "0");

    navItems.forEach((item) => {
      const active = item.dataset.scene === view;
      item.classList.toggle("is-active", active);
      if (active) item.setAttribute("aria-current", "page");
      else item.removeAttribute("aria-current");
    });

    panels.forEach((panel) => {
      const active = panel.dataset.panel === view;
      panel.classList.toggle("is-active", active);
      panel.setAttribute("aria-hidden", String(!active));
      if (active) {
        panel.scrollTop = 0;
        const scrollSurface = panel.querySelector(".panel-inner--wide");
        if (scrollSurface) scrollSurface.scrollTop = 0;
      }
    });

    if (updateHash && window.location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
    charge();
    if (enableCanvasEffects) requestAnimationFrame(draw);
  }

  function markInvalidFields() {
    Array.from(leadForm.elements).forEach((field) => {
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
        if (!field.validity.valid) field.setAttribute("aria-invalid", "true");
        else field.removeAttribute("aria-invalid");
      }
    });
  }

  async function submitLead(event) {
    event.preventDefault();
    formStatus.className = "";
    formStatus.textContent = "";
    markInvalidFields();
    if (!leadForm.checkValidity()) {
      formStatus.className = "is-error";
      formStatus.textContent = "请完整填写必填项，并确认信息用途。";
      leadForm.querySelector(":invalid")?.focus();
      return;
    }

    const payload = Object.fromEntries(new FormData(leadForm).entries());
    const endpoint = root.dataset.leadEndpoint.trim();
    if (!endpoint) {
      formStatus.className = "is-success";
      formStatus.textContent = "信息格式已校验。正式上线时接入企业线索系统后即可提交。";
      return;
    }

    const submitButton = leadForm.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "提交中…";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("submit failed");
      leadForm.reset();
      formStatus.className = "is-success";
      formStatus.textContent = "提交成功，我们会尽快与您联系。";
    } catch (_error) {
      formStatus.className = "is-error";
      formStatus.textContent = "暂未提交成功，请拨打 151 0151 2159。";
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "提交咨询";
    }
  }

  controls.forEach((control) => {
    control.addEventListener("click", (event) => {
      if (control.tagName === "A") event.preventDefault();
      setView(control.dataset.scene);
    });
  });
  leadForm.addEventListener("submit", submitLead);
  leadForm.addEventListener("input", (event) => {
    event.target.removeAttribute?.("aria-invalid");
    formStatus.textContent = "";
    formStatus.className = "";
  });
  window.addEventListener("hashchange", () => {
    const view = window.location.hash.slice(1);
    if (sceneOrder.includes(view)) setView(view, false);
  });
  window.addEventListener("resize", () => {
    resize();
    if (enableCanvasEffects) requestAnimationFrame(draw);
  }, { passive: true });
  reducedMotion.addEventListener("change", (event) => {
    state.reducedMotion = event.matches;
    if (enableCanvasEffects) requestAnimationFrame(draw);
  });

  ["./tokenvolt-chip-approved-master.png", "./assets/chip-interior.png"].forEach((source) => {
    const image = new Image();
    image.src = source;
  });

  const initialView = window.location.hash.slice(1);
  resize();
  setView(sceneOrder.includes(initialView) ? initialView : "home", false);
  if (enableCanvasEffects) requestAnimationFrame(animate);
})();
