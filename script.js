const gameboard = (function () {
    let board = null;
    const getBoard = () => board;

    function createNewBoard() {
        board = new Array(9).fill(-1);
        document.querySelectorAll('.game-grid-container div').forEach(spaceDiv => {
            spaceDiv.classList.remove('x-placed', 'o-placed');
        });
    }

    function placeOnBoard(spaceIndex, spaceDiv, sign) {
        board[spaceIndex] = sign;
        if (sign === 'X') {
            spaceDiv.classList.add('x-placed');
            spaceDiv.classList.remove('x-hover');
        } else {
            spaceDiv.classList.add('o-placed');
            spaceDiv.classList.remove('o-hover');
        }
    }

    function spaceIsFree(spaceIndex) {
        return board[spaceIndex] === -1;
    }

    const checkIfTie = () => board.every(value => value != -1);

    function checkIfThreeInARowAndSigns() {
        // Define the collection of rows on the board 
        const sets = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        // Check if any row in sets is contains only X or only O
        let winningSigns = [];
        sets.forEach(set => {
            const [one, two, three] = set;
            if (board[one] === board[two] && board[two] === board[three]) {
                if (board[one] != -1) {
                    winningSigns.push(board[one]);
                }
            }
        });

        return winningSigns;
    }

    function randomlySwitchFilledSpaceSign() {
        const randomIndex = Math.floor(Math.random() * 9);
        const randomSign = Math.random() < 0.5 ? 'X' : 'O';
        board[randomIndex] = randomSign;
        return [randomIndex, randomSign];
    }

    return { getBoard, createNewBoard, placeOnBoard, spaceIsFree, checkIfTie, checkIfThreeInARowAndSigns, randomlySwitchFilledSpaceSign };
})();

function createPlayer(humanStatus, playerSign) {
    const human = humanStatus;
    const isHuman = () => human;

    const sign = playerSign;
    const getSign = () => sign;

    let turn = false;
    const getTurn = () => turn;
    const setTurn = (status) => turn = status;

    let wins = 0;
    const getWins = () => wins;
    const incrementWins = () => ++wins;
    const decrementWins = () => --wins;

    return { isHuman, getSign, getTurn, setTurn, getWins, incrementWins, decrementWins };
}

const gameInfo = (function () {
    let playerSelectionMode = null;
    const setPlayerSelectionMode = (mode) => playerSelectionMode = mode;
    const getPlayerSelectionMode = () => playerSelectionMode;

    let gameMode = null;
    const setGameMode = (mode) => gameMode = mode;
    const getGameMode = () => gameMode;

    let difficultyMode = null;
    const setDifficultyMode = (mode) => difficultyMode = mode;
    const getDifficultyMode = () => difficultyMode;

    let botSign = null;
    const setBotSign = (sign) => botSign = sign;
    const getBotSign = () => botSign;

    let gameRounds = null;
    const setGameRounds = (int) => gameRounds = int;
    const getGameRounds = () => gameRounds;

    return {
        setPlayerSelectionMode, getPlayerSelectionMode, setGameMode, getGameMode, setDifficultyMode, getDifficultyMode,
        setBotSign, getBotSign, setGameRounds, getGameRounds
    }
})();

