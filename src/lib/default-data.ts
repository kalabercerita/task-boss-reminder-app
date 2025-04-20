
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
    message: `Halo, BOSQU 👋

Gue mau ingetin nih! 😎
Ini status tugas lo!:

{tasks}

Sampai jumpa besok! 👋 

Reminder {reminder_number} via TaskBoss.`
  },
  advanceReminders: {
    enabled: true,
    days: 14,
    time: "07:00",
    message: `Halo, BOS BESAR!! 👋

Gue mau ingetin nih!
Untuk {days} hari ke depan, ada tugas:

{tasks}

Have a nice day!`
  },
  whatsapp: {
    enabled: true,
    phoneNumber: "081280892755"
  },
  nameInReminder: "BOSQU"
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
    updatedAt: new Date()
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
    updatedAt: new Date()
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
    updatedAt: new Date()
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
    updatedAt: new Date()
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
    updatedAt: new Date()
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
    updatedAt: new Date()
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
    updatedAt: new Date()
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
    updatedAt: new Date()
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
    updatedAt: new Date()
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
    updatedAt: new Date()
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
    updatedAt: new Date()
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
    updatedAt: new Date()
  }
];
