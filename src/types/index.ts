
export type Status = 'todo' | 'in-progress' | 'to-review' | 'hold' | 'completed' | 'canceled' | 'overdue';
export type Priority = 'low' | 'medium' | 'high';
export type Location = string;

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  status: Status;
  pic: string;
  priority: Priority;
  location: Location;
  createdAt: Date;
  updatedAt: Date;
  user_id: string;
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

export interface ReminderTargets {
  useIndividual: boolean;
  useGroups: boolean;
  selectedContacts: string[];
  selectedGroups: string[];
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
    apiKey?: string;
    useGroups?: boolean;
    groupId?: string;
  };
  nameInReminder: string;
  taskStatusMessages: {
    overdue: string;
    today: string;
    upcoming: string;
  };
  contacts: Contact[];
  groups: WhatsAppGroup[];
  dailyTargets?: ReminderTargets;
  advanceTargets?: ReminderTargets;
}

export interface UserPreferences {
  theme: string;
  backgroundColor: string;
  locations: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  reminderSettings?: ReminderSettings;
  preferences?: UserPreferences;
}