const gameFlow = (function () {
    let playerX = null;
    let playerO = null;
    let ties = 0;
    let AITurnExecuting = false;
    const AITurnIsExecuting = () => AITurnExecuting;
    let roundsLeft = null;

    function beginNewGame() {
        ties = 0;
        roundsLeft = gameInfo.getGameRounds();

        switch (gameInfo.getPlayerSelectionMode()) {
            case "PLAYER VS PLAYER":
                playerX = createPlayer(true, 'X');
                playerO = createPlayer(true, 'O');
                break;
            case "PLAYER VS AI BOT":
                function createPlayersByHumanSymbol(humanSymbol) {
                    if (humanSymbol === 'X') {
                        playerO = createPlayer(false, 'O');
                        playerX = createPlayer(true, 'X');
                    } else {
                        // humanSymbol === 'O'
                        playerO = createPlayer(true, 'O');
                        playerX = createPlayer(false, 'X');
                    }
                }

                if (gameInfo.getBotSign() === 'X') {
                    createPlayersByHumanSymbol('O');
                } else if (gameInfo.getBotSign() === 'O') {
                    createPlayersByHumanSymbol('X');
                } else {
                    // gameInfo.getBotSign() === 'RANDOM'
                    const symbols = ['X', 'O'];
                    const randomIndex = Math.floor(Math.random() * symbols.length);
                    createPlayersByHumanSymbol(symbols[randomIndex]);
                    gameInfo.setBotSign(symbols[1 - randomIndex]);
                }
        }

        beginNewRound();
    }

    function beginNewRound() {
        gameboard.createNewBoard();
        playerX.setTurn(true);
        updateTurnNotice('X');
        if (!playerX.isHuman()) {
            AITurnExecuting = true;
            setTimeout(function () {
                aiBot.makeMove();
                AITurnExecuting = false;
                switchTurns();
            }, 1000);
        }

        if (gameInfo.getGameRounds() > 1) {
            document.querySelector('.round-count').textContent = `ROUND ${gameInfo.getGameRounds() - roundsLeft + 1}`;
        } else {
            document.querySelector('.round-count').textContent = '';
        }

        document.querySelector('.player-x .score').textContent = playerX.getWins();
        document.querySelector('.player-o .score').textContent = playerO.getWins();
        document.querySelector('.ties .score').textContent = ties;
    }

    function endRoundIfOver() {
        if (gameboard.checkIfThreeInARowAndSigns().length != 0 || gameboard.checkIfTie()) {
            if (gameInfo.getGameMode() === "TRICK") {
                const signs = trick();
                setTimeout(() => {
                    endRound(signs);
                }, 6500);
            } else { // Game mode is CLASSIC
                setup.deactivateGridEventListeners();
                setTimeout(() => {
                    endRound(gameboard.checkIfThreeInARowAndSigns());
                }, 650);
                setTimeout(() => {
                    setup.activateGridEventListeners();
                }, 950);
            }

            return true;
        }

        return false;
    }

    function endRound(signs) {
        // There could be multiple wins for either side so need to loop through the signs array
        signs.forEach(sign => {
            switch (sign) {
                case 'X':
                    playerX.incrementWins();
                    break;
                case 'O':
                    playerO.incrementWins();
            }
        });

        roundsLeft--;
        if (roundsLeft === 0) {
            setTimeout(() => {
                endGame();
            }, 200);
        } else {
            const announcement = document.querySelector('.round-end-panel .announcement');
            const sign = document.querySelector('.round-end-panel .sign');
            if (signs.length != 0) { //Someone won
                announcement.textContent = "THE WINNING PLAYER IS";
                announcement.style.cssText = "color: var(--text-color);";
                if (signs.includes('X') && signs.includes('O')) {
                    sign.textContent = 'both';
                    sign.style.cssText = "background: linear-gradient(to right, var(--x-color), var(--o-color)); background-clip: text; color: transparent;";
                } else if (signs.includes('X')) {
                    sign.textContent = 'X';
                    sign.style.cssText = "color: var(--x-color);";
                } else {
                    sign.textContent = 'O';
                    sign.style.cssText = "color: var(--o-color);";
                }
            } else { // It's a draw
                announcement.textContent = "IT'S A DRAW";
                announcement.style.cssText = "background: linear-gradient(to right, var(--x-color), var(--o-color)); background-clip: text; color: transparent;";
                sign.textContent = '';
                const tieImage = document.createElement('img');
                tieImage.src = "./assets/images/handshake.jpg";
                tieImage.alt = "Handshake";
                tieImage.style.cssText = "width: 20%; height: 20%; border-radius: 50%;";
                sign.appendChild(tieImage);
                ties++;
            }
            setTimeout(() => {
                displayController.showRoundEndPanel();
            }, 200);
        }
    }

    function endGame() {
        displayController.showGameEndPanel();
        const gameEndSign = document.querySelector('.game-end-sign');
        if (playerX.getWins() > playerO.getWins()) {
            document.querySelector('.game-end-panel .announcement').style.cssText = "color: var(--text-color);";
            gameEndSign.textContent = 'X';
            document.querySelector('.game-end-sign').style.color = "var(--x-color)";
        } else if (playerX.getWins() < playerO.getWins()) {
            document.querySelector('.game-end-panel .announcement').style.cssText = "color: var(--text-color);";
            gameEndSign.textContent = 'O';
            document.querySelector('.game-end-sign').style.color = "var(--o-color)";
        } else {
            ties++;
            document.querySelector('.game-end-panel .announcement').textContent = "IT'S A DRAW";
            document.querySelector('.game-end-panel .announcement').style.cssText = "background: linear-gradient(to right, var(--x-color), var(--o-color)); background-clip: text; color: transparent;";
        }
        document.querySelector('.game-end-panel .player-x .score').textContent = playerX.getWins();
        document.querySelector('.game-end-panel .player-o .score').textContent = playerO.getWins();
        document.querySelector('.game-end-panel .ties .score').textContent = ties;
    }

    function switchTurns() {
        if (playerX.getTurn()) {
            if (!playerO.isHuman()) {
                AITurnExecuting = true;
                updateTurnNotice('O');
                playerX.setTurn(false);
                playerO.setTurn(true);
                setTimeout(function () {
                    aiBot.makeMove();
                    AITurnExecuting = false;
                    playerX.setTurn(true);
                    playerO.setTurn(false);
                    updateTurnNotice('X');
                    gameFlow.endRoundIfOver(); // Check if the AI's move ended the round
                }, 500);
            } else {
                playerX.setTurn(false);
                playerO.setTurn(true);
                updateTurnNotice('O');
            }
        } else {
            if (!playerX.isHuman()) {
                AITurnExecuting = true;
                updateTurnNotice('X');
                playerX.setTurn(true);
                playerO.setTurn(false);
                setTimeout(function () {
                    aiBot.makeMove();
                    AITurnExecuting = false;
                    playerX.setTurn(false);
                    playerO.setTurn(true);
                    updateTurnNotice('O');
                    gameFlow.endRoundIfOver(); // Check if the AI's move ended the round
                }, 500);
            } else {
                playerX.setTurn(true);
                playerO.setTurn(false);
                updateTurnNotice('X');
            }
        }
    }

    const getCurrentTurnSign = () => playerX.getTurn() ? 'X' : 'O';

    const updateTurnNotice = (sign) => document.querySelector('.turn-notice .sign').textContent = sign;

    function trick() {
        setup.deactivateGridEventListeners();
        document.querySelector('.game-screen .exit-button').classList.add('hidden-layout');
        document.querySelector('.game-screen .restart-button').classList.add('hidden-layout');
        document.querySelector('.game-grid-container').classList.add('grid-wobble');
        setTimeout(() => {
            setup.activateGridEventListeners();
            document.querySelector('.game-screen .exit-button').classList.add('hidden-layout');
            document.querySelector('.game-screen .restart-button').classList.add('hidden-layout');
        }, 7300);
        const [switchedIndex, randomSign] = gameboard.randomlySwitchFilledSpaceSign();
        for (node of document.querySelectorAll('.game-grid-container>div')) {
            if (node.classList.contains(`grid-space-${switchedIndex}`)) {
                setTimeout(() => {
                    document.querySelector('.game-grid-container').classList.remove('grid-wobble');
                    node.classList.add('grid-space-wobble');
                    setTimeout(() => {
                        node.classList.add('bubble', 'tricked');
                    }, 1500);
                    const classToAdd = randomSign === 'X' ? 'x-placed' : 'o-placed';
                    setTimeout(() => {
                        node.classList.remove('x-placed', 'o-placed');
                        node.classList.add(classToAdd);
                    }, 1700);
                }, 2000);
                setTimeout(() => { node.classList.remove('grid-space-wobble', 'bubble', 'tricked') }, 5200);
                break;
            }
        }

        return gameboard.checkIfThreeInARowAndSigns();
    }

    return { AITurnIsExecuting, beginNewGame, beginNewRound, endRoundIfOver, switchTurns, getCurrentTurnSign };
})();

