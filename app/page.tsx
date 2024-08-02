"use client";

import useGamepads from "@/hooks/useGamepads";

export default function Home() {
  const { gamepads } = useGamepads();

  if (gamepads.length === 0) {
    return (
      <main className="flex items-center justify-center bg-gray-900 h-screen">
        <h1 className="text-3xl font-bold text-center text-gray-100">Press LT on your gamepad</h1>
      </main>
    );
  }

  return (
    <main className="flex flex-wrap gap-5 p-6 bg-gray-900 h-screen flex-row w-screen justify-center items-center">
      {gamepads.map((gamepad, index) => (
        <div key={index} className="flex gap-2 flex-col">
          <div className="w-6 h-24 bg-gray-800 transform rotate-180">
            <div
              className="h-full bg-lime-500"
              style={{ height: `${gamepad.buttons[6].value * 100}%` }}
            />
          </div>
          <div
            className={`flex items-center justify-center w-6 h-6 ${gamepad.buttons[6].pressed ? 'bg-lime-500' : gamepad.buttons[1].pressed ? 'bg-orange-500' : 'bg-lime-900'} rounded-full`}
          >
            <span
              className={`text-xs font-bold ${gamepad.buttons[6].pressed ? 'text-gray-900' : 'text-gray-100'}`}
            >{gamepad.index}</span>
          </div>
        </div>
      ))}
    </main>
  );
}
