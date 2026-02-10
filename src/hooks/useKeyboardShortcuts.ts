import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTimerStore } from "../stores/timerStore";

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const timer = useTimerStore((s) => s.timer);
  const pauseTimer = useTimerStore((s) => s.pauseTimer);
  const resumeTimer = useTimerStore((s) => s.resumeTimer);
  const stopTimer = useTimerStore((s) => s.stopTimer);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const isMeta = e.metaKey || e.ctrlKey;

      if (isMeta && e.key === "t") {
        e.preventDefault();
        // Toggle timer pause/resume or navigate to time tracking
        if (timer.is_running) {
          if (timer.is_paused) {
            resumeTimer();
          } else {
            pauseTimer();
          }
        } else {
          navigate("/time");
        }
      }

      if (isMeta && e.key === "n") {
        e.preventDefault();
        navigate("/invoices/new");
      }

      if (isMeta && e.shiftKey && e.key === "s") {
        e.preventDefault();
        if (timer.is_running) {
          stopTimer();
        }
      }

      // Navigation shortcuts (no modifier, just number keys)
      if (!isMeta && !e.shiftKey && !e.altKey) {
        switch (e.key) {
          case "1":
            navigate("/");
            break;
          case "2":
            navigate("/clients");
            break;
          case "3":
            navigate("/projects");
            break;
          case "4":
            navigate("/time");
            break;
          case "5":
            navigate("/invoices");
            break;
          case "6":
            navigate("/estimates");
            break;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [navigate, timer, pauseTimer, resumeTimer, stopTimer]);
}
