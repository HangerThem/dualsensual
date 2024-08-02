"use client";

import useGamepads from "@/hooks/useGamepads";

export default function Home() {
  const { gamepads, incomingValue } = useGamepads();

  if (gamepads.length === 0) {
    return (
      <main className="flex items-center justify-center bg-gray-900 h-screen">
        <h1 className="text-3xl font-bold text-center text-gray-100">Press LT on your gamepad</h1>
      </main>
    );
  }

  return (
    <main className="flex flex-wrap gap-2 p-6 bg-gray-900 h-screen">
      {gamepads.map((gamepad, index) => (
        <div key={index}>
          <div
            className={`flex items-center justify-center w-6 h-6 ${gamepad.buttons[6].pressed ? 'bg-lime-500' : gamepad.buttons[1].pressed ? 'bg-orange-500' : 'bg-lime-900'} rounded-full`}
          >
            <span
              className={`text-xs font-bold ${gamepad.buttons[6].pressed ? 'text-gray-900' : 'text-gray-100'}`}
            >{gamepad.index}</span>
          </div>
          <h2>{gamepad.buttons[6].value}</h2>
        </div>
      ))}
      <div>
        <h2 className="text-2xl font-bold text-center text-gray-100">Incoming Value: {incomingValue}</h2>
      </div>
    </main>
  );
}
