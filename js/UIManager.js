import { setCurrentTime } from "./utils.js";

class UIManager {
  constructor({ timer, score, gameContainer, startButton, scoreDisplay }) {
    this.timer = timer;
    this.score = score;
    this.gameContainer = gameContainer;
    this.startButton = startButton;
    this.scoreDisplay = scoreDisplay;

    this.startClickHandler = null;
    this.boxClickHandler = null;

    if (this.startButton) {
      this.startButton.addEventListener("click", () => {
        if (typeof this.startClickHandler === "function") {
          this.startClickHandler();
        }
      });
    }

    if (this.gameContainer) {
      this.gameContainer.addEventListener("click", (event) => {
        const target = event.target.closest(".box");
        const boxId = target?.dataset?.boxId;
        if (!boxId) return;

        // Play click shrink/fade animation, then notify engine.
        const animation = target.animate(
          [
            { transform: "scale(1)", opacity: 1 },
            { transform: "scale(0)", opacity: 0 },
          ],
          {
            duration: 150,
            easing: "ease-in",
            fill: "forwards",
          }
        );

        animation.onfinish = () => {
          if (typeof this.boxClickHandler === "function") {
            this.boxClickHandler(boxId);
          }
        };
      });
    }
  }

  onStartClick(callback) {
    this.startClickHandler = callback;
  }

  onBoxClick(callback) {
    this.boxClickHandler = callback;
  }

  resetView() {
    if (this.gameContainer) {
      this.gameContainer.querySelectorAll(".box").forEach((box) => box.remove());
    }
    if (this.scoreDisplay) {
      this.scoreDisplay.hidden = true;
    }
  }

  hideHUDElements() {
    if (this.startButton) {
      this.startButton.hidden = true;
    }
    if (this.scoreDisplay) {
      this.scoreDisplay.hidden = true;
    }
  }

  showStartButton() {
    if (this.startButton) {
      this.startButton.hidden = false;
    }
  }

  updateTimer(timeLeft) {
    if (!this.timer) return;
    this.timer.textContent = setCurrentTime(timeLeft);
  }

  updateScore(score) {
    if (!this.score) return;
    this.score.textContent = score;
  }

  toggleHUDInactive() {
    if (this.timer) {
      this.timer.classList.toggle("inactive");
    }
    if (this.score) {
      this.score.classList.toggle("inactive");
    }
  }

  renderBoxes(boxes) {
    if (!this.gameContainer) return;

    // Build a mapping of existing box elements by id so we can
    // animate only newly spawned boxes instead of re-creating all.
    const existing = new Map();
    this.gameContainer
      .querySelectorAll(".box")
      .forEach((el) => {
        const id = el.dataset.boxId;
        if (id != null) {
          existing.set(id, el);
        }
      });

    // Remove DOM elements for boxes that no longer exist.
    const liveIds = new Set(boxes.map((b) => String(b.id)));
    existing.forEach((el, id) => {
      if (!liveIds.has(id)) {
        el.remove();
        existing.delete(id);
      }
    });

    // Add or update elements for current boxes.
    boxes.forEach((box) => {
      const id = String(box.id);
      let el = existing.get(id);

      const isNew = !el;
      if (!el) {
        el = document.createElement("div");
        el.classList.add("box");
        el.dataset.boxId = id;
        this.gameContainer.appendChild(el);

        el.animate(
          [
            { transform: "scale(0)", opacity: 0 },
            { transform: "scale(1.2)", opacity: 1 },
            { transform: "scale(1)", opacity: 1 },
          ],
          {
            duration: 300,
            easing: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            fill: "forwards",
          }
        );
      }

      el.style.setProperty("--x", `${box.x}%`);
      el.style.setProperty("--y", `${box.y}%`);

      // Schedule a pre-expiry flash for newly spawned boxes, based on lifetimeMs.
      if (isNew && typeof box.lifetimeMs === "number") {
        const flashDelay = Math.max(box.lifetimeMs - 500, 0);
        setTimeout(() => {
          if (!el.isConnected) return;
          el.animate(
            [
              { opacity: 1 },
              { opacity: 0.2 },
              { opacity: 1 },
            ],
            {
              duration: 200,
              iterations: 2,
            }
          );
        }, flashDelay);
      }
    });
  }

  showGameOver(finalScore) {
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `You scored: ${finalScore}`;
      this.scoreDisplay.hidden = false;
    }
    this.showStartButton();
  }

  endGame(gameState, timeLimit) {
    if (!gameState) return;

    this.updateTimer(timeLimit);
    this.toggleHUDInactive();
    if (this.scoreDisplay) {
      this.scoreDisplay.textContent = `You scored: ${gameState.scoreCount}`;
      this.scoreDisplay.hidden = false;
    }

    gameState.scoreCount = 0;
    this.updateScore(gameState.scoreCount);

    if (this.gameContainer) {
      this.gameContainer
        .querySelectorAll(".box")
        .forEach((box) => box.remove());
    }
    this.showStartButton();
  }
}

export { UIManager };