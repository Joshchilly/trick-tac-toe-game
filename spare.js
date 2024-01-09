function setMenuScreenEventListeners() {
    document.querySelector('.menu-screen .exit-button').addEventListener('click', () => {
        deselectAllMenuScreenBtns();
        displayController.showHomeScreen();
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

    document.querySelectorAll('.player-selection-container>button').forEach(btn => {
        btn.addEventListener('click', () => {
            hideMenuOptionsBelowPlayerSelection();
            document.querySelector('.mode-container').classList.remove('hidden-layout');
            document.querySelector('.mode-container').classList.add('appear');
            gameInfo.setGameMode(null);
            gameInfo.setDifficultyMode(null);
            gameInfo.setSingleBotSign(null);
            gameInfo.setGameRounds(null);
        });
    });

    document.querySelectorAll('.modes button').forEach(btn => {
        btn.addEventListener('click', () => {
            if (gameInfo.getPlayerSelectionMode() === "PLAYER VS AI BOT") {
                document.querySelector('.difficulty-container').classList.remove('hidden-layout');
                document.querySelector('.difficulty-container').classList.add('appear');
            } else {
                document.querySelector('.rounds-container').classList.remove('hidden-layout');
                document.querySelector('.rounds-container').classList.add('appear');
            }
        });
    });

    document.querySelectorAll('.difficulties>button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.ai-bot-sign-selection-container').classList.remove('hidden-layout');
            document.querySelector('.ai-bot-sign-selection-container').classList.add('appear');
        });
    });

    document.querySelectorAll('.ai-bot-sign-selection-container button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.rounds-container').classList.remove('hidden-layout');
            document.querySelector('.rounds-container').classList.add('appear');
        });
    });

    document.querySelectorAll('.rounds-container button').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelector('.start-game-button').classList.remove('hidden-layout');
            document.querySelector('.start-game-button').classList.add('appear');
        });
    });

    /* To get to the start game button, all of the previous selections need to be made (because of the fade in effect),
       so no need to check if all the selections have been made before allowing the user to click the start game button */
    document.querySelector('.start-game-button').addEventListener('click', () => {
        displayController.showGameScreen();
        deselectAllMenuScreenBtns();
        hideMenuOptionsBelowPlayerSelection();
        gameFlow.beginNewRound();
    });
}