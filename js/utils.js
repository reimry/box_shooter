import { startButton, gameContainer } from "./main.js";

// this function is responsible for appending new boxes to
// game window
function spawnBox(parent, percentX, percentY) {
    const box = document.createElement('div');

    box.classList.add('box');
    box.style.setProperty('--x', `${percentX}%`);
    box.style.setProperty('--y', `${percentY}%`);

    parent.appendChild(box);

    setTimeout(() => {
        if (box.parentElement) {
            box.remove();
        }
    }, 1500);
}


// This function is used to get random values from 0 to 100. Used in
// positioning new boxes inside the game`s windows
function calculatePercentage() {
    let [x, y] = [Math.random() * 100, Math.random() * 100];
    return [Math.trunc(x), Math.trunc(y)];
}


// This function is used to set time in timer object
function setCurrentTime(timeLeft) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const mDisplay = String(minutes).padStart(2, '0');
    const sDisplay = String(seconds).padStart(2, '0');

    return `${mDisplay}:${sDisplay}`;
}


//
function displayScore() {
    startButton.removeAttribute('hidden');
    removeAllBoxes();
}


//
function removeAllBoxes() {
    gameContainer.querySelectorAll('.box').forEach(box => {
        box.remove();
    })
}

export { spawnBox, calculatePercentage, setCurrentTime, displayScore };