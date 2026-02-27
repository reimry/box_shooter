import { startGame } from './game-logic.js';
import { setCurrentTime } from './utils.js';
export { startButton, gameContainer };

const timer = document.getElementById('timer');
const score = document.getElementById('score');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start');

let timeLimit = 15;
let scoreCount = 0;

timer.textContent = setCurrentTime(timeLimit);

startButton.addEventListener('click', event => {
    startGame(timer, score, gameContainer, timeLimit);
    startButton.hidden = true;
})

gameContainer.addEventListener('click', event => {
    if (event.target.classList.contains('box')) {
        gameContainer.removeChild(event.target);
        scoreCount++;
        score.textContent = scoreCount;
    }
})