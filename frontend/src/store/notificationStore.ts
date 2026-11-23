import { create } from 'zustand';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationState {
  id: number;
  message: string;
  type: NotificationType;
  show: boolean;
  showNotification: (message: string, type?: NotificationType) => void;
  hideNotification: () => void;
}

export const useNotificationStore = create<NotificationState>()((set) => ({
  id: 0,
  message: '',
  type: 'info',
  show: false,
  showNotification: (message, type = 'success') =>
    set((state) => ({
      id: state.id + 1,
      message,
      type,
      show: true,
    })),
  hideNotification: () => set({ show: false, message: '' }),
}));
