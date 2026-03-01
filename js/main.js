import { startGame } from './game-logic.js';
import { setCurrentTime } from './utils.js';

const timer = document.getElementById('timer');
const score = document.getElementById('score');
const gameContainer = document.getElementById('game-container');
const startButton = document.getElementById('start');
const scoreDisplay = document.getElementById('scoreDisplay');

const timeLimit = 10;
const gameConfig = [timer, score, scoreDisplay, startButton, gameContainer, timeLimit]

timer.textContent = setCurrentTime(timeLimit);

startButton.addEventListener('click', event => {
    startGame(gameConfig);
    startButton.hidden = true;
    scoreDisplay.hidden = true;
})

