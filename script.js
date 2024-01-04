const gameboard = (function () {
    const board = null;
    const createNewBoard = () => board = new Array(9);
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
                return true;
            }
        })

        return false;
    }

    return { createNewBoard, deleteBoard, placeOnBoard, checkIfFullBoard, setFullBoard, checkIfThreeInARow };
})();

function createPlayer(name, sign) {
    const name = name;
    const getName = () => name;

    const sign = sign;
    const getSign = () => sign;

    let playerTurn = false;
    const getPlayerTurn = () => playerTurn;
    const makePlayerTurn = () => playerTurn = true;
    const endPlayerTurn = () => playerTurn = false;

    return { getName, getSign, getPlayerTurn, makePlayerTurn, endPlayerTurn };
}

const displayController = (function () {
    let currentScreen = null;
    function setCurrentScreen(screen) {
        currentScreen = screen;
    }

    function showHomeScreen() {

    }

    function showMenuScreen() {

    }

    function showGameScreen() {

    }

    function showRoundEndPanel() {

    }

    function showGameEndPanel() {

    }

    return { setCurrentScreen, showHomeScreen, showMenuScreen, showGameScreen, showRoundEndPanel, showGameEndPanel };
})();

const events = (function () {
    function setHomeScreenEventListeners() {

    }

    function setMenuScreenEventListeners() {

    }

    function setGameScreenEventListeners() {

    }

    function setRoundEndScreenEventListeners() {

    }

    function setGameEndScreenEventListeners() {

    }

    function setAllEventListeners() {
        setHomeScreenEventListeners();
        setMenuScreenEventListeners();
        setGameScreenEventListeners();
        setRoundEndScreenEventListeners();
        setGameEndScreenEventListeners();
    }

    return { setAllEventListeners };
})();

const gameFlow = (function () {
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

    return { beginNewGame, endGame };
})();