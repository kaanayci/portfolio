/**
 * Algorithme de mélange de Fisher-Yates
 * @param {Array} array - Le tableau à mélanger
 * @returns {Array} Le tableau mélangé
 */
export function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

export function formatTime(s) {
  const min = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${min}:${sec < 10 ? "0" + sec : sec}`;
}
