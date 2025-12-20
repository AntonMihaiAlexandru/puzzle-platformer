# Puzzle Platformer Web Application

A 2D puzzle-platformer web application built with vanilla JavaScript and HTML5 Canvas.  
The game focuses on timing-based puzzles, player skill, and interactive mechanics.

A unique **Echo mechanic** allows a delayed ghost of the player to repeat past actions, enabling more complex and engaging puzzle solutions.

The application runs entirely in the browser and does not require a backend server.

## 🔗 Live Deployment
https://puzzle-frontend-jqsf.onrender.com/

---

## Features
- 2D platformer gameplay rendered using HTML5 Canvas
- Left / right movement and jumping
- **Ledge grab mechanic** for advanced platforming
- **Echo mechanic**: a ghost that mirrors the player's actions with a delay
- Interactive puzzle elements:
  - Buttons that open doors
  - Levers that activate doors
- Enemy entities that must be avoided
- Hazard mechanics (spikes and falling off platforms cause player death)
- Timer-based gameplay
- Leaderboard system
- Multiple levels with increasing difficulty

---

## Tech Stack

### Frontend
- JavaScript (ES6 modules)
- HTML5 Canvas
- CSS
- Custom game loop using `requestAnimationFrame`
- Custom collision detection system

---

## Prerequisites

To run the project locally, you only need:
- A modern web browser (Chrome, Edge, Firefox)

---

## Running the Application Locally

1. Clone the repository:

git clone https://github.com/AntonMihaiAlexandru/puzzle-platformer.git
Open the project folder and start a local server
(required because ES modules cannot be loaded directly from the file system).

VS Code Live Server
Install Live Server extension

Right click index.html → Open with Live Server


## Usage
Game Controls
A / D or Arrow Left / Arrow Right – Move left / right

Space – Jump

Automatic ledge grab – Player grabs edges when close

Buttons / Levers – Activated by player interaction

## Gameplay
Navigate platforms and avoid hazards

Evade enemies

Use buttons and levers to open doors

Coordinate player actions with the Echo mechanic

Complete levels as fast as possible to improve leaderboard time

## Levels and Progression
The game currently includes 5 playable levels

Additional levels are planned

Difficulty increases progressively across levels

## Deployment
The application is deployed as a static web application.

## Deployment Process
The project is hosted on a public platform.

Static files (HTML, CSS, JS, assets) are served directly.

No backend or server-side processing is required.

## Live URL
https://puzzle-frontend-jqsf.onrender.com/

## Project Structure
graphql
Copiază codul
puzzle-platformer/
├── js/
│   ├── engine/        # Core game engine logic
│   ├── entities/      # Player, enemies, interactive objects
│   ├── levels/        # Level definitions (JSON)
│   ├── sprites/       # Sprite handling
│   └── main.js
├── sounds/            # Audio assets
├── index.html
├── style.css
└── README.md
Project Status
This project is under active development.
The current version demonstrates all core gameplay and puzzle mechanics.