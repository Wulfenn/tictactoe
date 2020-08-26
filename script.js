/* gameBoard module. Our gameBoard can: modify the board, reset the board, set up hover effects for the board, and control the music of the game. */

const gameBoard = (() => {
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
    cell.textContent = gameBoard.board[index - 1];
  }

  // Resets the board.
  const reset = () => {
    gameBoard.board = ['', '', '', '', '', '', '', '', '']; // Reset the array.
    gameBoard.moveCounter = 0;
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
        if (gameBoard.board[index - 1] == '') {
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
        if (gameBoard.board[index - 1] == '') {
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
      gameHeader.textContent = `Your turn... ${p1.name}`;
    } else if (!p1.hasTurn && !game.hasEnded) {
      gameHeader.textContent = `Your turn... ${p2.name}`;
    }
  }

  return { board, modify, reset, updateHover, updateHeader };

})();

/* Our game module. It can: handle player selection, set player names, start a new round, handle turns, and check if there is  winner */

const game = (() => {

  // The menu selection at the beginning.  You can select to play vs AI or multiplayer.
  const menuSelection = () => {
    const playerSelection = document.querySelector('.player-selection');
    const solo = document.getElementById('solo');
    solo.addEventListener('click', function () {
      playerSelection.style.display = 'none';
      const soloMenu = document.querySelector('.solo-menu');
      soloMenu.style.display = 'block';
      soloPlay();
      const audio = document.querySelector('audio');
      audio.play();
      
    });
    const multiplayer = document.getElementById('multiplayer');
    multiplayer.addEventListener('click', function () {
      playerSelection.style.display = 'none';
      const multiplayerMenu = document.querySelector('.mp-menu');
      multiplayerMenu.style.display = 'block';
      multiplayerPlay();
      const audio = document.querySelector('audio');
      audio.play();
    });
  }

  // Go back to the player selection menu and clear values from forms if present.
  const soloReturn = document.querySelector('.return');
  soloReturn.addEventListener('click', function () {
    const soloMenu = document.querySelector('.solo-menu');
    soloMenu.style.display = 'none';
    const p1Input = document.querySelector('#p1-input');
    p1Input.value = '';
    const solo = document.getElementById('solo');
    solo.checked = false;
    const playerSelection = document.querySelector('.player-selection');
    playerSelection.style.display = 'block';
  });

  // Go back to the player selection menu and clear values from forms if present.
  const mpReturn = document.querySelector('.mp-return');
  mpReturn.addEventListener('click', function () {
    const multiplayerMenu = document.querySelector('.mp-menu');
    multiplayerMenu.style.display = 'none';
    const p1Input = document.getElementById('mp-p1');
    p1Input.value = '';
    const p2Input = document.getElementById('mp-p2');
    p2Input.value = '';
    const multiplayer = document.getElementById('multiplayer');
    multiplayer.checked = false;
    const playerSelection = document.querySelector('.player-selection');
    playerSelection.style.display = 'block';
  });

  const returnHome = document.querySelector('.home');
    returnHome.addEventListener('click', function() {
      console.log('hi');
      const gameMenu = document.querySelector('.menu-bg');
      gameMenu.style.display = 'block';
      const playerSelection = document.querySelector('.player-selection');
      playerSelection.style.display = 'block';
      const playAgain = document.querySelector('.play-again');
      playAgain.style.display = 'none';
    });

  // Our second menu for solo play, to set the P1 name, and start the game once done.
  const soloPlay = () => {
    const enterBtn = document.querySelector('.enter-btn');
    enterBtn.addEventListener('click', function () {
      p1.name = document.querySelector('#p1-input').value;
      p1.mark = 'X';
      p2.name = 'AI';
      p2.mark = 'O';
      p2.isAI = true;
      const soloMenu = document.querySelector('.solo-menu');
      soloMenu.style.display = 'none';
      const gameMenu = document.querySelector('.menu-bg');
      gameMenu.style.display = 'none';
      game.setup(); // Sets our grid listeners
      game.newRound(); // Starts a new round.
    });
  }

  const aiPlay = () => {
    let availableMoves = [];
    for (let i = 0; i < gameBoard.board.length; i++) {
      if (gameBoard.board[i] == '') {
        availableMoves.push(i + 1);
      } else {
        continue;
      }
    }
    let random = Math.floor(Math.random() * (availableMoves.length - 0)) + 0;
    let index = availableMoves[random];
    turn(index);

  }

  const multiplayerPlay = () => {
    const mpEnterBtn = document.querySelector('.mp-enter-btn');
    mpEnterBtn.addEventListener('click', function () {
      p1.name = document.querySelector('#mp-p1').value;
      p1.mark = 'X';
      p2.name = document.querySelector('#mp-p2').value;
      p2.mark = 'O';
      const multiplayerMenu = document.querySelector('.mp-menu');
      multiplayerMenu.style.display = 'none';
      const gameMenu = document.querySelector('.menu-bg');
      gameMenu.style.display = 'none';
      game.setup();
      game.newRound();
    });
  }


  // Allows to start a new round, and it resets all board flags.
  const newRound = () => {
    gameBoard.reset();
    p1.hasTurn = true;
    game.hasEnded = false;
    gameBoard.updateHeader();
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
    gameBoard.updateHover(); // Update our hover effects every time the array us changed.
  }

  // Manages game flow.
  const turn = (index) => {
    if (gameBoard.board[index - 1] == '') {
      if (p1.hasTurn && !game.hasEnded) {
        gameBoard.board.splice(index - 1, 1, p1.mark); // Modifies array to insert X or O.
        gameBoard.modify(index);
        p1.hasTurn = false; // Passes the turn to P2
        gameBoard.moveCounter++;
        game.checkForWinner();
        if (p2.isAI) {
          game.aiPlay();
        }
      } else if (!p1.hasTurn && !game.hasEnded) {
        gameBoard.board.splice(index - 1, 1, p2.mark); // Modifies array to insert X or O.
        gameBoard.modify(index);
        p1.hasTurn = true; // Passes the turn to P1
        gameBoard.moveCounter++;
      }
    }
    gameBoard.updateHeader(); // Update whose turn it is.
    game.checkForWinner();  // At the end of every turn, check to see if there is a winner.
  }

  // Allows us to check if the grid has a possible winner, or if it is a draw.
  const checkForWinner = () => {
    if (!game.hasEnded) {
      if (gameBoard.board[0] !== '' && gameBoard.board[0] == gameBoard.board[1] && gameBoard.board[1] == gameBoard.board[2] ||
        gameBoard.board[3] !== '' && gameBoard.board[3] == gameBoard.board[4] && gameBoard.board[4] == gameBoard.board[5] ||
        gameBoard.board[6] !== '' && gameBoard.board[6] == gameBoard.board[7] && gameBoard.board[7] == gameBoard.board[8] ||
        gameBoard.board[0] !== '' && gameBoard.board[0] == gameBoard.board[3] && gameBoard.board[3] == gameBoard.board[6] ||
        gameBoard.board[1] !== '' && gameBoard.board[1] == gameBoard.board[4] && gameBoard.board[4] == gameBoard.board[7] ||
        gameBoard.board[2] !== '' && gameBoard.board[2] == gameBoard.board[5] && gameBoard.board[5] == gameBoard.board[8] ||
        gameBoard.board[0] !== '' && gameBoard.board[0] == gameBoard.board[4] && gameBoard.board[4] == gameBoard.board[8] ||
        gameBoard.board[2] !== '' && gameBoard.board[2] == gameBoard.board[4] && gameBoard.board[4] == gameBoard.board[6]) {

        gameBoard.updateHeader(`Winner is ${p1.hasTurn ? p2.name : p1.name}...`); // Winner outcome. 
        game.hasEnded = true;
        const playAgain = document.querySelector('.play-again');
        playAgain.style.display = 'block';
      } else if (gameBoard.moveCounter == 9) {
        gameBoard.updateHeader('Draw...'); // Draw outcome. 
        game.hasEnded = true;
        const playAgain = document.querySelector('.play-again');
        playAgain.style.display = 'block';
      }
    }
  }

  // Give functionality to our play again button.
  const playAgain = document.querySelector('.play-again');
  playAgain.addEventListener('click', function() {
    playAgain.style.display = 'none';
    game.setup();
    game.newRound();
  });


  const hasEnded = true;

  return { newRound, setup, turn, checkForWinner, hasEnded, menuSelection, aiPlay };
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

game.menuSelection();
