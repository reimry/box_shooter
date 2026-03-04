## Box Shooter — Proposed OOP Architecture

This document describes one way to evolve the current procedural MVP into a more scalable, class‑based architecture. It focuses on **responsibilities** and **collaboration** between components, not on concrete code.

The goals:
- Make it easy to tweak **config** (timer, spawn rate, difficulty curves, box types).
- Keep **game logic** separate from **DOM/UI**.
- Allow adding new features (power‑ups, multiple levels, different game modes) without rewriting everything.

---

## High‑level structure

- **`main` (entry)**: Bootstraps everything. Finds DOM elements, creates core objects, wires them together, and starts the game.
- **`GameEngine`**: Owns the game loop, game state, and core rules. Talks to managers and the UI through well‑defined methods.
- **`UIManager`**: Knows about the DOM. Renders boxes and HUD, listens to DOM events, and forwards meaningful events to the engine.
- **`SpawnManager` + `SpawnRate` strategies**: Decide when and where to spawn boxes, and of which type.
- **`Box` and related types**: Represent individual boxes and their behavior at the game‑logic level (position, type, score, lifetime).
- **`DifficultyManager`**: Adjusts difficulty (spawn speed, box types, maybe timer) as the game progresses.
- **`GameConfig`**: Central place for configuration values and tunable settings.

Think of the architecture as:  
**DOM ↔ UIManager ↔ GameEngine ↔ Managers/Entities (Box, SpawnManager, DifficultyManager, etc.)**

---

## GameConfig

**Responsibility**: Provide tunable, structured configuration for the game.

Examples of what it would contain:
- **Core timing**
  - Initial time limit.
  - Whether there is a per‑box lifetime.
- **Spawn configuration**
  - Base spawn interval (e.g. one box per second).
  - Minimum/maximum spawn interval allowed.
- **Difficulty rules**
  - How spawn interval changes based on score or elapsed time.
  - When new box types unlock.
- **Box type definitions**
  - For each type: score value, size, color, special rules (e.g. penalty boxes).

How it connects:
- `GameEngine` receives a `GameConfig` instance (or plain object) in its constructor.
- `SpawnManager`, `DifficultyManager`, and possibly `UIManager` all read from this config instead of hard‑coding numbers.

This means changing timer duration or adding a new box type usually requires **only editing config**, not game logic.

---

## GameEngine

**Responsibility**: Central coordinator and source of truth for game state and rules.

Key ideas:
- Does **not** directly manipulate the DOM.
- Knows about:
  - Current score.
  - Time remaining.
  - Game state (`idle`, `countdown`, `playing`, `paused`, `gameOver`).
  - Active boxes (logical entities).
- Holds references to:
  - `UIManager` (or a generic UI interface).
  - `SpawnManager`.
  - `DifficultyManager`.

Typical responsibilities:
- **Start / restart game**
  - Reset state (score, timer, active boxes).
  - Ask `UIManager` to reset the view (clear boxes, reset HUD).
  - Start the game loop (interval or frame updates).
- **Game loop**
  - Each tick, update time.
  - Ask `DifficultyManager` to update difficulty state (based on score/time).
  - Ask `SpawnManager` whether new boxes should be spawned this tick.
  - Update box lifetimes and remove expired boxes.
  - Notify `UIManager` about any changes (boxes added/removed, HUD updates).
- **Respond to player input**
  - When the UI reports "box with id X was clicked":
    - Check if that box is still active.
    - Update score.
    - Remove the box from active state.
    - Instruct `UIManager` to remove the box from the view.
- **End game**
  - Detect when time reaches zero (or other losing conditions).
  - Stop the game loop.
  - Inform `UIManager` to display game‑over UI with final score.

Key collaboration flows:
- From UI: `UIManager` calls methods like `engine.handleBoxClick(boxId)` or `engine.handleStartRequested()`.
- To UI: `GameEngine` calls methods like `ui.showBoxes(boxList)` or `ui.updateScore(score)`.

---

## UIManager

**Responsibility**: Own all DOM interactions and present the game state visually.

