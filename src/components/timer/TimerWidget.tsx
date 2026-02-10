import { useTimerStore } from "../../stores/timerStore";
import { formatDuration } from "../../lib/formatters";

export function TimerWidget() {
  const { timer, stopTimer, pauseTimer, resumeTimer, loading } =
    useTimerStore();

  if (!timer.is_running) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        No timer running
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${
            timer.is_paused ? "bg-warning-500" : "bg-success-500 animate-pulse"
          }`}
        />
        <span className="text-sm font-medium text-gray-700">
          {timer.project_name ?? "Unknown Project"}
        </span>
      </div>

      <span className="text-lg font-mono font-semibold text-gray-900 tabular-nums">
        {formatDuration(timer.elapsed_secs)}
      </span>

      <div className="flex items-center gap-1">
        {timer.is_paused ? (
          <button
            onClick={() => resumeTimer()}
            disabled={loading}
            className="p-1.5 text-success-600 hover:bg-success-50 rounded-lg transition-colors"
            title="Resume"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => pauseTimer()}
            disabled={loading}
            className="p-1.5 text-warning-600 hover:bg-warning-50 rounded-lg transition-colors"
            title="Pause"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          </button>
        )}

        <button
          onClick={() => stopTimer()}
          disabled={loading}
          className="p-1.5 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
          title="Stop"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
