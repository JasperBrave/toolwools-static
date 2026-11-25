// map-panzoom.js — ToolWools interactive map pan/zoom (Phase 3, Worker C).
//
// CONTRACT: COMPONENT-SYSTEM.md Appendix B (pan/zoom spec), audit 06 §14.4.
// CHOICE: viewBox animation, NOT a <g> transform. Why:
//   * The spec's own acceptance is stated in viewBox terms ("Reset returns to
//     viewBox 0 0 1000 1000"; zoom limits as "viewBox width >= 125 units"), so
//     the viewBox IS the state under test — no second representation to drift.
//   * Pins, labels and the silhouette are all drawn in the same 0-1000 SVG
//     space, so zooming the viewBox scales hit areas, pin circles and text
//     together with zero extra bookkeeping (a <g> transform would also need
//     the label <g> and grid kept in sync, and pin hit targets would shrink
//     relative to the pointer at high zoom unless counter-scaled).
//   * No re-render of pins on pan: only the viewBox attribute changes.
//   * Cost: viewBox changes are not CSS-transitionable, so smooth steps are
//     done with a small rAF interpolation (instant under reduced motion).
// No new dependencies. Works per map panel (Leonida regions + Vice City
// districts each get their own controller and their own viewBox state).
// Exposes window.__twPanZoom for automated probing (not a public API).
(function () {
  "use strict";

  var MAP_MIN = 0; // map space is 0..1000 in both axes
  var MAP_MAX = 1000;
  var MIN_W = 125; // max zoom 8x: viewBox width >= 125 units (App. B.1)
  var MAX_W = 1000; // min zoom: whole map visible
  var ZOOM_STEP = Math.SQRT2; // one notch/button/key = one step; 2 steps = 2x
  var DRAG_THRESHOLD_PX = 4; // >= 4px movement = drag, no click fired
  var PAN_STEP_FRAC = 0.1; // arrow key pan = 10% of current view width
  var PAN_STEP_SHIFT_FRAC = 0.25; // Shift+arrow = 25%
  var ANIM_MS = 180;

  var reducedMotion = false;
  try {
    reducedMotion =
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {
    reducedMotion = false;
  }

  function clamp(v, lo, hi) {
    return Math.min(hi, Math.max(lo, v));
  }
  function fmtFactor(f) {
    // 1 -> "1", 1.4142 -> "1.41", 2 -> "2" (trim trailing zeros)
    return String(Math.round(f * 100) / 100);
  }

  // ---- per-panel controller ----
  function PanZoom(wrap) {
    this.wrap = wrap;
    this.viewport = wrap.querySelector(".map-pz-viewport");
    this.svg = wrap.querySelector(".map-svg");
    this.zoomLabel = wrap.querySelector("[data-pz-zoom]");
    this.btnIn = wrap.querySelector("[data-pz-zoom-in]");
    this.btnOut = wrap.querySelector("[data-pz-zoom-out]");
    this.btnReset = wrap.querySelector("[data-pz-reset]");
    this.panel = wrap.closest('[role="tabpanel"]');
    this.vb = { x: 0, y: 0, w: 1000 }; // h == w (square schematic space)
    this.animId = 0;
    this.pointers = new Map(); // pointerId -> {x, y}
    this.dragMoved = false;
    this.dragging = false;
    this.suppressClick = false;
    this.pinch = null; // {startDist, startW, startMid, startVb}
    this.live = document.querySelector("[data-live-region]");
    this.init();
  }

  PanZoom.prototype.apply = function (animate) {
    var self = this;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = 0;
    }
    if (this.animTimer) {
      clearTimeout(this.animTimer);
      this.animTimer = 0;
    }
    var target = { x: this.vb.x, y: this.vb.y, w: this.vb.w };
    var doSet = function (vb) {
      self.svg.setAttribute(
        "viewBox",
        vb.x + " " + vb.y + " " + vb.w + " " + vb.w
      );
    };
    if (!animate || reducedMotion) {
      doSet(target);
      this.afterViewChange();
      return;
    }
    var current = this.svg
      .getAttribute("viewBox")
      .split(/\s+/)
      .map(Number);
    var from = { x: current[0], y: current[1], w: current[2] };
    var start = null;
    var step = function () {
      // Wall-clock progress (performance.now), not the rAF timestamp:
      // in headless/throttled environments BeginFrame timestamps can lag
      // wall clock, which would stretch a 180ms animation indefinitely.
      var now = performance.now();
      if (start === null) start = now;
      var t = clamp((now - start) / ANIM_MS, 0, 1);
      var e = 1 - Math.pow(1 - t, 3); // easeOutCubic
      doSet({
        x: from.x + (target.x - from.x) * e,
        y: from.y + (target.y - from.y) * e,
        w: from.w + (target.w - from.w) * e,
      });
      if (t < 1) {
        self.animId = requestAnimationFrame(step);
      } else {
        self.animId = 0;
        doSet(target); // snap to the exact target (no FP residue)
        self.afterViewChange();
      }
    };
    this.animId = requestAnimationFrame(step);
    // Wall-clock backstop: if rAF stalls entirely (throttled/headless),
    // still land exactly on the target on time instead of hanging mid-zoom.
    this.animTimer = setTimeout(function () {
      if (self.animId) {
        cancelAnimationFrame(self.animId);
        self.animId = 0;
        doSet(target);
        self.afterViewChange();
      }
    }, ANIM_MS + 50);
  };

  // Clamp so at least 25% of the viewport always shows map content:
  // the visible map overlap must be >= w/2 wide AND >= w/2 tall.
  PanZoom.prototype.clampPan = function (vb) {
    var half = vb.w / 2;
    vb.x = clamp(vb.x, MAP_MIN - half, MAP_MAX - half);
    vb.y = clamp(vb.y, MAP_MIN - half, MAP_MAX - half);
    return vb;
  };

  PanZoom.prototype.setView = function (vb, animate) {
    vb.w = clamp(vb.w, MIN_W, MAX_W);
    this.clampPan(vb);
    this.vb = vb;
    this.apply(animate);
  };

  PanZoom.prototype.updateZoomLabel = function () {
    if (!this.zoomLabel) return;
    var factor = MAX_W / this.vb.w;
    this.zoomLabel.textContent =
      factor === 1 ? "Zoom 100%" : "Zoom " + fmtFactor(factor) + "×";
  };

  PanZoom.prototype.pinCenter = function (pin) {
    var circles = pin.querySelectorAll("circle");
    var dot = circles[circles.length - 1];
    if (!dot) return null;
    return {
      x: parseFloat(dot.getAttribute("cx")),
      y: parseFloat(dot.getAttribute("cy")),
    };
  };

  // Off-view pins are tabindex="-1" until panned into view (App. B.2).
  // Pins hidden by the layer/evidence/search filters (display:none) are
  // also -1; pins in the hidden tabpanel are -1.
  PanZoom.prototype.updatePinTabindex = function () {
    var self = this;
    var panelHidden = this.panel && this.panel.hidden;
    this.svg.querySelectorAll(".map-pin").forEach(function (pin) {
      var c = self.pinCenter(pin);
      var inView =
        !panelHidden &&
        pin.style.display !== "none" &&
        c !== null &&
        c.x >= self.vb.x &&
        c.x <= self.vb.x + self.vb.w &&
        c.y >= self.vb.y &&
        c.y <= self.vb.y + self.vb.w;
      pin.setAttribute("tabindex", inView ? "0" : "-1");
    });
  };

  PanZoom.prototype.afterViewChange = function () {
    this.updateZoomLabel();
    this.updatePinTabindex();
  };

  // Zoom by one discrete step around a point given in CLIENT pixels.
  // factor > 1 zooms in. Point stays fixed under the cursor.
  PanZoom.prototype.zoomAtClient = function (clientX, clientY, factor) {
    var rect = this.svg.getBoundingClientRect();
    if (rect.width === 0) return;
    var fx = (clientX - rect.left) / rect.width;
    var fy = (clientY - rect.top) / rect.height;
    var mapX = this.vb.x + fx * this.vb.w;
    var mapY = this.vb.y + fy * this.vb.w;
    var newW = clamp(this.vb.w / factor, MIN_W, MAX_W);
    this.setView(
      { x: mapX - fx * newW, y: mapY - fy * newW, w: newW },
      true
    );
  };

  PanZoom.prototype.zoomStep = function (dir, animate) {
    // dir +1 = in, -1 = out, centred on the current view centre.
    var rect = this.svg.getBoundingClientRect();
    this.zoomAtClient(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      dir > 0 ? ZOOM_STEP : 1 / ZOOM_STEP
    );
    if (animate === false) this.apply(false);
  };

  PanZoom.prototype.panBy = function (dxMap, dyMap, animate) {
    this.setView(
      { x: this.vb.x + dxMap, y: this.vb.y + dyMap, w: this.vb.w },
      animate
    );
  };

  PanZoom.prototype.reset = function (animate) {
    this.setView({ x: 0, y: 0, w: 1000 }, animate);
    this.announce("Vue de la carte réinitialisée. Toute la carte est visible.");
  };

  PanZoom.prototype.announce = function (text) {
    if (this.live) this.live.textContent = text;
  };

  // If a selected pin is outside the current view, pan the minimum
  // distance to bring it into view (App. B.1). Zoom is never changed.
  PanZoom.prototype.ensurePinVisible = function (pin) {
    var c = this.pinCenter(pin);
    if (!c) return;
    var margin = this.vb.w * 0.08;
    var nx = this.vb.x;
    var ny = this.vb.y;
    if (c.x < this.vb.x + margin) nx = c.x - margin;
    else if (c.x > this.vb.x + this.vb.w - margin)
      nx = c.x - this.vb.w + margin;
    if (c.y < this.vb.y + margin) ny = c.y - margin;
    else if (c.y > this.vb.y + this.vb.w - margin)
      ny = c.y - this.vb.w + margin;
    if (nx !== this.vb.x || ny !== this.vb.y) {
      this.setView({ x: nx, y: ny, w: this.vb.w }, true);
      var name =
        pin.getAttribute("aria-label") || pin.dataset.regionId || "lieu";
      this.announce("Déplacé pour montrer " + name + ".");
    }
  };

  PanZoom.prototype.init = function () {
    var self = this;
    if (!this.svg || !this.viewport) return;

    // --- zoom buttons + reset (real <button>s, in tab order before the map)
    if (this.btnIn)
      this.btnIn.addEventListener("click", function () {
        self.zoomStep(1, true);
      });
    if (this.btnOut)
      this.btnOut.addEventListener("click", function () {
        self.zoomStep(-1, true);
      });
    if (this.btnReset)
      this.btnReset.addEventListener("click", function () {
        // Focus stays on Reset (App. B.1) — we never move it.
        self.reset(true);
      });

    // --- wheel zoom toward the cursor; passive:false so the page never
    // scrolls while zooming over the map (App. B.1).
    this.viewport.addEventListener(
      "wheel",
      function (e) {
        e.preventDefault();
        self.zoomAtClient(e.clientX, e.clientY, e.deltaY < 0 ? ZOOM_STEP : 1 / ZOOM_STEP);
      },
      { passive: false }
    );

    // --- pointer drag pan + pinch (one path for mouse + touch).
    // No setPointerCapture: capturing would retarget the click to the
    // viewport and break pin tap-to-select. Window-level move/up listeners
    // track the gesture instead; the click is suppressed only after a real
    // drag (>= 4px) via a capture-phase click guard on the wrap.
    this.viewport.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0 && e.pointerType === "mouse")
        return;
      self.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      self.dragMoved = false;
      self.dragging = false;
      if (self.pointers.size === 2) {
        var pts = Array.from(self.pointers.values());
        var dx = pts[0].x - pts[1].x;
        var dy = pts[0].y - pts[1].y;
        self.pinch = {
          startDist: Math.hypot(dx, dy),
          startW: self.vb.w,
          startMid: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
          startVb: { x: self.vb.x, y: self.vb.y, w: self.vb.w },
        };
      }
      self.viewport.classList.add("pz-active");
    });

    window.addEventListener("pointermove", function (e) {
      if (!self.pointers.has(e.pointerId)) return;
      var prev = self.pointers.get(e.pointerId);
      var movedPx = Math.hypot(e.clientX - prev.x, e.clientY - prev.y);
      // Total movement from gesture start decides drag vs tap.
      var start = self.gestureStart || prev;
      self.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (self.pointers.size === 2 && self.pinch) {
        var pts = Array.from(self.pointers.values());
        var dx = pts[0].x - pts[1].x;
        var dy = pts[0].y - pts[1].y;
        var dist = Math.hypot(dx, dy);
        var mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 };
        if (dist > 0 && self.pinch.startDist > 0) {
          // Pinch zoom toward the midpoint (continuous, clamped).
          var rect = self.svg.getBoundingClientRect();
          var fx = (mid.x - rect.left) / rect.width;
          var fy = (mid.y - rect.top) / rect.height;
          var mapMidX = self.pinch.startVb.x + fx * self.pinch.startVb.w;
          var mapMidY = self.pinch.startVb.y + fy * self.pinch.startVb.w;
          var newW = clamp(
            self.pinch.startW / (dist / self.pinch.startDist),
            MIN_W,
            MAX_W
          );
          // Two-finger drag pans by the midpoint's movement.
          var panDx =
            ((mid.x - self.pinch.startMid.x) / rect.width) * newW;
          var panDy =
            ((mid.y - self.pinch.startMid.y) / rect.height) * newW;
          self.setView(
            { x: mapMidX - fx * newW - panDx, y: mapMidY - fy * newW - panDy, w: newW },
            false
          );
          self.dragMoved = true;
          self.dragging = true;
        }
        return;
      }
      if (self.pointers.size === 1) {
        if (!self.gestureStart) self.gestureStart = { x: prev.x, y: prev.y, vb: { x: self.vb.x, y: self.vb.y, w: self.vb.w } };
        var total = Math.hypot(
          e.clientX - self.gestureStart.x,
          e.clientY - self.gestureStart.y
        );
        if (total >= DRAG_THRESHOLD_PX) {
          self.dragMoved = true;
          self.dragging = true;
          self.viewport.classList.add("pz-dragging");
          var rect2 = self.svg.getBoundingClientRect();
          var dxMap = ((e.clientX - self.gestureStart.x) / rect2.width) * self.vb.w;
          var dyMap = ((e.clientY - self.gestureStart.y) / rect2.height) * self.vb.w;
          // Pan from the gesture-start viewBox so repeated moves do not
          // accumulate rounding error.
          self.setView(
            {
              x: self.gestureStart.vb.x - dxMap,
              y: self.gestureStart.vb.y - dyMap,
              w: self.vb.w,
            },
            false
          );
        }
      }
    });

    function endPointer(e) {
      if (!self.pointers.has(e.pointerId)) return;
      self.pointers.delete(e.pointerId);
      if (self.pointers.size < 2) self.pinch = null;
      if (self.pointers.size === 0) {
        self.viewport.classList.remove("pz-active", "pz-dragging");
        if (self.dragMoved) {
          // A drag, not a tap: suppress the click that fires on release.
          self.suppressClick = true;
          setTimeout(function () {
            self.suppressClick = false;
          }, 0);
        }
        self.dragMoved = false;
        self.dragging = false;
        self.gestureStart = null;
      }
    }
    window.addEventListener("pointerup", endPointer);
    window.addEventListener("pointercancel", endPointer);

    // Capture-phase click guard: a drag must never select a pin.
    // A tap (no movement) passes through untouched, so pin selection
    // and the list-chip click below still work.
    this.wrap.addEventListener(
      "click",
      function (e) {
        if (self.suppressClick) {
          e.preventDefault();
          e.stopPropagation();
          self.suppressClick = false;
        }
      },
      true
    );

    // --- keyboard: arrows pan, +/- zoom, 0 resets. Attached to the wrap
    // so it also fires when a pin has focus (pins bubble up). Tab is never
    // intercepted, so focus can always leave the map (no trap). Inputs,
    // selects and textareas are excluded so typing/search still works.
    this.wrap.addEventListener("keydown", function (e) {
      var t = e.target;
      if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
      var step = e.shiftKey ? PAN_STEP_SHIFT_FRAC : PAN_STEP_FRAC;
      var d = self.vb.w * step;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        self.panBy(-d, 0, true);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        self.panBy(d, 0, true);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        self.panBy(0, -d, true);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        self.panBy(0, d, true);
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        self.zoomStep(1, true);
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        self.zoomStep(-1, true);
      } else if (e.key === "0") {
        e.preventDefault();
        self.reset(true);
      }
    });

    // --- selecting a pin (map or list chip) while zoomed keeps the zoom;
    // pan only the minimum distance if the pin is outside the view.
    // This listener is registered after interactive-map.js's own click
    // handlers, so it runs after the detail panel has updated.
    this.panel.addEventListener("click", function (e) {
      var pin = e.target.closest ? e.target.closest(".map-pin") : null;
      var chip = e.target.closest ? e.target.closest("[data-chip-id]") : null;
      var id = pin ? pin.dataset.regionId : chip ? chip.dataset.chipId : null;
      if (!id) return;
      setTimeout(function () {
        var target = self.svg.querySelector(
          '.map-pin[data-region-id="' + id + '"]'
        );
        if (target) self.ensurePinVisible(target);
      }, 0);
    });

    // --- keep off-view tabindex honest when filters change the visible set
    // (interactive-map.js toggles pin display on layer/evidence/search).
    if (window.MutationObserver) {
      var obs = new MutationObserver(function () {
        self.updatePinTabindex();
      });
      obs.observe(this.svg, {
        attributes: true,
        attributeFilter: ["style"],
        subtree: true,
      });
    }

    this.apply(false);
  };

  // ---- dataset-failure fallback (App. B.2) ----
  // interactive-map.js (staging copy) sets window.__twMapReady = true at
  // the end of a successful load. If it never arrives, the map is not a
  // blank area: show the honest message + a text list of regions built
  // from the page's own static region/district tables.
  function showFallback() {
    var box = document.querySelector("[data-pz-fallback]");
    if (!box || !box.hidden) return;
    var list = box.querySelector("[data-pz-fallback-list]");
    var names = [];
    document
      .querySelectorAll(
        'section[aria-labelledby="regions-table"] tbody th, section[aria-labelledby="districts-table"] tbody th'
      )
      .forEach(function (th) {
        names.push(th.textContent.trim());
      });
    if (list) {
      list.innerHTML = names
        .map(function (n) {
          return "<li>" + n.replace(/</g, "&lt;") + "</li>";
        })
        .join("");
    }
    box.hidden = false;
  }

  function init() {
    var instances = [];
    document.querySelectorAll(".map-wrap").forEach(function (wrap) {
      if (wrap.querySelector(".map-svg") && wrap.querySelector(".map-pz-viewport")) {
        instances.push(new PanZoom(wrap));
      }
    });
    window.__twPanZoom = {
      instances: instances,
      minWidth: MIN_W,
      maxWidth: MAX_W,
      // Probe helpers: state of the visible (regions) panel by default.
      state: function (i) {
        var inst = instances[i || 0];
        return inst
          ? { x: inst.vb.x, y: inst.vb.y, w: inst.vb.w, zoom: MAX_W / inst.vb.w }
          : null;
      },
    };
    // Re-apply pin tabindex when the tab switches (panel visibility changes).
    document.querySelectorAll("[data-map-tab]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        setTimeout(function () {
          instances.forEach(function (inst) {
            inst.updatePinTabindex();
          });
        }, 0);
      });
    });
    // Dataset failure: check once the module had time to run.
    setTimeout(function () {
      if (!window.__twMapReady) showFallback();
    }, 2500);
  }

  window.addEventListener("error", function (e) {
    if (
      e &&
      e.filename &&
      (e.filename.indexOf("map-data.js") !== -1 ||
        e.filename.indexOf("interactive-map.js") !== -1)
    ) {
      showFallback();
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
