import { spawnBox, calculatePercentage, setCurrentTime, displayScore } from './utils.js';


function startGame(timerObj, scoreObj, gameContainer, timeLimit) {
    let timeLeft = timeLimit;
    timerObj.textContent = setCurrentTime(timeLeft);

    const spawnInterval = setInterval(function() {
        timeLeft--;
        timerObj.textContent = setCurrentTime(timeLeft);

        spawnBox(gameContainer, ...calculatePercentage());
        if (!timeLeft) {
            clearInterval(spawnInterval);
            displayScore();
        }
    }, 1000);
    
}





export { startGame };