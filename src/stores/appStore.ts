import { create } from "zustand";
import type { Tier } from "../types";
import * as commands from "../lib/commands";

type Theme = "light" | "dark" | "system";

interface AppStore {
  tier: Tier;
  businessName: string;
  businessEmail: string;
  businessAddress: string;
  defaultHourlyRate: number;
  claudeApiKey: string;
  stripeApiKey: string;
  theme: Theme;
  loading: boolean;

  loadSettings: () => Promise<void>;
  saveSetting: (key: string, value: string) => Promise<void>;
}

export const useAppStore = create<AppStore>()((set) => ({
  tier: "free",
  businessName: "",
  businessEmail: "",
  businessAddress: "",
  defaultHourlyRate: 100,
  claudeApiKey: "",
  stripeApiKey: "",
  theme: "system" as Theme,
  loading: true,

  loadSettings: async () => {
    try {
      const settings = await commands.getAllSettings();
      const map = new Map(settings.map((s) => [s.key, s.value]));

      set({
        tier: (map.get("tier") as Tier) ?? "free",
        businessName: map.get("business_name") ?? "",
        businessEmail: map.get("business_email") ?? "",
        businessAddress: map.get("business_address") ?? "",
        defaultHourlyRate: Number(map.get("default_hourly_rate") ?? "100"),
        claudeApiKey: map.get("claude_api_key") ?? "",
        stripeApiKey: map.get("stripe_api_key") ?? "",
        theme: (map.get("theme") as Theme) ?? "system",
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  saveSetting: async (key: string, value: string) => {
    await commands.setSetting(key, value);
    // Update local state based on key
    const keyMap: Record<string, string> = {
      tier: "tier",
      business_name: "businessName",
      business_email: "businessEmail",
      business_address: "businessAddress",
      default_hourly_rate: "defaultHourlyRate",
      claude_api_key: "claudeApiKey",
      stripe_api_key: "stripeApiKey",
      theme: "theme",
    };
    const stateKey = keyMap[key];
    if (stateKey) {
      set({
        [stateKey]:
          stateKey === "defaultHourlyRate" ? Number(value) : value,
      } as Partial<AppStore>);
    }
  },
}));
