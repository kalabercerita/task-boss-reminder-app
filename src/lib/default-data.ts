
import { ReminderSettings, Task } from "@/types";
import { addDays } from "date-fns";

export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  dailyReminders: {
    enabled: true,
    times: [
      { time: "08:00", enabled: true },
      { time: "12:00", enabled: true },
      { time: "17:00", enabled: true }
    ],
    message: `Halo, {name} 👋\n\nIni update status tugas:\n\n{tasks}\n\nSampai jumpa besok! 👋 \n\nReminder {reminder_number} via TaskBoss.`
  },
  advanceReminders: {
    enabled: true,
    days: 14,
    time: "07:00",
    message: `Halo, {name}! 👋\n\nIngatkan untuk {days} hari ke depan:\n\n{tasks}\n\nHave a nice day!`
  },
  whatsapp: {
    enabled: false,
    phoneNumber: "",
    useGroups: false,
    apiKey: "",
    groupId: ""
  },
  nameInReminder: "BOSQU",
  contacts: [],
  groups: [],
  taskStatusMessages: {
    overdue: "terlewat hari / overdue",
    today: "this is the day!!",
    upcoming: "{days} hari lagi"
  }
};

export const SAMPLE_TASKS: Task[] = [
  {
    id: "1",
    title: "Buat berita periksa ayam kecik",
    description: "",
    deadline: new Date(),
    status: "todo",
    pic: "BOSQU",
    priority: "high",
    location: "BOSQU",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  },
  {
    id: "2",
    title: "Buat berita periksa sapi",
    description: "",
    deadline: new Date(),
    status: "todo",
    pic: "BOSQU",
    priority: "high",
    location: "BOSQU",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  },
  {
    id: "3",
    title: "Keluarin triplek, potong bentuk bulat tutup drum",
    description: "",
    deadline: new Date(),
    status: "todo",
    pic: "BOSQU",
    priority: "medium",
    location: "RUMAH",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  },
  {
    id: "4",
    title: "Bahas canva sheet untuk youtube",
    description: "",
    deadline: new Date(),
    status: "in-progress",
    pic: "BOSQU",
    priority: "medium",
    location: "HP GOJEK",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  },
  {
    id: "5",
    title: "Beli baut untuk brakiasi",
    description: "",
    deadline: new Date(),
    status: "todo",
    pic: "BOSQU",
    priority: "low",
    location: "RUMAH",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  },
  {
    id: "6",
    title: "Beli pompa galon",
    description: "",
    deadline: new Date(),
    status: "todo",
    pic: "BOSQU",
    priority: "low",
    location: "RUMAH",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  },
  {
    id: "7",
    title: "Pelajari n8n.io",
    description: "",
    deadline: new Date(),
    status: "todo",
    pic: "BOSQU",
    priority: "medium",
    location: "HP GOJEK",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  },
  {
    id: "8",
    title: "Rekap media sosial 1-13 April",
    description: "",
    deadline: addDays(new Date(), 5),
    status: "todo",
    pic: "BOSQU",
    priority: "high",
    location: "BOSQU",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  },
  {
    id: "9",
    title: "Buat desain hari paskah 20 april 2025",
    description: "",
    deadline: addDays(new Date(), 1),
    status: "todo",
    pic: "BOSQU",
    priority: "high",
    location: "BOSQU",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  },
  {
    id: "10",
    title: "Karantina sepekan",
    description: "",
    deadline: addDays(new Date(), 3),
    status: "todo",
    pic: "BOSQU",
    priority: "medium",
    location: "BOSQU",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  },
  {
    id: "11",
    title: "Ambu tahsin jam 10",
    description: "",
    deadline: new Date(),
    status: "todo",
    pic: "BOSQU",
    priority: "medium",
    location: "RUMAH",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  },
  {
    id: "12",
    title: "Week Pertama Kuliah",
    description: "",
    deadline: addDays(new Date(), 7),
    status: "todo",
    pic: "BOSQU",
    priority: "high",
    location: "HP GOJEK",
    createdAt: new Date(),
    updatedAt: new Date(),
    user_id: "sample-user-id"
  }
];
