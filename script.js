const gameboard = (function () {
    let board = null;
    function createNewBoard() {
        board = new Array(9).fill(-1);
        document.querySelectorAll('.game-grid-container div').forEach(spaceDiv => {
            spaceDiv.classList.remove('x-placed', 'o-placed');
        });
    }

    function placeOnBoard(spaceIndex, spaceDiv, sign) {
        board[spaceIndex] = sign;
        sign === 'X' ? spaceDiv.classList.add('x-placed') : spaceDiv.classList.add('o-placed');
    }

    function spaceIsFree(spaceIndex) {
        return board[spaceIndex] === -1;
    }

    const checkIfTie = () => board.every(value => value != -1);

    function checkIfThreeInARowAndSign() {
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
        let winningSign = null;
        sets.forEach(set => {
            const [one, two, three] = set;
            if (board[one] === board[two] && board[two] === board[three]) {
                if (board[one] != -1) {
                    winningSign = board[one];
                }
            }
        });

        return winningSign;
    }

    function randomlySwitchFilledSpaceSign() {
        const randomIndex = Math.floor(Math.random() * 9);
        if (board[randomIndex] === -1) {
            randomlySwitchFilledSpaceSign();
        } else {
            gameboard[randomIndex] = gameboard[randomIndex] === 'X' ? 'O' : 'X';
            return randomIndex;
        }
    }

    return { createNewBoard, placeOnBoard, spaceIsFree, checkIfTie, checkIfThreeInARowAndSign, randomlySwitchFilledSpaceSign };
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

    let singleBotSign = null;
    const setSingleBotSign = (sign) => singleBotSign = sign;
    const getSingleBotSign = () => singleBotSign;

    let gameRounds = null;
    const setGameRounds = (int) => gameRounds = int;
    const getGameRounds = () => gameRounds;

    return {
        setPlayerSelectionMode, getPlayerSelectionMode, setGameMode, getGameMode, setDifficultyMode, getDifficultyMode,
        setSingleBotSign, getSingleBotSign, setGameRounds, getGameRounds
    }
})();