const aiBot = (function () {
    function makeMove() {
        const board = gameboard.getBoard();
        const difficultyMode = gameInfo.getDifficultyMode();
        if (difficultyMode === "EASY") {
            return addMoveToBoard(makeMoveEasy(board));
        } else if (difficultyMode === "MEDIUM") {
            return addMoveToBoard(makeMoveMedium(board));
        } else { // difficultyMode === "TRICKY"
            return addMoveToBoard(makeMoveTricky(board));
        }
    }

    function addMoveToBoard(spaceIndex) {
        gameboard.placeOnBoard(spaceIndex, document.querySelector(`.grid-space-${spaceIndex}`), gameInfo.getBotSign());
    }

    function makeMoveEasy(board) {
        const freeSpaces = [];
        for (let i = 0; i < board.length; i++) {
            if (board[i] === -1) {
                freeSpaces.push(i);
            }
        }
        const randomIndex = Math.floor(Math.random() * freeSpaces.length);
        return freeSpaces[randomIndex];
    }

    function makeMoveMedium(board) {
        // First, check if AI can win
        let move = findWinningMoveMedium(board, gameInfo.getBotSign());
        if (move !== null) return move;

        // Otherwise, block player's winning move
        const playerSign = gameInfo.getBotSign() === 'X' ? 'O' : 'X';
        move = findWinningMoveMedium(board, playerSign);
        if (move !== null) return move;

        // Otherwise, pick a random move
        return makeMoveEasy(board);
    }

    function findWinningMoveMedium(board, botSign) {
        for (let i = 0; i < board.length; i++) {
            if (board[i] === -1) {
                board[i] = botSign;
                if (gameboard.checkIfThreeInARowAndSigns().includes(botSign)) {
                    board[i] = -1;
                    return i;
                }
                board[i] = -1;
            }
        }

        return null;
    }

    function makeMoveTricky(board) {
        let bestScore = -Infinity;
        let move;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === -1) {
                board[i] = gameInfo.getBotSign();
                let score = minimax(board, 0, false);
                board[i] = -1;
                if (score > bestScore) {
                    bestScore = score;
                    move = i;
                }
            }
        }

        return move;
    }

    /* The minimax algorithm is a backtracking algorithm used in decision-making and game theory. It provides an optimal move
       for the player assuming the opponent is also playing optimally. As Tic Tac Toe is a zero-sum game (one player's gain is
       another's loss), the Minimax algorithm is particularly well-suited. */
    function minimax(board, depth, isMaximizing) {
        const playerSign = gameInfo.getBotSign() === 'X' ? 'O' : 'X';
        if (gameboard.checkIfThreeInARowAndSigns().includes(gameInfo.getBotSign())) return 1; // AI win
        if (gameboard.checkIfThreeInARowAndSigns().includes(playerSign)) return -1; // Player win
        if (gameboard.checkIfTie()) return 0; // Tie

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === -1) {
                    board[i] = gameInfo.getBotSign();
                    let score = minimax(board, depth + 1, false);
                    board[i] = -1;
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let i = 0; i < board.length; i++) {
                if (board[i] === -1) {
                    board[i] = playerSign;
                    let score = minimax(board, depth + 1, true);
                    board[i] = -1;
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    return { makeMove };
})();

