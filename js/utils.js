// this function is responsible for appending new boxes to
// game window
function spawnBox(parent, gameObj, scoreObj, percentX, percentY) {
    const box = document.createElement('div');

    box.classList.add('box');
    box.style.setProperty('--x', `${percentX}%`);
    box.style.setProperty('--y', `${percentY}%`);
    
    // animation logic was written with the use of AI
    box.animate([
        { scale: '0', opacity: 0 },   // Start
        { scale: '1.2', opacity: 1 }, // Peak bounce
        { scale: '1', opacity: 1 }    // End
    ], {
        duration: 300,
        easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        fill: 'forwards'
    });
    //

    parent.appendChild(box);

    //
    let animation = setTimeout(() => {
        if (box.parentElement) { // Check if the user hasn't already clicked it
            box.animate([
            { opacity: 1 },
            { opacity: 0.2 },
            { opacity: 1 }
            ], {
            duration: 200,
            iterations: 2 // Flashes twice
            });
        }
    }, 1000);
    //

    let lifeTime = setTimeout(() => {
        if (box.parentElement) {
            box.remove();
        }
    }, 1500);

    box.addEventListener('click', () => {
        clearTimeout(animation);
        clearTimeout(lifeTime);

        gameObj.scoreCount++;
        scoreObj.textContent = gameObj.scoreCount;

        const clickAnim = box.animate([
            { scale: '1', opacity: 1 },
            { scale: '0', opacity: 0 }
        ], {
            duration: 150,
            easing: 'ease-in',
            fill: 'forwards'
        });

        clickAnim.onfinish = () => box.remove();
    }, { once: true });
}



// This function is used to get random values from 0 to 100. Used in
// positioning new boxes inside the game`s window
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



//
function removeAllBoxes(parentContainer) {
    parentContainer.querySelectorAll('.box').forEach(box => {
        box.remove();
    })
}


//
function displayScore(scoreDisplay, gameObj) {
    scoreDisplay.textContent = `You scored: ${gameObj.scoreCount}`;
    scoreDisplay.hidden = false;
}


//
function toggleInactiveHUD(timerObj, scoreObj) {
    timerObj.classList.toggle('inactive');
    scoreObj.classList.toggle('inactive');
}


export { spawnBox,
     calculatePercentage,
     setCurrentTime, 
     removeAllBoxes,
     displayScore, 
     toggleInactiveHUD };