What it knows:
- References to DOM elements (`gameContainer`, timer element, score element, start button, overlays, etc.).
- A way to talk back to the engine (callbacks or a direct reference to `GameEngine`).

Typical responsibilities:
- **Setup**
  - Attach event listeners to the start button and game area.
  - Map DOM events (click coordinates or targets) into higher‑level events (e.g. “box with id X clicked”).
- **Rendering**
  - Create and remove box elements when the engine tells it that boxes changed.
  - Update positions and visuals according to box properties (type, size, color).
  - Update HUD: score, timer, difficulty indicators.
- **Game state UI**
  - Show/hide the start button.
  - Show a game‑over overlay with the final score.
  - Possibly animate transitions between states (fade in/out, etc.).

Collaboration patterns:
- On DOM events:
  - Box click → determine which logical box was clicked (via an id/attribute or data‑map) and call something like `engine.handleBoxClick(boxId)`.
  - Start button click → call `engine.handleStartRequested()`.
- When engine updates:
  - Engine calls `ui.updateHUD({ score, timeLeft, difficultyLevel })`.
  - Engine calls `ui.syncBoxes(activeBoxes)` or provides more granular operations (add/remove).

By keeping DOM manipulation inside `UIManager`, you can later:
- Replace DOM with a canvas or React without touching core game logic.
- Write tests for `GameEngine` without needing a browser environment.

---

## Box (and BoxType)

**Responsibility**: Represent one logical box in the game.

What a `Box` entity might encapsulate conceptually:
- **Identity**
  - Unique id.
- **Position**
  - Logical coordinates in the game area (e.g. as percentages).
- **Type**
  - Reference to a `BoxType` definition (normal, bonus, penalty, etc.).
- **Lifetime**
  - Spawn time.
  - Lifetime duration.
  - Whether it is already “hit” or expired.

Behavior:
- Methods to determine:
  - Whether the box is expired for a given time.
  - What score impact it has when hit.
  - Any special effects on hit (e.g. adding time, subtracting score).

`BoxType` could define:
- Visual style (color, size).
- Base score value.
- Special rules (e.g. clicking this box halves the timer).

How it connects:
- `SpawnManager` creates `Box` instances according to current difficulty and config.
- `GameEngine` stores active boxes and checks when they expire or are hit.
- `UIManager` doesn’t manipulate box logic; it just reflects the current list of boxes it receives from the engine.

---

## SpawnManager and SpawnRate

**Responsibility (SpawnManager)**: Decide **when**, **where**, and **which type** of boxes to spawn, given the current game context.

Inputs it cares about:
- Current time / elapsed time.
- Current difficulty level.
- Current score or player performance.
- Configuration from `GameConfig` (base spawn rate, min/max intervals, unlock thresholds).

Outputs:
- Tells `GameEngine` when new boxes should appear.
- Provides the initial data to create `Box` instances (positions and types).

Possible approaches:
- Keep internal state for **time since last spawn**.
- On each game‑loop tick:
  - Update its internal timers.
  - Ask `SpawnRate` to compute how long until the next spawn, or whether a spawn should happen now.
  - When it decides to spawn:
    - Choose a random (or strategic) position.
    - Choose a `BoxType` based on difficulty and config.
    - Return a `Box` entity back to `GameEngine`.

**Responsibility (SpawnRate / strategy classes)**: Encapsulate the algorithm for how spawn rate changes over time or score.

Examples of strategies:
- **FixedSpawnRate**: Always one box per second.
- **ScoreBasedSpawnRate**: More score → higher spawn frequency.
- **TimeWaveSpawnRate**: Waves of intense spawns followed by calmer periods.

Why separate it:
- You can plug in new spawn‑rate behaviors without rewriting `SpawnManager` or `GameEngine`.
- Each spawn‑rate strategy can be tested independently with simple inputs and outputs.

---

## DifficultyManager

**Responsibility**: Compute the current difficulty level and expose it to other systems.

Inputs:
- Current score.
- Elapsed time.
- Possibly player accuracy or streaks.
- Configuration thresholds from `GameConfig`.