const displayController = (function () {
    const screens = document.querySelectorAll('body>div');
    function displayScreen(screenToDisplay) {
        screens.forEach(screen => {
            if (screen != screenToDisplay) {
                if (screen.classList.contains('game-screen') &&
                    Array.from(screenToDisplay.classList).some(className => className.includes('panel'))) {
                    // The current node is the game screen
                    screen.classList.add('game-screen-blur');
                } else {
                    screen.classList.add('hidden-layout');
                }
            }
        });
        if (screenToDisplay.classList.contains('game-end-panel') || screenToDisplay.classList.contains('round-end-panel')) {
            // The current node is a panel
            document.querySelector('.game-screen .exit-button').classList.add('hidden-layout');
            document.querySelector('.game-screen .restart-button').classList.add('hidden-layout');
        } else if (screenToDisplay.classList.contains('game-screen')) {
            document.querySelector('.game-screen .exit-button').classList.remove('hidden-layout');
            document.querySelector('.game-screen .restart-button').classList.remove('hidden-layout');

        }
        screenToDisplay.classList.remove('game-screen-blur');
        screenToDisplay.classList.remove('hidden-layout');
    }

    const showHomeScreen = () => displayScreen(screens[0]);
    const showMenuScreen = () => displayScreen(screens[1]);
    const showGameScreen = () => displayScreen(screens[2]);
    const showRoundEndPanel = () => displayScreen(screens[3]);
    const showGameEndPanel = () => displayScreen(screens[4]);

    return { showHomeScreen, showMenuScreen, showGameScreen, showRoundEndPanel, showGameEndPanel };
})();

