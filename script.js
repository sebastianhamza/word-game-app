function AdjustingInterval(workFunc, interval, errorFunc) {
    var that = this;
    var expected, timeout;
    this.interval = interval;

    this.start = function() {
        expected = Date.now() + this.interval;
        timeout = setTimeout(step, this.interval);
    }

    this.stop = function() {
        clearTimeout(timeout);
    }

    function step() {
        var drift = Date.now() - expected;
        if (drift > that.interval) {
            if (errorFunc) errorFunc();
        }
        workFunc();
        expected += that.interval;
        timeout = setTimeout(step, Math.max(0, that.interval - drift));
    }
}

let round = 1;
let timeLeftMain = 20;
let timeLeftSecond = 10;
let score = 0;
let mainTimer;
let secondTimer;
let isSecondTimerRunning = false;

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    loadRandomWord();
    startMainTimer();
}

function endGame() {
    if (mainTimer) {
        mainTimer.stop();
    }
    if (secondTimer) {
        secondTimer.stop();
        isSecondTimerRunning = false;
    }
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('score-container').style.display = 'block';
    document.getElementById('end-screen').style.display = 'block';
}

function loadRandomWord() {
    if (secondTimer) {
        secondTimer.stop();
        isSecondTimerRunning = false;
    }

    fetch('words.json')
        .then(response => response.json())
        .then(data => {
            const words = data;
            const randomIndex = Math.floor(Math.random() * words.length);
            const chosenWordObj = words[randomIndex];
            chosenWord = chosenWordObj.word;
            const hint = chosenWordObj.hint;
            const wordContainer = document.getElementById('word-container');
            const hintContainer = document.getElementById('hint-container');

            // Clear previous word and reset revealed letters array
            wordContainer.innerHTML = '';
            hintContainer.textContent = '';
            revealedLetters = Array(chosenWord.length).fill(false);

            // Display hint
            hintContainer.textContent = hint;

            // Display rectangles instead of letters
            for (let i = 0; i < chosenWord.length; i++) {
                const rectangle = document.createElement('div');
                rectangle.className = 'letter-rectangle';
                wordContainer.appendChild(rectangle);
            }

            document.getElementById('reveal-letter-btn').addEventListener('click', revealRandomLetter);
            document.getElementById('reveal-all-btn').addEventListener('click', revealAllLetters);
            document.getElementById('stop-btn').addEventListener('click', stopTimer);
        })
        .catch(error => console.error('Error loading words:', error));
}

function startMainTimer() {
    mainTimer = new AdjustingInterval(function() {
        if (timeLeftMain <= 0) {
            endGame();
            return;
        }
        timeLeftMain--;
        document.getElementById('timer').textContent = `Time Left: ${timeLeftMain}s`;
    }, 1000);
    mainTimer.start();
}

function startSecondTimer() {
    if (!isSecondTimerRunning) {
        isSecondTimerRunning = true;
        timeLeftSecond = 10;
        document.getElementById('second-timer').textContent = `Second Timer: ${timeLeftSecond}s`;

        secondTimer = new AdjustingInterval(function() {
            if (timeLeftSecond <= 0) {
                revealAllLetters();
                setTimeout(() => {
                    showPopup();
                }, 1000);
                secondTimer.stop();
                isSecondTimerRunning = false;
                return;
            }
            timeLeftSecond--;
            document.getElementById('second-timer').textContent = `Second Timer: ${timeLeftSecond}s`;
        }, 1000);
        secondTimer.start();
    }
}


function stopTimer() {
    if (mainTimer) {
        mainTimer.stop();
    }
    startSecondTimer();
}

function revealRandomLetter() {
    const hiddenLetterIndexes = revealedLetters.reduce((acc, isRevealed, index) => {
        if (!isRevealed) {
            acc.push(index);
        }
        return acc;
    }, []);

    if (hiddenLetterIndexes.length === 0) {
        alert('All letters are already revealed!');
        return;
    }

    const randomIndex = hiddenLetterIndexes[Math.floor(Math.random() * hiddenLetterIndexes.length)];
    const hiddenLetters = document.getElementsByClassName('letter-rectangle');
    hiddenLetters[randomIndex].textContent = chosenWord[randomIndex];
    revealedLetters[randomIndex] = true;
}

function revealAllLetters() {
    const hiddenLetters = document.getElementsByClassName('letter-rectangle');
    for (let i = 0; i < chosenWord.length; i++) {
        hiddenLetters[i].textContent = chosenWord[i];
        revealedLetters[i] = true;
    }
}

function nextWord() {
    round++;
    if (round <= totalRounds) {
        loadRandomWord();
    } else {
        endGame();
    }
}

function showPopup() {
    const popup = document.getElementById('popup');
    const popupText = document.getElementById('popup-text');
    
    popupText.textContent = `The correct word is: ${chosenWord}. Did you guess it?`;

    popup.style.display = 'block';

    document.getElementById('guessed-yes').addEventListener('click', () => {
        score++;
        document.getElementById('score').textContent = score;
        popup.style.display = 'none';
        nextWord();
    });

    document.getElementById('guessed-no').addEventListener('click', () => {
        popup.style.display = 'none';
        nextWord();
    });
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('next-btn').addEventListener('click', nextWord);
document.getElementById('restart-btn').addEventListener('click', () => {
    round = 1;
    score = 0;
    document.getElementById('score').textContent = score;
    loadRandomWord();
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
});

// Initial setup
const totalRounds = 3; // Change this to the desired number of rounds
document.getElementById('timer').textContent = `Time Left: ${timeLeftMain}s`;
document.getElementById('second-timer').textContent = `Second Timer: ${timeLeftSecond}s`;