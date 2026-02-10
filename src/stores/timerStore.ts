import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TimerState } from "../types";
import * as commands from "../lib/commands";

interface TimerStore {
  timer: TimerState;
  tickInterval: ReturnType<typeof setInterval> | null;
  loading: boolean;
  error: string | null;

  fetchTimerState: () => Promise<void>;
  startTimer: (projectId: string, description?: string) => Promise<void>;
  stopTimer: () => Promise<void>;
  pauseTimer: () => Promise<void>;
  resumeTimer: () => Promise<void>;
  tick: () => void;
  startTicking: () => void;
  stopTicking: () => void;
}

const defaultTimer: TimerState = {
  is_running: false,
  is_paused: false,
  project_id: null,
  project_name: null,
  description: null,
  elapsed_secs: 0,
  start_time: null,
};

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      timer: defaultTimer,
      tickInterval: null,
      loading: false,
      error: null,

      fetchTimerState: async () => {
        try {
          const timer = await commands.getTimerState();
          set({ timer, error: null });
          if (timer.is_running && !timer.is_paused) {
            get().startTicking();
          }
        } catch (e) {
          set({ error: String(e) });
        }
      },

      startTimer: async (projectId: string, description?: string) => {
        set({ loading: true, error: null });
        try {
          await commands.startTimer(projectId, description);
          await get().fetchTimerState();
          get().startTicking();
        } catch (e) {
          set({ error: String(e) });
        } finally {
          set({ loading: false });
        }
      },

      stopTimer: async () => {
        set({ loading: true, error: null });
        try {
          get().stopTicking();
          await commands.stopTimer();
          set({ timer: defaultTimer });
        } catch (e) {
          set({ error: String(e) });
        } finally {
          set({ loading: false });
        }
      },

      pauseTimer: async () => {
        set({ loading: true, error: null });
        try {
          get().stopTicking();
          await commands.pauseTimer();
          await get().fetchTimerState();
        } catch (e) {
          set({ error: String(e) });
        } finally {
          set({ loading: false });
        }
      },

      resumeTimer: async () => {
        set({ loading: true, error: null });
        try {
          await commands.resumeTimer();
          await get().fetchTimerState();
          get().startTicking();
        } catch (e) {
          set({ error: String(e) });
        } finally {
          set({ loading: false });
        }
      },

      tick: () => {
        set((state) => {
          if (state.timer.is_running && !state.timer.is_paused) {
            return {
              timer: {
                ...state.timer,
                elapsed_secs: state.timer.elapsed_secs + 1,
              },
            };
          }
          return state;
        });
      },

      startTicking: () => {
        const existing = get().tickInterval;
        if (existing) clearInterval(existing);
        const interval = setInterval(() => get().tick(), 1000);
        set({ tickInterval: interval });
      },

      stopTicking: () => {
        const interval = get().tickInterval;
        if (interval) clearInterval(interval);
        set({ tickInterval: null });
      },
    }),
    {
      name: "freelanceinvoice-timer",
      partialize: (state) => ({ timer: state.timer }),
    }
  )
);
