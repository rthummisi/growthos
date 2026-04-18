import { create } from "zustand";

interface AppState {
  pendingApprovals: number;
  alertsCount: number;
  setPendingApprovals: (count: number) => void;
  setAlertsCount: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  pendingApprovals: 0,
  alertsCount: 0,
  setPendingApprovals: (count) => set({ pendingApprovals: count }),
  setAlertsCount: (count) => set({ alertsCount: count })
}));
