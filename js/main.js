import { GameEngine, GAME_CONFIG } from "./game-logic.js";
import { UIManager } from "./UIManager.js";

const UIElements = {
  timer: document.getElementById("timer"),
  score: document.getElementById("score"),
  gameContainer: document.getElementById("game-container"),
  startButton: document.getElementById("start"),
  scoreDisplay: document.getElementById("scoreDisplay"),
};

const ui = new UIManager(UIElements);
const game = new GameEngine(ui, GAME_CONFIG);

ui.onStartClick(() => {
  game.start();
});

ui.onBoxClick((boxId) => {
  game.handleBoxClick(boxId);
});