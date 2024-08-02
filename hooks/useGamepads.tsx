import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type Props = {
  gamepads: Gamepad[]
  type: GamepadHapticEffectType;
  params: GamepadEffectParameters;
};

const handleVibration = ({ gamepads, type, params: effectParams }: Props) => {
  for (const gamepad of gamepads) {
    const haptics = gamepad.vibrationActuator;
    if (haptics) {
      haptics.playEffect(type, {
        startDelay: 0,
        ...effectParams,
      });
    }
  }
};

function useGamepads() {
  const [currentGamepads, setGamepadsInternal] = useState<Gamepad[]>([]);
  const [appId, setAppId] = useState<string>();
  const [gamepads, setGamepads] = useState<Gamepad[]>([]);
  const [socket, setSocket] = useState<Socket>();
  const prevGamepadStatesRef = useRef<any[]>([]);

  const animationRef = useRef<number>();

  const emitVibration = useCallback(
    (props: { value: number }) => {
      if (socket) {
        socket.emit("trigger", { props });
      }
    },
    [socket]
  );

  const gameLoop = useCallback(() => {
    const connectedGamepads = navigator.getGamepads().filter((g) => !!g);
    connectedGamepads.forEach((gamepad) => {
      const leftTriggerIndex = 6;
      const leftTriggerValue = gamepad.buttons[leftTriggerIndex].value;

      if (leftTriggerValue > 0.01) {
        emitVibration({
          value: leftTriggerValue,
        });
      }
    });

    prevGamepadStatesRef.current = connectedGamepads.map((g) => ({
      buttons: g.buttons.map((b) => ({ value: b.value })),
    }));

    setGamepadsInternal(connectedGamepads);

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [emitVibration]);

  useEffect(() => {
    if (JSON.stringify(gamepads) !== JSON.stringify(currentGamepads)) {
      setGamepads(currentGamepads);
    }
  }, [currentGamepads, gamepads]);

  const updateGamepads = useCallback(() => {
    const connectedGamepads = navigator.getGamepads().filter((g) => !!g);
    setGamepadsInternal(connectedGamepads);
  }, []);

  const handleGamepadConnected = useCallback(
    (event: GamepadEvent) => {
      console.log("Gamepad connected:", event.gamepad);
      updateGamepads();
    },
    [updateGamepads]
  );

  const handleGamepadDisconnected = useCallback(
    (event: GamepadEvent) => {
      console.log("Gamepad disconnected:", event.gamepad);
      updateGamepads();
    },
    [updateGamepads]
  );

  useEffect(() => {
    const appId = Math.random().toString(36).substring(7);
    setAppId(appId);
    const newSocket = io("https://dslsocket.hangerthem.com");
    newSocket.on("vibrate", ({ value }) => {
      console.log("vibrate", value);
      handleVibration({
        gamepads: navigator
          .getGamepads()
          .filter((g) => !!g),
        type: "dual-rumble",
        params: { duration: 500, strongMagnitude: value, weakMagnitude: value },
      });
    });
    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (socket) {
      animationRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [socket, gameLoop]);

  useEffect(() => {
    window.addEventListener("gamepadconnected", handleGamepadConnected);
    window.addEventListener("gamepaddisconnected", handleGamepadDisconnected);

    return () => {
      window.removeEventListener("gamepadconnected", handleGamepadConnected);
      window.removeEventListener(
        "gamepaddisconnected",
        handleGamepadDisconnected
      );
    };
  }, [handleGamepadConnected, handleGamepadDisconnected]);

  return gamepads;
}

export default useGamepads;
