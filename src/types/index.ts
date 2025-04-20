
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'completed' | 'overdue' | 'to-review' | 'hold' | 'canceled';
// Location values represent different workplaces:
// - BOSQU: Office/Workplace
// - RUMAH: Home
// - HP GOJEK: Mobile (Gojek App)
export type Location = 'BOSQU' | 'RUMAH' | 'HP GOJEK' | string;

export interface Task {
  id: string;
  title: string;
  description?: string;
  deadline: Date;
  status: Status;
  pic: string;        // Person In Charge
  priority: Priority;
  location: Location;  // Where the task should be performed
  createdAt: Date;
  updatedAt: Date;
}

export interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
}

export interface WhatsAppGroup {
  id: string;
  name: string;
  groupId: string;
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
    useGroups: boolean;
    groupId?: string;
    apiKey: string;
  };
  nameInReminder: string;
  contacts: Contact[];
  groups: WhatsAppGroup[];
  taskStatusMessages: {
    overdue: string;
    today: string;
    upcoming: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  reminderSettings: ReminderSettings;
}
