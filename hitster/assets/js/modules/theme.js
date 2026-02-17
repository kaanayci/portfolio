export function initThemePicker() {
  const picker = document.getElementById("theme-picker");
  if (!picker) return;

  const saved = localStorage.getItem("hitster_theme") || "synthwave";
  document.documentElement.setAttribute("data-theme", saved);
  picker.querySelectorAll(".theme-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.theme === saved);
  });

  picker.addEventListener("click", (e) => {
    const btn = e.target.closest(".theme-btn");
    if (!btn) return;
    const theme = btn.dataset.theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("hitster_theme", theme);
    picker.querySelectorAll(".theme-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
}
