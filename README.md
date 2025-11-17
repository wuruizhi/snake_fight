# Snake Survival

A survival twist on the classic Snake game. Control your snake with WASD or Arrow Keys and battle against multiple AI-controlled opponents. Outmaneuver the AI, force them to crash, and eat their remains to grow and score points. Survive as long as you can!

The game features both a single-player mode against AI and a two-player local co-op/competitive mode, along with a persistent leaderboard to track high scores.

## Features

- **Single Player Mode:** Battle against multiple AI-controlled snakes.
- **Two Player Mode:** Play with a friend on the same keyboard.
- **Dynamic AI:** Opponent snakes actively seek food and try to avoid collisions.
- **Persistent Leaderboard:** High scores are saved locally in your browser.
- **Neon-Themed UI:** A stylish, retro-futuristic aesthetic.
- **Responsive Gameplay:** The game board adapts to your screen size.

## How to Play

### Objective

The goal is to survive for as long as possible and achieve the highest score. Your score increases by moving, eating food, and absorbing the remains of defeated snakes.

### Controls

- **Player 1:**
  - `W` / `ArrowUp`: Move Up
  - `S` / `ArrowDown`: Move Down
  - `A` / `ArrowLeft`: Move Left
  - `D` / `ArrowRight`: Move Right

- **Player 2 (Two Player Mode):**
  - `Numpad 8`: Move Up
  - `Numpad 5`: Move Down
  - `Numpad 4`: Move Left
  - `Numpad 6`: Move Right

- **Game:**
  - `Space` / `Escape`: Pause / Resume Game

## How to Run / Deploy Locally

This project is a static web application built with React and TypeScript, but it uses no build tools and loads dependencies from a CDN. Because it uses ES Modules (`import`), you cannot simply open the `index.html` file directly in your browser using the `file://` protocol. You need to serve the files from a local web server.

Here are a few simple ways to do this:

### Option 1: Using the VS Code Live Server Extension

1.  Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension in Visual Studio Code.
2.  Open the project folder in VS Code.
3.  Right-click on the `index.html` file in the Explorer panel and select "Open with Live Server".
4.  Your browser will automatically open with the game running.

### Option 2: Using Python

If you have Python installed, it comes with a simple built-in web server.

1.  Open your terminal or command prompt.
2.  Navigate to the root directory of the project (the folder containing `index.html`).
3.  Run the following command:
    ```bash
    # For Python 3.x
    python -m http.server
    ```
4.  Open your web browser and go to `http://localhost:8000`.

### Option 3: Using Node.js and `serve`

If you have Node.js installed, you can use the `serve` package.

1.  Open your terminal or command prompt.
2.  Navigate to the root directory of the project.
3.  Run the following command to install `serve` and start the server:
    ```bash
    npx serve .
    ```
4.  The terminal will give you a local address (usually `http://localhost:3000`). Open it in your browser.

---

Once the server is running, the game will load, and you can start playing!
