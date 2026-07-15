document.addEventListener("DOMContentLoaded", () => {
  const sequence = [
    { id: "header", delay: 200, fromTop: true }
  ];

  sequence.forEach((item, index) => {
    setTimeout(() => {
      const el = document.getElementById(item.id);
      if (!el) return;

      el.classList.remove("opacity-0");

      if (item.fromTop) {
        el.classList.remove("-translate-y-6");
      } else {
        el.classList.remove("translate-y-4");
      }
    }, item.delay + index * 200);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const sequence = [
    { id: "user-bar", delay: 100 },
    { id: "cards", delay: 200 },
    { id: "agenda", delay: 300 }
  ];

  sequence.forEach((item, index) => {
    setTimeout(() => {
      const el = document.getElementById(item.id);
      if (!el) return;

      el.classList.remove("opacity-0");

      if (item.fromTop) {
        el.classList.remove("-translate-y-6");
      } else {
        el.classList.remove("translate-y-4");
      }
    }, item.delay + index * 100);
  });
});



document.addEventListener("DOMContentLoaded", function() {
    const perfilBtn = document.getElementById("perfil");
    if (perfilBtn) {
        perfilBtn.addEventListener("click", function () {
            window.location.href = "/perfil";
        });
    }
});

