(() => {
  const src = "https://cdn.discordapp.com/emojis/1513264198962905159.png?size=128&quality=lossless";
  const modes = ["fade", "bounce", "aim", "clicker"];
  const mode = modes[Math.floor(Math.random() * modes.length)];
  let fadeClicks = 0;

  const randomPosition = (size) => ({
    x: Math.random() * Math.max(1, window.innerWidth - size),
    y: Math.random() * Math.max(1, window.innerHeight - size)
  });

  const removeExistingGame = () => {
    document.querySelectorAll(".shockwock-game, .shockwock-counter").forEach((node) => node.remove());
  };

  const spawnBouncer = () => {
    const cat = document.createElement("img");
    cat.className = "bouncing-shockwock";
    cat.src = src;
    cat.alt = "";
    cat.setAttribute("aria-hidden", "true");
    document.body.appendChild(cat);

    const size = 78;
    let { x, y } = randomPosition(size);
    let dx = (Math.random() < 0.5 ? -1 : 1) * (2.2 + Math.random() * 2.8);
    let dy = (Math.random() < 0.5 ? -1 : 1) * (2.2 + Math.random() * 2.8);
    let rotation = Math.random() * 360;
    let spin = (Math.random() < 0.5 ? -1 : 1) * (1.2 + Math.random() * 2.4);

    const tick = () => {
      const maxX = Math.max(0, window.innerWidth - size);
      const maxY = Math.max(0, window.innerHeight - size);
      x += dx;
      y += dy;
      rotation += spin;

      if (x <= 0 || x >= maxX) {
        dx *= -1;
        x = Math.max(0, Math.min(maxX, x));
      }
      if (y <= 0 || y >= maxY) {
        dy *= -1;
        y = Math.max(0, Math.min(maxY, y));
      }

      cat.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;
      requestAnimationFrame(tick);
    };

    tick();
  };

  const fadeIn = () => {
    fadeClicks += 1;
    let overlay = document.querySelector(".shockwock-fade-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "shockwock-fade-overlay";
      overlay.setAttribute("aria-hidden", "true");
      document.body.appendChild(overlay);
    }
    overlay.style.opacity = String(Math.min(0.92, fadeClicks * 0.14));
  };

  const showFloat = (x, y, text = "+1") => {
    const float = document.createElement("div");
    float.className = "shockwock-float";
    float.textContent = text;
    float.style.left = `${x}px`;
    float.style.top = `${y}px`;
    document.body.appendChild(float);
    setTimeout(() => float.remove(), 850);
  };

  const gameShell = (title, subtitle = "") => {
    removeExistingGame();
    const game = document.createElement("div");
    game.className = "shockwock-game";
    game.innerHTML = `
      <div class="shockwock-game-card">
        <button class="shockwock-close" type="button" aria-label="Close">×</button>
        <p class="shockwock-game-title">${title}</p>
        <p class="shockwock-game-subtitle">${subtitle}</p>
        <div class="shockwock-game-body"></div>
      </div>
    `;
    game.querySelector(".shockwock-close").addEventListener("click", () => game.remove());
    document.body.appendChild(game);
    return { game, body: game.querySelector(".shockwock-game-body") };
  };

  const resultScreen = (title, stats, retry, menu) => {
    const { body } = gameShell(title, "Run complete.");
    body.innerHTML = `
      <div class="shockwock-stats">${stats.map(([label, value]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join("")}</div>
      <div class="shockwock-actions">
        <button type="button" data-retry>Retry</button>
        <button type="button" data-menu>Choose mode</button>
      </div>
    `;
    body.querySelector("[data-retry]").addEventListener("click", retry);
    body.querySelector("[data-menu]").addEventListener("click", menu);
  };

  const runAimMode = ({ name, duration, layout }) => {
    const { body } = gameShell(name, `${duration}s run`);
    let hits = 0;
    let shots = 0;
    let timeLeft = duration;
    let activeTargets = [];
    let activeGridSlots = new Set();

    body.innerHTML = `
      <div class="shockwock-hud"><span>Time: <strong data-time>${timeLeft}</strong>s</span><span>Hits: <strong data-hits>0</strong></span><span>Accuracy: <strong data-acc>100%</strong></span></div>
      <div class="shockwock-arena"></div>
    `;
    const arena = body.querySelector(".shockwock-arena");
    const timeNode = body.querySelector("[data-time]");
    const hitsNode = body.querySelector("[data-hits]");
    const accNode = body.querySelector("[data-acc]");

    const updateHud = () => {
      hitsNode.textContent = String(hits);
      accNode.textContent = `${Math.round((hits / Math.max(1, shots)) * 100)}%`;
    };

    const clearTargets = () => {
      activeTargets.forEach((target) => target.remove());
      activeTargets = [];
    };

    const spawnRandom = (size = 64) => {
      const target = document.createElement("img");
      target.className = "shockwock-target in-arena";
      target.src = src;
      target.alt = "Shockwock target";
      const bounds = arena.getBoundingClientRect();
      target.style.left = `${Math.random() * Math.max(1, bounds.width - size)}px`;
      target.style.top = `${Math.random() * Math.max(1, bounds.height - size)}px`;
      target.style.width = `${size}px`;
      target.style.height = `${size}px`;
      target.addEventListener("click", (event) => {
        event.stopPropagation();
        hits += 1;
        shots += 1;
        showFloat(event.clientX, event.clientY, "+1");
        updateHud();
        target.remove();
        activeTargets = activeTargets.filter((item) => item !== target);
        if (layout === "single" || layout === "precision") spawnRandom(layout === "precision" ? 42 : 64);
      });
      activeTargets.push(target);
      arena.appendChild(target);
    };

    const emptyGridSlots = () => Array.from({ length: 9 }, (_, index) => index).filter((index) => !activeGridSlots.has(index));

    const spawnGridTarget = () => {
      const slots = emptyGridSlots();
      if (!slots.length) return;
      const slot = slots[Math.floor(Math.random() * slots.length)];
      activeGridSlots.add(slot);
      const cell = document.createElement("button");
      cell.className = "shockwock-grid-cell active";
      cell.type = "button";
      cell.style.gridColumn = String((slot % 3) + 1);
      cell.style.gridRow = String(Math.floor(slot / 3) + 1);
      cell.innerHTML = `<img src="${src}" alt="Shockwock target">`;
      cell.addEventListener("click", (event) => {
        event.stopPropagation();
        hits += 1;
        shots += 1;
        showFloat(event.clientX, event.clientY, "+1");
        updateHud();
        activeGridSlots.delete(slot);
        cell.remove();
        activeTargets = activeTargets.filter((item) => item !== cell);
        spawnGridTarget();
      });
      activeTargets.push(cell);
      arena.appendChild(cell);
    };

    const spawnGrid = () => {
      clearTargets();
      activeGridSlots = new Set();
      for (let index = 0; index < 3; index += 1) spawnGridTarget();
    };

    arena.addEventListener("click", () => {
      shots += 1;
      updateHud();
    });

    if (layout === "grid") {
      arena.classList.add("grid");
      spawnGrid();
    } else {
      spawnRandom(layout === "precision" ? 42 : 64);
    }

    const timer = setInterval(() => {
      timeLeft -= 1;
      timeNode.textContent = String(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        clearTargets();
        resultScreen(name, [["Hits", hits], ["Shots", shots], ["Accuracy", `${Math.round((hits / Math.max(1, shots)) * 100)}%`]], () => runAimMode({ name, duration, layout }), openAimMenu);
      }
    }, 1000);
  };

  const openAimMenu = () => {
    const { body } = gameShell("Shockwock Aim Trainer", "Choose a mode.");
    body.innerHTML = `
      <div class="shockwock-actions vertical">
        <button type="button" data-mode="timed">Timed 30s</button>
        <button type="button" data-mode="grid">Gridshot 30s</button>
        <button type="button" data-mode="precision">Precision 20s</button>
      </div>
    `;
    body.querySelector('[data-mode="timed"]').addEventListener("click", () => runAimMode({ name: "Timed Shockwocks", duration: 30, layout: "single" }));
    body.querySelector('[data-mode="grid"]').addEventListener("click", () => runAimMode({ name: "Gridshot Shockwocks", duration: 30, layout: "grid" }));
    body.querySelector('[data-mode="precision"]').addEventListener("click", () => runAimMode({ name: "Precision Shockwocks", duration: 20, layout: "precision" }));
  };

  const openClicker = () => {
    let clicks = 0;
    let shockwocks = 0;
    let totalShockwocks = 0;
    let rebirths = 0;
    let baseRate = 1;
    let clickPower = 1;
    let critChance = 0.05;
    let critMultiplier = 5;
    let autoClickers = 0;
    let autoPower = 1;
    let elapsed = 0;
    const { body } = gameShell("Shockwock Clicker", "Endless session");
    body.innerHTML = `
      <div class="shockwock-hud"><span>Time: <strong data-time>0:00</strong></span><span>Shockwocks: <strong data-score>0</strong></span><span>Total: <strong data-total>0</strong></span><span>Rebirths: <strong data-rebirths>0</strong></span></div>
      <button class="shockwock-clicker-button" type="button" aria-label="Click shockwock"><img src="${src}" alt=""></button>
      <div class="shockwock-shop">
        <button type="button" data-buy="power">Click Power +1 <span data-power-cost>25</span></button>
        <button type="button" data-buy="crit">Crit Chance +5% <span data-crit-cost>40</span></button>
        <button type="button" data-buy="critPower">Crit Power +1x <span data-crit-power-cost>120</span></button>
        <button type="button" data-buy="auto">Auto Clicker +1 <span data-auto-cost>60</span></button>
        <button type="button" data-buy="autoPower">Auto Power +1 <span data-auto-power-cost>180</span></button>
        <button type="button" data-buy="rebirth">Rebirth for +1 base <span data-rebirth-cost>1000</span></button>
      </div>
      <p class="shockwock-clicker-note">Base ${baseRate}/click · Click power ${clickPower} · Auto ${autoClickers * autoPower}/s · Crit ${Math.round(critChance * 100)}% x${critMultiplier}</p>
    `;
    const scoreNode = body.querySelector("[data-score]");
    const totalNode = body.querySelector("[data-total]");
    const clicksNode = body.querySelector("[data-clicks]");
    const timeNode = body.querySelector("[data-time]");
    const rebirthNode = body.querySelector("[data-rebirths]");
    const noteNode = body.querySelector(".shockwock-clicker-note");
    const powerCostNode = body.querySelector("[data-power-cost]");
    const critCostNode = body.querySelector("[data-crit-cost]");
    const critPowerCostNode = body.querySelector("[data-crit-power-cost]");
    const autoCostNode = body.querySelector("[data-auto-cost]");
    const autoPowerCostNode = body.querySelector("[data-auto-power-cost]");
    const rebirthCostNode = body.querySelector("[data-rebirth-cost]");
    const button = body.querySelector(".shockwock-clicker-button");
    let powerCost = 25;
    let critCost = 40;
    let critPowerCost = 120;
    let autoCost = 60;
    let autoPowerCost = 180;
    let rebirthCost = 1000;

    const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;

    const update = () => {
      scoreNode.textContent = String(Math.floor(shockwocks));
      totalNode.textContent = String(Math.floor(totalShockwocks));
      clicksNode.textContent = String(clicks);
      timeNode.textContent = formatTime(elapsed);
      rebirthNode.textContent = String(rebirths);
      powerCostNode.textContent = String(powerCost);
      critCostNode.textContent = String(critCost);
      critPowerCostNode.textContent = String(critPowerCost);
      autoCostNode.textContent = String(autoCost);
      autoPowerCostNode.textContent = String(autoPowerCost);
      rebirthCostNode.textContent = String(rebirthCost);
      noteNode.textContent = `Base ${baseRate}/click · Click power ${clickPower} · Auto ${autoClickers * autoPower}/s · Crit ${Math.round(critChance * 100)}% x${critMultiplier}`;
    };

    const addShockwocks = (amount, x = window.innerWidth / 2, y = window.innerHeight / 2, label = null) => {
      shockwocks += amount;
      totalShockwocks += amount;
      showFloat(x, y, label ?? `+${amount}`);
      update();
    };

    button.addEventListener("click", (event) => {
      clicks += 1;
      const crit = Math.random() < critChance;
      const amount = baseRate * clickPower * (crit ? critMultiplier : 1);
      button.classList.remove("pop");
      void button.offsetWidth;
      button.classList.add("pop");
      addShockwocks(amount, event.clientX, event.clientY, crit ? `CRIT +${amount}` : `+${amount}`);
      window.setTimeout(() => button.classList.remove("pop"), 120);
    });

    body.querySelector('[data-buy="power"]').addEventListener("click", () => {
      if (shockwocks < powerCost) return;
      shockwocks -= powerCost;
      clickPower += 1;
      powerCost = Math.ceil(powerCost * 1.8);
      update();
    });
    body.querySelector('[data-buy="crit"]').addEventListener("click", () => {
      if (shockwocks < critCost) return;
      shockwocks -= critCost;
      critChance = Math.min(0.65, critChance + 0.05);
      critCost = Math.ceil(critCost * 1.9);
      update();
    });
    body.querySelector('[data-buy="critPower"]').addEventListener("click", () => {
      if (shockwocks < critPowerCost) return;
      shockwocks -= critPowerCost;
      critMultiplier += 1;
      critPowerCost = Math.ceil(critPowerCost * 2.2);
      update();
    });
    body.querySelector('[data-buy="auto"]').addEventListener("click", () => {
      if (shockwocks < autoCost) return;
      shockwocks -= autoCost;
      autoClickers += 1;
      autoCost = Math.ceil(autoCost * 2.1);
      update();
    });
    body.querySelector('[data-buy="autoPower"]').addEventListener("click", () => {
      if (shockwocks < autoPowerCost) return;
      shockwocks -= autoPowerCost;
      autoPower += 1;
      autoPowerCost = Math.ceil(autoPowerCost * 2.35);
      update();
    });
    body.querySelector('[data-buy="rebirth"]').addEventListener("click", () => {
      if (shockwocks < rebirthCost) return;
      shockwocks = 0;
      clicks = 0;
      rebirths += 1;
      baseRate += 1;
      clickPower = 1;
      critChance = 0.05;
      critMultiplier = 5;
      autoClickers = 0;
      autoPower = 1;
      powerCost = 25 * (rebirths + 1);
      critCost = 40 * (rebirths + 1);
      critPowerCost = 120 * (rebirths + 1);
      autoCost = 60 * (rebirths + 1);
      autoPowerCost = 180 * (rebirths + 1);
      rebirthCost = Math.ceil(rebirthCost * 2.5);
      showFloat(window.innerWidth / 2, window.innerHeight / 2, `REBIRTH ${rebirths}`);
      update();
    });

    const auto = setInterval(() => {
      const amount = autoClickers * autoPower;
      if (amount > 0) addShockwocks(amount, window.innerWidth - 90, 90, `+${amount}/s`);
    }, 1000);
    const timer = setInterval(() => {
      elapsed += document.hidden ? 0 : 1;
      update();
      if (!document.body.contains(button)) {
        clearInterval(timer);
        clearInterval(auto);
      }
    }, 1000);
  };

  const activate = () => {
    if (mode === "fade") fadeIn();
    if (mode === "bounce") spawnBouncer();
    if (mode === "aim") openAimMenu();
    if (mode === "clicker") openClicker();
  };

  const attach = () => {
    document.querySelectorAll("[data-shockwock]").forEach((element) => {
      element.addEventListener("click", activate);
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
    });
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", attach);
  else attach();
})();
