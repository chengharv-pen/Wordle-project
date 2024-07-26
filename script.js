const letters = document.querySelectorAll('.letter');
const getAPI = "https://words.dev-apis.com/word-of-the-day";
const postAPI = "https://words.dev-apis.com/validate-word";
let wordCount = { count: 0 };
let lastActiveElement = null;

// Select the first input box on load
document.querySelector('.game-board input').focus();

// Listen on the 'input' event inside the .word area:
document.querySelector(".game-board").addEventListener("input", (e) => {

    // Exclude non-numeric characters from input:
    e.target.value = e.target.value.replace(/[^a-zA-Z]/g, '');

    // Find the current index of the input element:
    const currentIndex = Array.prototype.indexOf.call(letters, e.target);

    // If the input value is filled and there is a next input element, then focus on that element:
    if (e.target.value !== "" && currentIndex + 1 < letters.length && (currentIndex + 1) % 5 !== 0) {
        letters[currentIndex + 1].focus();
    }
});

// Add the 'keydown' event listeners once for each letter input
letters.forEach((input, index) => {
    // Listen for the 'keydown' event, more specifically for backspace
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value === '' && index > 0 && index % 5 > 0) {
            letters[index - 1].focus();
        }
    });

    // Listen for the 'keydown' event, more specifically for enter
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (index + 1) % 5 === 0 && input.value !== "") {
            // Get the word entered
            let currentWord = "";
            for (let i = index - 4; i <= index; i++) {
                currentWord += letters[i].value;
            }
            wordCount.count++;
            console.log(wordCount.count);

            let validWord = "";
            checkWord(currentWord, postAPI)
                .then(result => {
                    console.log(result);
                    validWord = result;
                    console.log(validWord);
                    if (wordCount.count < 6 && validWord) {

                        letters[index + 1].focus();
                        winCheck(currentWord, wordCount, index);

                    } else if (wordCount.count === 6 && validWord) {

                        winCheck(currentWord, wordCount, index);

                    } else {

                        wordCount.count--;
                        for (let i = index - 4; i <= index; i++) {
                            letters[i].value = "";
                        }
                        letters[index - 4].focus();

                    }
                    console.log(currentWord);
                })
                .catch(error => {
                    console.error(error); // Handle any errors if the promise is rejected
                });
        }
    });

    // Add focus event listener to all input elements
    input.addEventListener('focus', (event) => {
        lastActiveElement = event.target;
    });
});

// Add click event listener to the document to refocus when clicking away from the last active element
document.addEventListener('click', (event) => {
    // Check if the click was outside the game board
    if (event.target !== "letter") {
        lastActiveElement.focus();
        console.log(lastActiveElement);
    }
});

// An event listener for the button, to call resetGameBoard()
document
    .querySelector(".other-stuff")
    .addEventListener('click', (event) => {
        if (event.target.className === "reset-button") {
            console.log(letters.length);
            resetGameBoard(letters.length);
        }
    });

//This function will call a GET API request, in order to retrieve the word of the day.
async function getWord(getAPI) {
    try {
        const promise = await fetch(getAPI);

        if (!promise.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const processedResponse = await promise.json(); // Parse the JSON response
        return processedResponse.word; // Return the processed response object
    } catch (error) {
        console.error('Error posting the word:', error);
    }
}

//This function will call a POST API request, in order to check if the word is valid.
async function checkWord(word, postAPI) {
    try {
        const promise = await fetch(postAPI, {
            method: 'POST', // Specify the method as POST
            headers: {
                'Content-Type': 'application/json', // Indicate that the request body is JSON
            },
            body: JSON.stringify({ word: word }), // Convert the JavaScript object to a JSON string
        });

        if (!promise.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const processedResponse = await promise.json(); // Parse the JSON response
        return processedResponse.validWord; // Return the processed response object
    } catch (error) {
        console.error('Error posting the word:', error);
    }
}

//The wordCount variable in a async context is LOCAL, so we used an Object to change it
function winCheck(word, wordCount, index) {
    getWord(getAPI)
        .then(winningWord => {
            if (wordCount.count < 6) {
                colorLetters(word, winningWord, index);
                if (word === winningWord) {
                    wordCount.count = 0;
                    alert('You won!');
                }
            } else {
                colorLetters(word, winningWord, index);
                if (word === winningWord) {
                    alert('You won!');
                } else {
                    alert('You lost!');
                }
                wordCount.count = 0;
            }
        })
        .catch(error => {
            console.error(error);
        });
}

// This function resets the game board
function resetGameBoard(index) {
    //Erase all text and reset all colors
    const elements = document.getElementsByTagName("input");
    for (let i = 0; i < elements.length; i++) {
        if (elements[i].type == "text") {
            elements[i].value = "";
            elements[i].style.backgroundColor = "cyan";
        }
    }

    document.querySelector('.game-board input').focus();
}

// A function that colors the letters of an inputted word
function colorLetters(word, winningWord, index) {

    const wordArray = word.split('');
    const winningArray = winningWord.split('');
    const feedback = Array(5).fill('gray'); // Initialize all feedback as 'gray'
    const usedIndices = Array(5).fill(false); // Track used indices in the winning word for yellow check

    console.log(wordArray, winningArray, feedback, usedIndices, index);

    const initialValue = index - 4;

    // First pass: Check for correct letters in correct positions (green)
    for (let i = (index - 4); i <= index; i++) {
        console.log(i - initialValue);
        if (wordArray[i - initialValue] === winningArray[i - initialValue]) {
            feedback[i - initialValue] = 'green';
            usedIndices[i - initialValue] = true;
        }
    }

    // Second pass: Check for correct letters in wrong positions (yellow)
    for (let i = (index - 4); i <= index; i++) {
        if (feedback[i - initialValue] !== 'green') { // Skip already matched letters
            for (let j = 0; j < 5; j++) {
                if (wordArray[i - initialValue] === winningArray[j] && !usedIndices[j]) {
                    feedback[i - initialValue] = 'yellow';
                    usedIndices[j] = true;
                    break;
                }
            }
        }
    }

    // Third pass: Color the word depending on feedback array's colors
    for (let i = (index - 4); i <= index; i++) {
        letters[i].style.backgroundColor = feedback[i - initialValue];
    }

    console.log(feedback);
}

// This function checks whether the parameter letter is a letter
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
}