const setup = (function () {
    function prepareApp() {
        setInitialColorTheme();
        setAllEventListeners();
        displayController.showHomeScreen();
    }

    function setInitialColorTheme() {
        const root = document.documentElement;
        const rootStyles = getComputedStyle(root);
        const systemTheme = rootStyles.getPropertyValue('--theme-name');
        systemTheme == '"LIGHT MODE"' ? root.classList.add('light') : root.classList.add('dark');
    }

    function activateGridEventListeners() {
        document.querySelectorAll('.game-grid-container div').forEach(space => {
            space.addEventListener('mousemove', gridMouseMoveHandler);
            space.addEventListener('mouseleave', gridMouseLeaveHandler);
            space.addEventListener('click', gridClickHandler);
        });
    };

    function deactivateGridEventListeners() {
        document.querySelectorAll('.game-grid-container div').forEach(space => {
            space.removeEventListener('mousemove', gridMouseMoveHandler);
            space.removeEventListener('click', gridClickHandler);
        });
    }

    function gridMouseMoveHandler() {
        if (!gameFlow.AITurnIsExecuting()) {
            if (gameFlow.getCurrentTurnSign() === 'X') {
                this.classList.add('x-hover')
            } else {
                this.classList.add('o-hover');
            }
        }
    }

    function gridMouseLeaveHandler() {
        this.classList.remove('x-hover', 'o-hover');
    }

    function gridClickHandler() {
        const spaceIndex = this.className.charAt(this.className.length - 9);
        if (gameboard.spaceIsFree(spaceIndex) && !gameFlow.AITurnIsExecuting()) {
            gameboard.placeOnBoard(spaceIndex, this, gameFlow.getCurrentTurnSign());
            if (!gameFlow.endRoundIfOver()) gameFlow.switchTurns();
        }
    }

    function setAllEventListeners() {
        setHomeScreenEventListeners();
        setMenuScreenEventListeners();
        setGameScreenEventListeners();
        setRoundEndScreenEventListeners();
        setGameEndScreenEventListeners();
    }

    function setHomeScreenEventListeners() {
        document.querySelector('.start-button').addEventListener('click', () => {
            displayController.showMenuScreen();
        });

        const root = document.documentElement;
        document.querySelector('.theme-button').addEventListener('click', () => {
            root.classList.toggle('light');
            root.classList.toggle('dark');
        });
    }

    function setMenuScreenEventListeners() {
        document.querySelector('.menu-screen .exit-button').addEventListener('click', () => {
            displayController.showHomeScreen();
            deselectAllMenuScreenBtns();
            hideMenuOptionsBelowPlayerSelection();
        });

        function deselectAllMenuScreenBtns() {
            document.querySelectorAll('.menu-screen button').forEach(btn => {
                btn.classList.remove('clicked');
            });
        }

        function setModeEventListeners(selector, gameInfoSetterFunction) {
            const modeBtns = document.querySelectorAll(selector);
            modeBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    gameInfoSetterFunction(btn.textContent);
                    modeBtns.forEach(otherBtn => {
                        otherBtn === btn ? btn.classList.add('clicked') : otherBtn.classList.remove('clicked');
                    });
                });
            });
        }

        setModeEventListeners('.player-selection-container>button', gameInfo.setPlayerSelectionMode);
        setModeEventListeners('.modes button', gameInfo.setGameMode);
        setModeEventListeners('.difficulties>button', gameInfo.setDifficultyMode);
        setModeEventListeners('.ai-bot-sign-selection-container button', gameInfo.setBotSign);
        setModeEventListeners('.rounds-container button', gameInfo.setGameRounds);

        /* the code until end of setMenuScreenEventListeners() is to show the menu options containers consecutively according
           to player selection */
        hideMenuOptionsBelowPlayerSelection();
        function hideMenuOptionsBelowPlayerSelection() {
            document.querySelectorAll('.mode-container, .difficulty-container, .ai-bot-sign-selection-container, .rounds-container, .start-game-button').forEach(elem => {
                elem.classList.add('hidden-layout');
                elem.classList.remove('appear');
            });
        }

        const gridContainer = document.querySelector('.menu-screen .grid-container');
        gridContainer.style.cssText = "height: 100vh;";
        const playerVsAIOptionsNode = document.querySelector('.player-vs-ai-bot-options');
        const roundsNode = document.querySelector('.rounds-container');
        document.querySelectorAll('.player-selection-container>button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.modes button, .difficulties button, .ai-bot-sign-selection-container button, .round-selection-container button').forEach(btn => {
                    btn.classList.remove('clicked');
                });
                hideMenuOptionsBelowPlayerSelection();
                setTimeout(() => {
                    document.querySelector('.mode-container').classList.remove('hidden-layout');
                    document.querySelector('.mode-container').cssText = "opacity: 0; transition: opacity 1s ease-in-out;";
                    setTimeout(() => { document.querySelector('.mode-container').classList.add('appear'); }, 1);
                }, 50);

                gameInfo.setGameMode(null);
                gameInfo.setDifficultyMode(null);
                gameInfo.setBotSign(null);
                gameInfo.setGameRounds(null);

                if (gameInfo.getPlayerSelectionMode() === "PLAYER VS AI BOT") {
                    if (!gridContainer.querySelector('.player-vs-ai-bot-options')) {
                        document.querySelector('.menu-screen .grid-container').insertBefore(playerVsAIOptionsNode, roundsNode);
                    }
                    setCSSForPlayerVsAI();
                } else {
                    if (gridContainer.querySelector('.player-vs-ai-bot-options')) {
                        gridContainer.removeChild(playerVsAIOptionsNode);
                    }
                    setCSSForNotPlayerVsAI();
                }
            });
        });

        function setCSSForPlayerVsAI() {
            roundsNode.style.cssText = "grid-row: 6;";
            gridContainer.style.cssText = "height: 160vh; grid-template-rows: 0.5fr 0.5fr 3fr 2fr 3fr 2fr 1fr;";
            document.querySelector('.start-game-button').style.cssText = "margin-bottom: 0.2vh;";
        }

        function setCSSForNotPlayerVsAI() {
            roundsNode.style.cssText = "grid-row: 4;";
            gridContainer.style.cssText = "height: 110vh;";
            document.querySelector('.start-game-button').style.cssText = "margin-top: 0.5vh;";
        }

        document.querySelectorAll('.modes button').forEach(btn => {
            btn.addEventListener('click', () => {
                gameInfo.setGameMode(btn.textContent);
                if (gameInfo.getPlayerSelectionMode() === "PLAYER VS AI BOT") {
                    document.querySelector('.difficulty-container').classList.remove('hidden-layout');
                    setTimeout(() => {
                        const difficultyContainer = document.querySelector('.difficulty-container');
                        difficultyContainer.classList.add('appear');
                        difficultyContainer.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                    }, 1);
                } else {
                    roundsNode.classList.remove('hidden-layout');
                    setTimeout(() => {
                        roundsNode.classList.add('appear');
                        roundsNode.scrollIntoView({ behavior: "smooth", block: "end", inline: "center" });
                    }, 1);
                }
            });
        });

        document.querySelectorAll('.difficulties>button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.ai-bot-sign-selection-container').classList.remove('hidden-layout');
                setTimeout(() => {
                    const aiBotSignSelectionContainer = document.querySelector('.ai-bot-sign-selection-container');
                    aiBotSignSelectionContainer.classList.add('appear');
                    aiBotSignSelectionContainer.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
                }, 1);
            });
        });

        document.querySelectorAll('.ai-bot-sign-selection-container button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.rounds-container').classList.remove('hidden-layout');
                setTimeout(() => { document.querySelector('.rounds-container').classList.add('appear'); }, 1);
            });
        });

        document.querySelectorAll('.rounds-container button').forEach(btn => {
            btn.addEventListener('click', () => {
                const startGameButton = document.querySelector('.start-game-button');
                startGameButton.classList.remove('hidden-layout');
                startGameButton.scrollIntoViewIfNeeded({ behavior: "smooth", block: "center", inline: "center" });
            });
        });

        /* To get to the start game button, all of the previous selections need to be made (because of the fade in effect),
           so no need to check if all the selections have been made before allowing the user to click the start game button */
        document.querySelector('.start-game-button').addEventListener('click', () => {
            displayController.showGameScreen();
            deselectAllMenuScreenBtns();
            hideMenuOptionsBelowPlayerSelection();
            gameFlow.beginNewGame();
        });
    }

    function setGameScreenEventListeners() {
        document.querySelector('.game-screen .exit-button').addEventListener('click', () => {
            displayController.showMenuScreen();
        });

        document.querySelector('.game-screen .restart-button').addEventListener('click', () => {
            displayController.showGameScreen();
            gameFlow.beginNewGame();
        });

        activateGridEventListeners();
    }

    function setRoundEndScreenEventListeners() {
        document.querySelector('.round-end-panel .quit-button').addEventListener('click', () => {
            displayController.showHomeScreen();
            document.querySelector('.round-end-panel .sign').innerHTML = ''; // Remove all children of the sign span node
        });

        document.querySelector('.round-end-panel .restart-button').addEventListener('click', () => {
            displayController.showGameScreen();
            document.querySelector('.round-end-panel .sign').innerHTML = ''; // Remove all children of the sign span node
            gameFlow.beginNewGame();
        });

        document.querySelector('.round-end-panel .next-round-button').addEventListener('click', () => {
            displayController.showGameScreen();
            document.querySelector('.round-end-panel .sign').innerHTML = ''; // Remove all children of the sign span node
            gameFlow.beginNewRound();
        });
    }

    function setGameEndScreenEventListeners() {
        document.querySelector('.game-end-panel .quit-button').addEventListener('click', () => {
            displayController.showHomeScreen();
        });

        document.querySelector('.game-end-panel .restart-button').addEventListener('click', () => {
            displayController.showGameScreen();
            gameFlow.beginNewGame();
        });
    }

    return { prepareApp, activateGridEventListeners, deactivateGridEventListeners };
})();

function main() {
    setup.prepareApp();
}

main();