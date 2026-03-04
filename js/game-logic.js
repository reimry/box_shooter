import { SpawnManager } from "./SpawnManager.js";

const GAME_CONFIG = {
    time: 10,
};

class GameEngine {
    #status;
    #intervalId;
    #gameState;
    #boxes;
    #spawnManager;

    constructor(ui, config = GAME_CONFIG) {
        this.ui = ui;
        this.config = config;

        this.#status = "idle";      // 'idle' | 'playing'
        this.#intervalId = null;
        this.#gameState = null;     // { timeLeft, scoreCount }
        this.#boxes = [];
        this.#spawnManager = new SpawnManager({
            spawnIntervalSeconds: 1,
            boxLifetimeMs: 1500
        });

        if (this.ui) {
            this.ui.updateTimer(this.config.time);
        }
    }

    start() {
        if (this.#status === "playing") return;

        this.#status = "playing";

        this.#gameState = {
            timeLeft: this.config.time,
            scoreCount: 0,
        };
        this.#boxes = [];

        if (this.ui) {
            this.ui.toggleHUDInactive();
            this.ui.hideHUDElements();
            this.ui.resetView();

            this.ui.updateTimer(this.#gameState.timeLeft);
            this.ui.updateScore(this.#gameState.scoreCount);
            this.ui.renderBoxes(this.#boxes);
        }

        this.#intervalId = setInterval(() => {
            this.#tick();
        }, 1000);
    }

    #tick() {
        if (this.#status !== "playing" || !this.#gameState) return;

        this.#gameState.timeLeft--;

        if (this.ui) {
            this.ui.updateTimer(this.#gameState.timeLeft);
        }

        // Advance spawn manager and collect newly spawned boxes.
        this.#spawnManager.tick(1, this.#gameState);
        const newBoxes = this.#spawnManager.getNewBoxes();
        if (newBoxes.length > 0) {
            this.#boxes.push(...newBoxes);
        }

        // Remove expired boxes based on their lifetime.
        const now = Date.now();
        this.#boxes = this.#boxes.filter((box) => !box.isExpired(now));

        if (this.ui) {
            this.ui.renderBoxes(this.#boxes);
        }

        if (!this.#gameState.timeLeft) {
            this.#end();
        }
    }

    #end() {
        if (this.#status !== "playing" || !this.#gameState) return;

        this.#status = "idle";

        if (this.#intervalId !== null) {
            clearInterval(this.#intervalId);
            this.#intervalId = null;
        }

        this.#boxes = [];

        if (this.ui?.endGame) {
            this.ui.endGame(this.#gameState, this.config.time);
        }
    }

    handleBoxClick(boxId) {
        if (this.#status !== "playing" || !this.#gameState) return;

        const index = this.#boxes.findIndex(
            (box) => String(box.id) === String(boxId)
        );
        if (index === -1) return;

        const box = this.#boxes[index];
        box.onHit(this.#gameState);
        this.#boxes.splice(index, 1);

        if (this.ui) {
            this.ui.updateScore(this.#gameState.scoreCount);
            this.ui.renderBoxes(this.#boxes);
        }
    }
}


export { GameEngine, GAME_CONFIG };