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

    const spawnGrid = () => {
      clearTargets();
      for (let index = 0; index < 9; index += 1) {
        const cell = document.createElement("button");
        cell.className = "shockwock-grid-cell";
        cell.type = "button";
        cell.innerHTML = `<img src="${src}" alt="Shockwock target">`;
        cell.addEventListener("click", (event) => {
          hits += 1;
          shots += 1;
          showFloat(event.clientX, event.clientY, "+1");
          updateHud();
          spawnGrid();
        });
        activeTargets.push(cell);
        arena.appendChild(cell);
      }
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
    let clickPower = 1;
    let critChance = 0.05;
    let autoClickers = 0;
    let timeLeft = 60;
    const { body } = gameShell("Shockwock Clicker", "60 second run");
    body.innerHTML = `
      <div class="shockwock-hud"><span>Time: <strong data-time>60</strong>s</span><span>Shockwocks: <strong data-score>0</strong></span><span>Clicks: <strong data-clicks>0</strong></span></div>
      <button class="shockwock-clicker-button" type="button" aria-label="Click shockwock"><img src="${src}" alt=""></button>
      <div class="shockwock-shop">
        <button type="button" data-buy="power">Power +1 <span data-power-cost>25</span></button>
        <button type="button" data-buy="crit">Crit +5% <span data-crit-cost>40</span></button>
        <button type="button" data-buy="auto">Auto +1/s <span data-auto-cost>60</span></button>
      </div>
    `;
    const scoreNode = body.querySelector("[data-score]");
    const clicksNode = body.querySelector("[data-clicks]");
    const timeNode = body.querySelector("[data-time]");
    const powerCostNode = body.querySelector("[data-power-cost]");
    const critCostNode = body.querySelector("[data-crit-cost]");
    const autoCostNode = body.querySelector("[data-auto-cost]");
    const button = body.querySelector(".shockwock-clicker-button");
    let powerCost = 25;
    let critCost = 40;
    let autoCost = 60;

    const update = () => {
      scoreNode.textContent = String(Math.floor(shockwocks));
      clicksNode.textContent = String(clicks);
      powerCostNode.textContent = String(powerCost);
      critCostNode.textContent = String(critCost);
      autoCostNode.textContent = String(autoCost);
    };

    const addShockwocks = (amount, x = window.innerWidth / 2, y = window.innerHeight / 2, label = null) => {
      shockwocks += amount;
      showFloat(x, y, label ?? `+${amount}`);
      update();
    };

    button.addEventListener("click", (event) => {
      clicks += 1;
      const crit = Math.random() < critChance;
      const amount = clickPower * (crit ? 5 : 1);
      button.classList.remove("pop");
      void button.offsetWidth;
      button.classList.add("pop");
      addShockwocks(amount, event.clientX, event.clientY, crit ? `CRIT +${amount}` : `+${amount}`);
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
      critChance = Math.min(0.5, critChance + 0.05);
      critCost = Math.ceil(critCost * 1.9);
      update();
    });
    body.querySelector('[data-buy="auto"]').addEventListener("click", () => {
      if (shockwocks < autoCost) return;
      shockwocks -= autoCost;
      autoClickers += 1;
      autoCost = Math.ceil(autoCost * 2.1);
      update();
    });

    const auto = setInterval(() => {
      if (autoClickers > 0) addShockwocks(autoClickers, window.innerWidth - 90, 90, `+${autoClickers}/s`);
    }, 1000);
    const timer = setInterval(() => {
      timeLeft -= 1;
      timeNode.textContent = String(timeLeft);
      if (timeLeft <= 0) {
        clearInterval(timer);
        clearInterval(auto);
        resultScreen("Shockwock Clicker", [["Shockwocks", Math.floor(shockwocks)], ["Clicks", clicks], ["Power", clickPower], ["Crit", `${Math.round(critChance * 100)}%`], ["Auto", `${autoClickers}/s`]], openClicker, () => {
          removeExistingGame();
          openClicker();
        });
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
