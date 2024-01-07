const gameboard = (function () {
    let board = null;
    const createNewBoard = () => board = new Array(9).fill(-1);
    const deleteBoard = () => board = null;

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

    return { createNewBoard, deleteBoard, placeOnBoard, checkIfFullBoard, setFullBoard, checkIfThreeInARow };
})();

function createPlayer(playerName, playerSign) {
    const name = playerName;
    const getName = () => name;

    const sign = playerSign;
    const getSign = () => sign;

    let playerTurn = false;
    const getPlayerTurn = () => playerTurn;
    const makePlayerTurn = () => playerTurn = true;
    const endPlayerTurn = () => playerTurn = false;

    return { getName, getSign, getPlayerTurn, makePlayerTurn, endPlayerTurn };
}

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

const events = (function () {
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

    }

    function setGameScreenEventListeners() {

    }

    function setRoundEndScreenEventListeners() {

    }

    function setGameEndScreenEventListeners() {

    }

    return { setAllEventListeners };
})();

const gameFlow = (function () {
    function setInitialColorTheme() {
        const root = document.documentElement;
        const rootStyles = getComputedStyle(root);
        const systemTheme = rootStyles.getPropertyValue('--theme-name');
        systemTheme == '"LIGHT MODE"' ? root.classList.add('light') : root.classList.add('dark');
    }

    function beginNewGame() {
        events.setAllEventListeners();
        displayController.showHomeScreen();
        gameboard.createNewBoard();
    }

    function endGame() {
        gameboard.deleteBoard();
        displayController.setCurrentScreen(null);
        gameboard.setFullBoard(false);
    }

    return { setInitialColorTheme, beginNewGame, endGame };
})();

gameFlow.setInitialColorTheme();
gameFlow.beginNewGame();