/* Board module. Our Board can: modify the board, reset the board, set up hover effects for the board, and control the music of the game. */

const Board = (() => {
  let board = ['', '', '', '', '', '', '', '', '']; // Our Tic Tac Toe board array.
  let moveCounter = 0;

  // Allows to write to the board. It does not modify the array.
  const modify = (index) => {
    const cell = document.querySelector(`[data-quadrant="${index}"]`);
    if (p1.hasTurn && !game.hasEnded) {
      cell.style.color = 'black';
      cell.style.textShadow = '2px 3px 3px grey';
      // If it is not p1's turn, we check for P2.
    } else if (!p1.hasTurn && !game.hasEnded) {
      cell.style.color = 'white';
      cell.style.textShadow = '2px 3px 3px black';
    }
    cell.textContent = Board.board[index];
  }

  // Resets the board.
  const reset = () => {
    Board.board = ['', '', '', '', '', '', '', '', '']; // Reset the array.
    Board.moveCounter = 0;
    // Clean up our board
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.textContent = '';
    });
  }

  // Set hover effects
  const updateHover = () => {
    cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.addEventListener('mouseenter', function () {
        let index = cell.getAttribute('data-quadrant');
        if (Board.board[index] == '') {
          if (p1.hasTurn && !game.hasEnded) {
            cell.textContent = p1.mark;
            cell.style.color = 'black';
            cell.style.textShadow = '2px 3px 3px grey';
          } else if (!p1.hasTurn && !game.hasEnded) {
            cell.textContent = p2.mark;
            cell.style.color = 'white';
            cell.style.textShadow = '2px 3px 3px black';
          }
        }
      });
      cell.addEventListener('mouseleave', function () {
        let index = cell.getAttribute('data-quadrant');
        if (Board.board[index] == '') {
          cell.textContent = '';
        }
      });
    });

    // Control the music of the game.
    const mute = document.querySelector('.mute');
    mute.addEventListener('click', function () {
      const audio = document.querySelector('audio');
      if (audio.muted) {
        audio.muted = false;
        mute.textContent = '🔊';
      } else {
        audio.muted = true;
        mute.textContent = '🔈';
      }
    });
  }

  // This allows us to display whose turn it is above the board, as well as results.
  const updateHeader = (text) => {
    const gameHeader = document.querySelector('.game-header');
    if (text) {
      gameHeader.textContent = text;
      return;
    }
    if (p1.hasTurn && !game.hasEnded) {
      gameHeader.innerHTML = `Your turn...<br /> ${p1.name}`;
    } else if (!p1.hasTurn && !game.hasEnded) {
      gameHeader.innerHTML = `Your turn...<br /> ${p2.name}`;
    }
  }

  return { board, modify, reset, updateHover, updateHeader };

})();

/* Our game module. It can: handle player selection, set player names, start a new round, handle turns, and check if there is  winner */

const game = (() => {

  // Start Minimax
  const scores = {
    X: -1,
    O: 1,
    tie: 0
  }

  const aiPlay = () => {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < Board.board.length; i++) {
      if (Board.board[i] == '') {
        Board.board[i] = p2.mark;
        let score = minimax(Board.board, 0, false);
        Board.board[i] = '';
        if (score > bestScore) {
          bestScore = score;
          move = i;
        }
      }

    }
    turn(move);
  }

  const minimax = (board, depth, isMaximizing) => {
    let result = game.checkForWinner();
    game.hasEnded = false;
    playAgain(false);
    if (result !== undefined) {
      return scores[result];
    }


    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] == '') {
          board[i] = p2.mark;
          let score = minimax(board, depth + 1, false);
          board[i] = '';
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < board.length; i++) {
        if (board[i] == '') {
          board[i] = p1.mark;
          let score = minimax(board, depth + 1, true);
          board[i] = '';
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  }

  // End Minimax

  // Allows to start a new round, and it resets all board flags.
  const newRound = () => {
    Board.reset();
    game.hasEnded = false;
    if (p2.isAI) {
      p1.hasTurn = false;
      game.aiPlay();
    } else {
      p1.hasTurn = true;
    }
    Board.updateHeader();
  }

  // Setup our click event handlers to manage turns.
  const setup = () => {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
      cell.addEventListener('click', function () {
        let index = cell.getAttribute('data-quadrant');
        turn(index);
      });
    });
    Board.updateHover(); // Update our hover effects every time the array us changed.
  }

  // Manages game flow.
  const turn = (index) => {
    if (Board.board[index] == '') {
      if (p1.hasTurn && !game.hasEnded) {
        Board.board.splice(index, 1, p1.mark); // Modifies array to insert X or O.
        Board.modify(index);
        p1.hasTurn = false; // Passes the turn to P2
        Board.moveCounter++;
        game.checkForWinner();
        if (p2.isAI) {
          game.aiPlay();
        }
      } else if (!p1.hasTurn && !game.hasEnded) {
        Board.board.splice(index, 1, p2.mark); // Modifies array to insert X or O.
        Board.modify(index);
        p1.hasTurn = true; // Passes the turn to P1
        Board.moveCounter++;
      }
    }
    Board.updateHeader(); // Update whose turn it is.
    game.checkForWinner();  // At the end of every turn, check to see if there is a winner.
  }

  // Allows us to check if the grid has a possible winner, or if it is a draw.
  const checkForWinner = () => {
    const winCombos = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
    if (!game.hasEnded) {
      for (i = 0; i < winCombos.length; i++) {
        let combo = winCombos[i];
        if (Board.board[combo[0]] === '') continue
        if (Board.board[combo[0]] === Board.board[combo[1]] && Board.board[combo[0]] === Board.board[combo[2]]) {

          if (Board.board[combo[0]] == 'X') {
            Board.updateHeader(`Winner is ${p1.hasTurn ? p2.name : p1.name}...`); // Winner outcome. 
            game.hasEnded = true;
            playAgain(true);
            return 'X';
          } else {
            Board.updateHeader(`Winner is ${p1.hasTurn ? p2.name : p1.name}...`); // Winner outcome. 
            game.hasEnded = true;
            playAgain(true);
            return 'O';
          }
        } else if (Board.moveCounter == 9) {
          Board.updateHeader('Draw...'); // Draw outcome. 
          game.hasEnded = true;
          playAgain(true)
          return 'tie';
        }
      }
    }
  }

  const playAgain = status => {
    const playAgain = document.querySelector('.play-again');
    if (status) {
      playAgain.style.display = 'block';
    } else {
      playAgain.style.display = 'none';
    }
  }

  // Give functionality to our play again button.
  const playAgainText = document.querySelector('.play-again');
  playAgainText.addEventListener('click', function () {
    playAgainText.style.display = 'none';
    game.setup();
    game.newRound();
  });


  const hasEnded = true;

  return { newRound, setup, turn, checkForWinner, hasEnded, aiPlay };
})();



