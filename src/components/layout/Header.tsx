import { TimerWidget } from "../timer/TimerWidget";

export function Header() {
  return (
    <header className="h-14 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="text-xs text-gray-400 dark:text-gray-500">
        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono">
          Cmd+T
        </kbd>{" "}
        Timer{" "}
        <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-[10px] font-mono ml-2">
          Cmd+N
        </kbd>{" "}
        New Invoice
      </div>
      <TimerWidget />
    </header>
  );
}
