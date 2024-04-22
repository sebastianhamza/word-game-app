let round = 1;
let timerInterval;
let timeLeft = 30;

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-screen').style.display = 'block';
    loadRandomWord();
    startTimer();
}

function endGame() {
    clearInterval(timerInterval);
    document.getElementById('game-screen').style.display = 'none';
    document.getElementById('end-screen').style.display = 'block';
}

function loadRandomWord() {
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
            hintContainer.textContent = ''; // Clear previous hint
            revealedLetters = Array(chosenWord.length).fill(false); // Reset revealed letters array

            // Display hint
            hintContainer.textContent = hint;

            // Display rectangles instead of letters
            for (let i = 0; i < chosenWord.length; i++) {
                const rectangle = document.createElement('div');
                rectangle.className = 'letter-rectangle';
                wordContainer.appendChild(rectangle);
            }

            // Event listener for revealing a random letter
            document.getElementById('reveal-letter-btn').addEventListener('click', revealRandomLetter);
            document.getElementById('reveal-all-btn').addEventListener('click', revealAllLetters);
        })
        .catch(error => console.error('Error loading words:', error));
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        document.getElementById('timer').textContent = `Time Left: ${timeLeft}s`;

        if (timeLeft === 0) {
            endGame();
        }
    }, 1000);
}

function resetTimer() {
    if (!timerInterval) {
        startTimer();
    } else {
        clearInterval(timerInterval);
        timeLeft = 20;
        document.getElementById('timer').textContent = `Time Left: ${timeLeft}s`;
        startTimer();
    }
}


document.getElementById('start-btn').addEventListener('click', startGame);

document.getElementById('next-btn').addEventListener('click', () => {
    round++;
    if (round <= totalRounds) {
        loadRandomWord();
    } else {
        endGame();
    }
});

document.getElementById('restart-btn').addEventListener('click', () => {
    round = 1;
    resetTimer();
    document.getElementById('end-screen').style.display = 'none';
    document.getElementById('start-screen').style.display = 'block';
});


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


// Initial setup
const totalRounds = 3; // Change this to the desired number of rounds
document.getElementById('timer').textContent = `Time Left: ${timeLeft}s`;
