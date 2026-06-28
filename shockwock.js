(() => {
  let clicks = 0;
  let overlay = null;

  const ensureOverlay = () => {
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "shockwock-overlay";
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
    return overlay;
  };

  document.querySelectorAll("[data-shockwock]").forEach((element) => {
    const activate = () => {
      clicks += 1;
      ensureOverlay().style.opacity = String(Math.min(0.92, clicks * 0.14));
    };

    element.addEventListener("click", activate);
    element.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });
})();
