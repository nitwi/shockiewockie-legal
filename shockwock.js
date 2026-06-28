(() => {
  const src = "https://cdn.discordapp.com/emojis/1513264198962905159.png?size=128&quality=lossless";
  const modes = ["fade", "bounce", "aim"];
  const mode = modes[Math.floor(Math.random() * modes.length)];
  let fadeClicks = 0;
  let score = 0;
  let counter = null;

  const randomPosition = (size) => ({
    x: Math.random() * Math.max(1, window.innerWidth - size),
    y: Math.random() * Math.max(1, window.innerHeight - size)
  });

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

  const ensureCounter = () => {
    if (counter) return counter;
    counter = document.createElement("div");
    counter.className = "shockwock-counter";
    document.body.appendChild(counter);
    return counter;
  };

  const updateCounter = () => {
    ensureCounter().textContent = `shockwocks: ${score}`;
  };

  const spawnTarget = () => {
    updateCounter();
    const target = document.createElement("img");
    target.className = "shockwock-target";
    target.src = src;
    target.alt = "Shoot shockwock";
    target.tabIndex = 0;
    const size = 72;
    const { x, y } = randomPosition(size);
    target.style.left = `${x}px`;
    target.style.top = `${y}px`;

    const hit = () => {
      score += 1;
      updateCounter();
      target.remove();
      spawnTarget();
    };

    target.addEventListener("click", hit);
    target.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        hit();
      }
    });

    document.body.appendChild(target);
  };

  const activate = () => {
    if (mode === "fade") fadeIn();
    if (mode === "bounce") spawnBouncer();
    if (mode === "aim") spawnTarget();
  };

  const attach = () => {
    document.querySelectorAll("[data-shockwock]").forEach((element) => {
      element.title = `Shockwock mode: ${mode}`;
      element.addEventListener("click", activate);
      element.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate();
        }
      });
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attach);
  } else {
    attach();
  }
})();
