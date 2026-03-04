export class Box {
    constructor(id, xPercent, yPercent, lifetimeMs = 1500) {
        this.id = id;
        this.x = xPercent;
        this.y = yPercent;
        this.spawnTime = Date.now();
        this.lifetimeMs = lifetimeMs;
    }

    isExpired(now) {
        return now - this.spawnTime >= this.lifetimeMs;
    }

    // Default for now
    onHit(gameState) {
        if (!gameState) return;
        gameState.scoreCount += 1;
    }
}