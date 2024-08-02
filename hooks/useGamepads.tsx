import { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";

type Props = {
  gamepads: Gamepad[];
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
  const [firstTime, setFirstTime] = useState(true);
  const [currentGamepads, setGamepadsInternal] = useState<Gamepad[]>([]);
  const [incomingValue, setIncomingValue] = useState<number>(0);
  const [gamepads, setGamepads] = useState<Gamepad[]>([]);
  const [socket, setSocket] = useState<Socket>();
  const [tmpValue, setTmpValue] = useState<number>(0);
  const prevGamepadStatesRef = useRef<any[]>([]);

  const animationRef = useRef<number>();

  const emitVibration = useCallback(
    (props: { value: number }) => {
      if (socket) {
        socket.emit("trigger", { props });
      }
      setFirstTime(false);
    },
    [socket],
  );

  const gameLoop = useCallback(() => {
    const connectedGamepads = navigator.getGamepads().filter((g) => !!g);
    connectedGamepads.forEach((gamepad) => {
      const leftTriggerIndex = 6;
      const leftTriggerValue = gamepad.buttons[leftTriggerIndex].value;

      if (leftTriggerValue > 0.01) {
        setTmpValue((prev) => Math.min(prev + 0.1, 1));
        emitVibration({
          value: leftTriggerValue,
        });
      } else {
        setTmpValue((prev) => Math.max(prev - 0.1, 0));
      }
    });

    prevGamepadStatesRef.current = connectedGamepads.map((g) => ({
      buttons: g.buttons.map((b) => ({ value: b.value })),
    }));

    setGamepadsInternal(connectedGamepads);

    animationRef.current = requestAnimationFrame(gameLoop);
  }, [emitVibration]);

  useEffect(() => {
    // todo(ft): figure out caching
    // if (
    //   JSON.stringify(gamepads.map((gamepad) => gamepad.buttons)) !==
    //   JSON.stringify(currentGamepads.map((gamepad) => gamepad.buttons))
    // ) {
    // console.log("Gamepads changed:", currentGamepads);
    setGamepads(currentGamepads);
    // }
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
    [updateGamepads],
  );

  const handleGamepadDisconnected = useCallback(
    (event: GamepadEvent) => {
      console.log("Gamepad disconnected:", event.gamepad);
      updateGamepads();
    },
    [updateGamepads],
  );

  useEffect(() => {
    const newSocket = io("https://dslsocket.hangerthem.com");
    newSocket.on("vibrate", ({ props }) => {
      setIncomingValue(props.value);
      handleVibration({
        gamepads: navigator.getGamepads().filter((g) => !!g),
        type: "dual-rumble",
        params: {
          duration: 500,
          strongMagnitude: props.value,
          weakMagnitude: props.value,
        },
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
        handleGamepadDisconnected,
      );
    };
  }, [handleGamepadConnected, handleGamepadDisconnected]);

  return {
    gamepads,
    firstTime,
    incomingValue,
    tmpValue,
  };
}

export default useGamepads;
