const EXPIRY_MS = 2 * 60 * 60 * 1000; // 2h

export function saveGameState(data) {
  try {
    localStorage.setItem("hitster_game_state", JSON.stringify({ ...data, timestamp: Date.now() }));
  } catch (_) {}
}

export function clearGameState() {
  localStorage.removeItem("hitster_game_state");
}

export function tryRestoreState() {
  try {
    const raw = localStorage.getItem("hitster_game_state");
    if (!raw) return null;
    const state = JSON.parse(raw);
    if (Date.now() - state.timestamp > EXPIRY_MS || !state.gameActive || !state.currentCard) {
      clearGameState();
      return null;
    }
    return state;
  } catch (_) {
    clearGameState();
    return null;
  }
}
