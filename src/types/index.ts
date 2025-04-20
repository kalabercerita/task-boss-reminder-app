
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed' | 'overdue';
export type Location = 'BOSQU' | 'RUMAH' | 'HP GOJEK' | string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  status: Status;
  pic: string;
  priority: Priority;
  location: Location;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderSettings {
  dailyReminders: {
    enabled: boolean;
    times: {
      time: string;
      enabled: boolean;
    }[];
    message: string;
  };
  advanceReminders: {
    enabled: boolean;
    days: number;
    time: string;
    message: string;
  };
  whatsapp: {
    enabled: boolean;
    phoneNumber: string;
  };
  nameInReminder: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  reminderSettings: ReminderSettings;
}
