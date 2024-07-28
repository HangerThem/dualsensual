const appContainer = document.getElementById("app");
const gamepadsStatusContainer = document.getElementById("connected-gamepads");

let previousState = [];
const drawGamepadData = (gamepads) => {
  if (previousState.length === gamepads.length) {
    return;
  }

  previousState = gamepads;
  gamepadsStatusContainer.textContent = "";
  for (const gamepad of gamepads) {
    const gamepadStatusContainer = document.createElement("div");
    const gamepadStatusIcon = document.createElement("div");
    gamepadStatusIcon.id = `gamepad-${gamepad.index}`;
    const gamepadStatusText = document.createElement("span");
    gamepadStatusText.textContent = gamepad.index;
    gamepadStatusContainer.appendChild(gamepadStatusIcon);
    gamepadStatusContainer.appendChild(gamepadStatusText);

    gamepadsStatusContainer.appendChild(gamepadStatusContainer);
  }
};

const reportPressed = () => {
  const gamepads = navigator.getGamepads().filter((gamepad) => !!gamepad);
  if (gamepads && gamepads.length > 0) {
    drawGamepadData(gamepads);
    for (const gamepad of gamepads) {
      const pressed = gamepad.buttons.findIndex((button) => button.pressed);
      const currentGamepadIndex = gamepads.findIndex(
        (g) => g.index === gamepad.index,
      );
      if (pressed !== -1) {
        const toPlayIdx = (currentGamepadIndex + 1) % gamepads.length;
        console.log("Triggering", toPlayIdx);
        if (pressed === 6 || pressed === 7) {
          gamepads
            .at(toPlayIdx)
            .vibrationActuator.playEffect("trigger-rumble", {
              startDelay: 0,
              duration: 50,
              weakMagnitude: 1.0,
              strongMagnitude: 1.0,
              leftTrigger: gamepad.buttons.at(7).value,
              rightTrigger: gamepad.buttons.at(6).value,
            });
        } else if (pressed === 0) {
          gamepads.at(toPlayIdx).vibrationActuator.playEffect("dual-rumble", {
            startDelay: 0,
            duration: 50,
            weakMagnitude: 1,
            strongMagnitude: 1,
          });
        }

        appContainer.textContent = `Player ${currentGamepadIndex} is currently targetting player ${toPlayIdx}`;
      }

      if (gamepad.buttons.at(1).pressed) {
        document
          .getElementById(`gamepad-${gamepad.index}`)
          .classList.add("pressed");
      } else {
        document
          .getElementById(`gamepad-${gamepad.index}`)
          .classList.remove("pressed");
      }
    }
    requestAnimationFrame(reportPressed);
  }
};

window.addEventListener("gamepadconnected", (e) => {
  console.log(
    "Gamepad connected at index %d: %s. %d buttons, %d axes.",
    e.gamepad.index,
    e.gamepad.id,
    e.gamepad.buttons.length,
    e.gamepad.axes.length,
  );

  reportPressed();
});
