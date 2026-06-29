export function toggleDarkMode() {
  if (typeof window === 'undefined') return false;
  const html = document.documentElement;
  const isDark = html.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.querySelectorAll('.dark-mode-toggle i').forEach((icon) => {
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  });
  return isDark;
}

export function syncDarkModeIcons() {
  if (typeof window === 'undefined') return;
  const isDark = document.documentElement.classList.contains('dark-theme');
  document.querySelectorAll('.dark-mode-toggle i').forEach((icon) => {
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  });
}
