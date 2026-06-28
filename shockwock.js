(() => {
  const src = "https://cdn.discordapp.com/emojis/1513264198962905159.png?size=128&quality=lossless";

  const spawnShockwock = () => {
    const cat = document.createElement("img");
    cat.className = "bouncing-shockwock";
    cat.src = src;
    cat.alt = "";
    cat.setAttribute("aria-hidden", "true");
    document.body.appendChild(cat);

    const size = 78;
    let x = Math.random() * Math.max(1, window.innerWidth - size);
    let y = Math.random() * Math.max(1, window.innerHeight - size);
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

  document.querySelectorAll("[data-shockwock]").forEach((element) => {
    element.addEventListener("click", spawnShockwock);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        spawnShockwock();
      }
    });
  });
})();
