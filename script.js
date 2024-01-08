const gameboard = (function () {
    let board = null;
    const createNewBoard = () => board = new Array(9).fill(-1);

    function placeOnBoard(space, sign) {
        board[space] = sign;
    }

    let fullBoard = false;
    const checkIfFullBoard = () => fullBoard;
    function setFullBoard(status) {
        fullBoard = status;
    }

    function checkIfThreeInARow() {
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
        sets.forEach(set => {
            const [one, two, three] = set;
            if (board[one] === board[two] && board[two] === board[three]) {
                if (board[one] != -1) {
                    return true;
                }
            }
        })

        return false;
    }

    return { createNewBoard, placeOnBoard, checkIfFullBoard, setFullBoard, checkIfThreeInARow };
})();

function createPlayer(isHuman, playerSign) {
    const human = isHuman;
    const getHumanStatus = () => human;

    const sign = playerSign;
    const getSign = () => sign;

    let turn = false;
    const getTurn = () => turn;
    const setTurn = (status) => turn = status;

    const wins = 0;
    const getWins = () => wins;
    const incrementWins = () => ++wins;

    return { getHumanStatus, getSign, getTurn, setTurn, getWins, incrementWins };
}

const gameInfo = (function () {
    const playerSelectionMode = null;
    const setPlayerSelectionMode = (mode) => playerSelectionMode = mode;
    const getPlayerSelectionMode = () => playerSelectionMode;

    const gameMode = null;
    const setGameMode = (mode) => gameMode = mode;
    const getGameMode = () => gameMode;

    const difficultyMode = null;
    const setDifficultyMode = (mode) => difficultyMode = mode;
    const getDifficultyMode = () => difficultyMode;

    const singleBotSign = null;
    const setSingleBotSign = (sign) => singleBotSign = sign;
    const getSingleBotSign = () => singleBotSign;

    const gameRoundsLeft = null;
    const setGameRoundsLeft = (int) => gameRoundsLeft = int;
    const getGameRoundsLeft = () => gameRoundsLeft;

    return {
        setPlayerSelectionMode, getPlayerSelectionMode, setGameMode, getGameMode, setDifficultyMode, getDifficultyMode,
        setSingleBotSign, getSingleBotSign, setGameRoundsLeft, getGameRoundsLeft
    }
})();

const gameFlow = (function () {
    function beginNewRound() {
        gameboard.createNewBoard();
        gameboard.setFullBoard(false);
    }

    return { beginNewRound };
})();

const displayController = (function () {
    let currentScreen = null;
    const getCurrentScreen = () => currentScreen;
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
        screenToDisplay.classList.remove('hidden-layout');
        currentScreen = screenToDisplay;
    }

    const showHomeScreen = () => displayScreen(screens[0]);
    const showMenuScreen = () => displayScreen(screens[1]);
    const showGameScreen = () => displayScreen(screens[2]);
    const showRoundEndPanel = () => displayScreen(screens[3]);
    const showGameEndPanel = () => displayScreen(screens[4]);

    return { getCurrentScreen, showHomeScreen, showMenuScreen, showGameScreen, showRoundEndPanel, showGameEndPanel };
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
            deselectAllMenuScreenBtns();
            displayController.showHomeScreen();
        });

        document.querySelector('.start-game-button').addEventListener('click', () => {
            deselectAllMenuScreenBtns();
            gameFlow.beginNewRound();
            displayController.showGameScreen();
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
                        otherBtn === btn ? btn.classList.toggle('clicked') : otherBtn.classList.remove('clicked');
                    });
                });
            });
        }

        setModeEventListeners('.player-selection-container>button', gameInfo.setPlayerSelectionMode);
        setModeEventListeners('.modes button', gameInfo.setGameMode);
        setModeEventListeners('.difficulties>button', gameInfo.setDifficultyMode);
        setModeEventListeners('.ai-bot-sign-selection-container button', gameInfo.setSingleBotSign);
        setModeEventListeners('.rounds-container button', gameInfo.setGameRoundsLeft);
    }

    function setGameScreenEventListeners() {

    }

    function setRoundEndScreenEventListeners() {

    }

    function setGameEndScreenEventListeners() {

    }

    return { prepareApp };
})();

setup.setInitialColorTheme();
gameFlow.beginNewGame();