/* Our Module in charge of the Menu */

const Menu = (() => {

  // Initalize our DOM variables. 
  const playerSelection = document.querySelector('.player-selection');
  const solo = document.getElementById('solo');
  const soloMenu = document.querySelector('.solo-menu');
  const multiplayer = document.getElementById('multiplayer');
  const multiplayerMenu = document.querySelector('.mp-menu');
  const audio = document.querySelector('audio');
  const soloReturn = document.querySelector('.return');
  const playerOne = document.querySelector('#p1-input');
  const mpReturn = document.querySelector('.mp-return');
  const mpPlayerOne = document.getElementById('mp-p1');
  const playerTwo = document.getElementById('mp-p2');
  const gameMenu = document.querySelector('.menu-bg');
  const playAgain = document.querySelector('.play-again');
  const enterBtn = document.querySelector('.enter-btn');
  const mpEnterBtn = document.querySelector('.mp-enter-btn');


  // The menu selection at the beginning.  You can select to play vs AI or multiplayer.
  const selection = () => {
    solo.addEventListener('click', function () {
      playerSelection.style.display = 'none';
      soloMenu.style.display = 'block';
      soloPlay();
      audio.play();
    });
    multiplayer.addEventListener('click', function () {
      playerSelection.style.display = 'none';
      multiplayerMenu.style.display = 'block';
      multiplayerPlay();
      audio.play();
    });
  }

  // Go back to the player selection menu and clear values from forms if present.
  soloReturn.addEventListener('click', function () {
    soloMenu.style.display = 'none';
    playerOne.value = '';
    solo.checked = false;
    playerSelection.style.display = 'block';
  });

  // Go back to the player selection menu and clear values from forms if present.
  mpReturn.addEventListener('click', function () {
    multiplayerMenu.style.display = 'none';
    mpPlayerOne.value = '';
    playerTwo.value = '';
    multiplayer.checked = false;
    playerSelection.style.display = 'block';
  });

  const returnHome = document.querySelector('.home');
  returnHome.addEventListener('click', function () {
    console.log('hi');
    gameMenu.style.display = 'block';
    playerSelection.style.display = 'block';
    playAgain.style.display = 'none';
  });

  // Our second menu for solo play, to set the P1 name, and start the game once done.
  const soloPlay = () => {
    enterBtn.addEventListener('click', function () {
      p1.name = document.querySelector('#p1-input').value;
      p1.mark = 'X';
      p2.name = 'AI';
      p2.mark = 'O';
      p2.isAI = true;
      soloMenu.style.display = 'none';
      gameMenu.style.display = 'none';
      game.setup(); // Sets our grid listeners
      game.newRound(); // Starts a new round.
    });
  }

  const multiplayerPlay = () => {
    mpEnterBtn.addEventListener('click', function () {
      p1.name = document.querySelector('#mp-p1').value;
      p1.mark = 'X';
      p2.name = document.querySelector('#mp-p2').value;
      p2.mark = 'O';
      multiplayerMenu.style.display = 'none';
      gameMenu.style.display = 'none';
      game.setup();
      game.newRound();
    });
  }

  return { selection };
})();


/* Our player factory in charge of creating new players, and assigning them functions to obtain their names and marks */

const Player = (name, mark, AI) => {
  const hasTurn = true;
  const isAI = AI;
  const getName = () => name;
  const getMark = () => mark;

  return { getName, getMark, hasTurn, name, mark, isAI };
}

// Startup the menu.

let p1 = Player('P1', 'X', false);
let p2 = Player('P2', 'O', false);

Menu.selection();