Outputs:
- A difficulty level or structured data (e.g. levels 1–10, or named difficulties).
- Hints for other systems:
  - To `SpawnManager`: scale spawn interval.
  - To `GameEngine`: maybe add time bonuses, change game rules, or unlock box types.
  - To `UIManager`: optionally display difficulty level.

Typical behavior:
- On every game tick, or when relevant values change, `GameEngine` asks `DifficultyManager` for an updated difficulty state.
- Difficulty changes smoothly or stepwise based on rules defined in config.

---

## Game state and flow

You can model the game using a simple state machine with states like:
- `idle` — initial state, waiting for the player.
- `countdown` (optional) — brief “3, 2, 1, Go!” before playing.
- `playing` — boxes are spawning, timer is counting down.
- `paused` (optional) — game stopped but can resume.
- `gameOver` — final score shown, awaiting restart.

**Where this lives**: inside `GameEngine`.

Example flow in words:
1. **Idle → Playing**
   - Player presses start.
   - `UIManager` notifies `GameEngine`.
   - `GameEngine`:
     - Resets score and timer.
     - Clears any old boxes from its state.
     - Switches state to `playing`.
     - Starts the game loop and tells `UIManager` to show the active HUD and hide the start button.
2. **Playing (loop)**
   - Each tick:
     - Decrease timer.
     - Ask `DifficultyManager` for current difficulty.
     - Ask `SpawnManager` if it should spawn a box under this difficulty.
     - Update boxes (lifetime, expiration).
     - Notify `UIManager` of any added/removed boxes and HUD changes.
3. **Handling hits**
   - Player clicks inside the game area.
   - `UIManager` determines which box was clicked and calls `engine.handleBoxClick(boxId)`.
   - `GameEngine`:
     - Validates box is active.
     - Updates score and removes the box.
     - Possibly triggers difficulty changes.
4. **Playing → GameOver**
   - Timer reaches zero or other end condition is met.
   - `GameEngine`:
     - Stops the loop.
     - Switches state to `gameOver`.
     - Notifies `UIManager` to show final score and restart controls.
5. **GameOver → Idle/Playing**
   - Player presses restart.
   - Flow repeats from step 1.

---

## How everything fits together (no code, just roles)

- **Entry (`main`)**
  - Looks up DOM elements.
  - Creates `GameConfig`.
  - Instantiates `UIManager` with DOM elements.
  - Instantiates `GameEngine` with:
    - `GameConfig`
    - `UIManager`
    - `SpawnManager` (which itself uses a `SpawnRate` strategy and `Box` factory logic).
    - `DifficultyManager`.
  - Wires `UIManager` so that its callbacks call into `GameEngine` (start, box hit, etc.).

- **GameEngine**
  - Maintains authoritative state.
  - Runs the game loop.
  - Interacts with `SpawnManager`, `DifficultyManager`, and `Box` entities.
  - Pushes UI updates to `UIManager`.

- **UIManager**
  - Renders what `GameEngine` tells it to render.
  - Forwards user actions to `GameEngine`.

- **SpawnManager**
  - Decides when and what to spawn using `SpawnRate` and `DifficultyManager`.
  - Produces new `Box` entities for `GameEngine` to track.

- **Box / BoxType**
  - Define properties and behavior of individual boxes.
  - Provide a clean way to add new box types later.

- **DifficultyManager**
  - Encapsulates how the game gets harder or easier.
  - Allows you to experiment with different difficulty curves without touching the rest of the system.

---

## How to extend from here

Once this structure is in place, adding features becomes a matter of plugging new pieces into the existing roles, for example:
- New **box types** → extend `BoxType` definitions and ensure `SpawnManager` knows when to use them.
- New **game modes** → create different `GameConfig` presets and maybe small variations of `GameEngine` behavior.
- **Power‑ups or abilities** → add new entity types or extend `Box` behavior and connect them via `GameEngine`.
- **Persistent high scores** → extend `GameEngine` (or add a separate `ScoreManager`) to save/load from storage; `UIManager` just displays the data.

The key idea is that each class has a **single, clear responsibility**, and they communicate via **explicit methods** rather than sharing global variables or manipulating the DOM from everywhere.

