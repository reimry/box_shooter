import { calculatePercentage } from "./utils.js";
import { Box } from "./Box.js";

class SpawnManager {
    #timeSinceLastSpawn;
    #pendingBoxes;
    #nextId;

    constructor(config = {}) {
        this.config = {
            spawnIntervalSeconds: 1,
            boxLifetimeMs: 1500,
            ...config
        };

        this.#timeSinceLastSpawn = 0;
        this.#pendingBoxes = [];
        this.#nextId = 1;
    }

    tick(deltaSeconds, gameState) {
        this.#timeSinceLastSpawn += deltaSeconds;

        while (this.#timeSinceLastSpawn >= this.config.spawnIntervalSeconds) {
            this.#timeSinceLastSpawn -= this.config.spawnIntervalSeconds;

            const [x, y] = calculatePercentage();
            const box = new Box(
                this.#nextId++,
                x,
                y,
                this.config.boxLifetimeMs
            );

            this.#pendingBoxes.push(box);
        }
    }

    getNewBoxes() {
        const boxes = this.#pendingBoxes;
        this.#pendingBoxes = [];
        return boxes;
    }
}

export { SpawnManager };

