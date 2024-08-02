"use client";

import useGamepads from "@/hooks/useGamepads";

export default function Home() {
  const gamepads = useGamepads();

  return (
    <main className="flex flex-wrap gap-2 p-6 bg-gray-900 h-screen">
      {gamepads.map((gamepad, index) => (
        <div
          key={index}
          className={`flex items-center justify-center w-6 h-6 bg-lime-${gamepad.buttons[3].value > 0 ? "500" : "200"
            } rounded-full`}
        >
          <span>{gamepad.index}</span>
        </div>
      ))}
    </main>
  );
}
