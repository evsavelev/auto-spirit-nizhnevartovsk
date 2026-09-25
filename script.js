(() => {
  const story = document.querySelector(".story");
  const scenes = [...document.querySelectorAll("[data-scene]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const rail = document.querySelector(".rail-fill");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!story || !scenes.length || !panels.length) return;

  let ticking = false;

  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));
  const ease = (t) => t * t * (3 - 2 * t);

  function render() {
    ticking = false;

    const rect = story.getBoundingClientRect();
    const maxTravel = Math.max(story.offsetHeight - window.innerHeight, 1);
    const progress = clamp(-rect.top / maxTravel);
    const sceneFloat = progress * scenes.length;
    const index = Math.min(scenes.length - 1, Math.floor(sceneFloat));
    const local = clamp(sceneFloat - index);

    scenes.forEach((scene, i) => {
      const distance = Math.abs(i - sceneFloat);
      const opacity = i === index ? 1 : Math.max(0, 1 - distance * 2.5);
      scene.style.opacity = String(opacity);
      scene.classList.toggle("is-active", i === index);

      const img = scene.querySelector("img");
      if (!img) return;

      if (reduceMotion.matches) {
        img.style.transform = "none";
        return;
      }

      const p = i === index ? ease(local) : i < index ? 1 : 0;
      const directions = [
        { x: 7, y: -2, s: 0.22 },
        { x: 11, y: 3, s: 0.24 },
        { x: -10, y: 5, s: 0.23 },
        { x: -7, y: -3, s: 0.25 }
      ];
      const d = directions[i] || directions[0];
      const scale = 1.04 + d.s * p;
      img.style.transform = `translate3d(${d.x * p}%, ${d.y * p}%, 0) scale(${scale})`;
    });

    panels.forEach((panel, i) => {
      panel.classList.toggle("is-active", i === index);
      panel.setAttribute("aria-hidden", i === index ? "false" : "true");
    });

    if (rail) rail.style.transform = `scaleY(${progress})`;
  }

  function requestRender() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(render);
  }

  window.addEventListener("scroll", requestRender, { passive: true });
  window.addEventListener("resize", requestRender);
  reduceMotion.addEventListener?.("change", requestRender);
  requestRender();
})();