const gameFlow = (function () {
    let playerX = null;
    let playerO = null;
    let ties = null;
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
                        playerX = createPlayer(false, 'X');
                        playerO = createPlayer(true, 'O');
                    }
                }

                if (gameInfo.getSingleBotSign() === 'X') {
                    createPlayersByHumanSymbol('O');
                } else if (gameInfo.getSingleBotSign() === 'O') {
                    createPlayersByHumanSymbol('X');
                } else {
                    // gameInfo.getSingleBotSign() === 'RANDOM'
                    const symbols = ['X', 'O'];
                    const randomIndex = Math.floor(Math.random() * symbols.length);
                    createPlayersByHumanSymbol(symbols[randomIndex]);
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
                AITurnExecuting = false;
                switchTurns();
            }, 2000);
        }

        if (gameInfo.getGameRounds() > 1) {
            document.querySelector('.round-count').textContent = `ROUND ${gameInfo.getGameRounds() - roundsLeft + 1}`;
        }

        document.querySelector('.player-x .score').textContent = playerX.getWins();
        document.querySelector('.player-o .score').textContent = playerO.getWins();
        document.querySelector('.ties .score').textContent = ties;
    }

    function endRoundIfOver() {
        if (gameboard.checkIfThreeInARowAndSign() != null || gameboard.checkIfTie()) {
            const sign = trick();
            setTimeout(() => {
                endRound(sign);
            }, 5300);
        }
    }

    function endRound(winner) {
        switch (winner) {
            case 'X':
                playerX.incrementWins();
                break;
            case 'O':
                playerO.incrementWins();
                break;
            case null:
                ties++;
        }

        roundsLeft--;
        if (roundsLeft === 0) {
            endGame(winner);
        } else {
            const announcement = document.querySelector('.round-end-panel .announcement');
            const sign = document.querySelector('.round-end-panel .sign');
            if (winner != '') { //Someone won
                announcement.textContent = "THE WINNING PLAYER IS";
                sign.classList.remove('draw-image');
                sign.textContent = winner;
            } else { // It's a draw
                announcement.textContent = "IT'S A DRAW";
                sign.classList.add('draw-image');
                sign.textContent = '';
            }
            setTimeout(() => {
                displayController.showRoundEndPanel();
            }, 200);
        }
    }

    function endGame(winner) {
        winner != '' ? document.querySelector('.game-end-panel .announcement .sign').textContent = winner :
            document.querySelector('.game-end-panel .announcement').textContent = "IT'S A DRAW";
        document.querySelector('.game-end-panel .player-x .score').textContent = playerX.getWins();
        document.querySelector('.game-end-panel .player-o .score').textContent = playerO.getWins();
        document.querySelector('.game-end-panel .ties .score').textContent = ties;
        setTimeout(() => {
            displayController.showGameEndPanel();
        }, 200);
    }

    function switchTurns() {
        if (playerX.getTurn()) {
            if (!playerO.isHuman()) {
                AITurnExecuting = true;
                updateTurnNotice('O');
                playerX.setTurn(false);
                playerO.setTurn(true);
                setTimeout(function () {
                    AITurnExecuting = false;
                    playerX.setTurn(true);
                    playerO.setTurn(false);
                    updateTurnNotice('X');
                }, 2000);
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
                    AITurnExecuting = false;
                    playerX.setTurn(false);
                    playerO.setTurn(true);
                    updateTurnNotice('O');
                }, 2000);
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
        document.querySelector('.game-grid-container').classList.add('wobble');
        document.querySelector('.game-screen .exit-button').classList.add('hidden-layout');
        document.querySelector('.game-screen .restart-button').classList.add('hidden-layout');
        setTimeout(() => { setup.activateGridEventListeners(); }, 6000);
        const switchedIndex = gameboard.randomlySwitchFilledSpaceSign();
        for (node of document.querySelectorAll('.game-grid-container>div')) {
            if (node.classList.contains(`grid-space-${switchedIndex}`)) {
                setTimeout(() => {
                    document.querySelector('.game-grid-container').classList.remove('wobble');
                    node.classList.add('tricked', 'bubble');
                    if (node.classList.contains('x-placed')) {
                        node.classList.remove('x-placed');
                        node.classList.add('o-placed')
                    } else { // Node contains class 'o-placed'
                        node.classList.remove('o-placed');
                        node.classList.add('x-placed')
                    }
                }, 2000);
                setTimeout(() => { node.classList.remove('tricked', 'bubble') }, 4000);
                setTimeout(() => {
                    document.querySelector('.game-screen .exit-button').classList.remove('hidden-layout');
                    document.querySelector('.game-screen .restart-button').classList.remove('hidden-layout');
                }, 5500);
                break;
            }
        }

        return gameboard.checkIfThreeInARowAndSign();
    }

    return { AITurnIsExecuting, beginNewGame, beginNewRound, endRoundIfOver, switchTurns, getCurrentTurnSign };
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
            gameFlow.switchTurns();
            gameFlow.endRoundIfOver();
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
        setModeEventListeners('.ai-bot-sign-selection-container button', gameInfo.setSingleBotSign);
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
                hideMenuOptionsBelowPlayerSelection();
                setTimeout(() => {
                    document.querySelector('.mode-container').classList.remove('hidden-layout');
                    document.querySelector('.mode-container').cssText = "opacity: 0; transition: opacity 1s ease-in-out;";
                    setTimeout(() => { document.querySelector('.mode-container').classList.add('appear'); }, 1);
                }, 50);

                gameInfo.setGameMode(null);
                gameInfo.setDifficultyMode(null);
                gameInfo.setSingleBotSign(null);
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
            gridContainer.style.cssText = "height: 145vh;";
            document.querySelector('.start-game-button').style.cssText = "margin-bottom: 35px; top: 0px;";
        }

        function setCSSForNotPlayerVsAI() {
            roundsNode.style.cssText = "grid-row: 4;";
            gridContainer.style.cssText = "height: 100vh;";
            document.querySelector('.start-game-button').style.cssText = "margin-bottom: 35px; top: -45px;";
        }

        document.querySelectorAll('.modes button').forEach(btn => {
            btn.addEventListener('click', () => {
                if (gameInfo.getPlayerSelectionMode() === "PLAYER VS AI BOT") {
                    document.querySelector('.difficulty-container').classList.remove('hidden-layout');
                    setTimeout(() => { document.querySelector('.difficulty-container').classList.add('appear'); }, 1);
                } else {
                    roundsNode.classList.remove('hidden-layout');
                    setTimeout(() => { roundsNode.classList.add('appear'); }, 1);
                }
            });
        });

        document.querySelectorAll('.difficulties>button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelector('.ai-bot-sign-selection-container').classList.remove('hidden-layout');
                setTimeout(() => { document.querySelector('.ai-bot-sign-selection-container').classList.add('appear'); }, 1);
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
                document.querySelector('.start-game-button').classList.remove('hidden-layout');
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
        });

        document.querySelector('.round-end-panel .restart-button').addEventListener('click', () => {
            displayController.showGameScreen();
            gameFlow.beginNewGame();
        });

        document.querySelector('.round-end-panel .next-round-button').addEventListener('click', () => {
            displayController.showGameScreen();
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

const AIBot = (function () {

})();

function main() {
    setup.prepareApp();
}

main();