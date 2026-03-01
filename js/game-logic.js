import { spawnBox, calculatePercentage, setCurrentTime, removeAllBoxes, displayScore, toggleInactiveHUD } from './utils.js';


function startGame(gameConfig) {
    let [timerObj, scoreObj,,, gameContainer, timeLimit] = gameConfig;
    
    const gameObj = {
        timeLeft: timeLimit,
        scoreCount: 0,
    }

    timerObj.textContent = setCurrentTime(gameObj.timeLeft);
    scoreObj.textContent = gameObj.scoreCount;
    toggleInactiveHUD(timerObj, scoreObj);

    

    const spawnInterval = setInterval(function() {
        gameObj.timeLeft--;
        timerObj.textContent = setCurrentTime(gameObj.timeLeft);

        spawnBox(gameContainer, gameObj, scoreObj, ...calculatePercentage());
        if (!gameObj.timeLeft) {
            clearInterval(spawnInterval);
            onEndGame(gameConfig, gameObj);
        }
    }, 1000);
    
}

function onEndGame(gameConfig, gameObj) {
    let [timerObj, scoreObj, scoreDisplay, btnObj, gameContainer, timeLimit] = gameConfig;
    
    timerObj.textContent = setCurrentTime(timeLimit);
    toggleInactiveHUD(timerObj, scoreObj);
    displayScore(scoreDisplay, gameObj);
    gameObj.scoreCount = 0;
    
    btnObj.hidden = false;
    scoreObj.textContent = gameObj.scoreCount;

    removeAllBoxes(gameContainer);
}





export { startGame };