
import { createClient } from '@supabase/supabase-js';
import { Task, ReminderSettings, User, Status } from '@/types';
import { sendWhatsAppMessage, sendWhatsAppGroupMessage, setFonnteApiKey } from './whatsapp';
import { format, isToday, isPast, isFuture, differenceInDays } from 'date-fns';

const supabaseUrl = 'https://mxfiuzlatssyfsawsjkm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Zml1emxhdHNzeWZzYXdzamttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMTU5MzksImV4cCI6MjA2MDY5MTkzOX0.kXbbaSVNmlJVGZ1Rb9CSrdDkT6EHhWSMqSSJ4GHJ4rk';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to format task status message
export const getTaskStatusMessage = (task: Task, settings: ReminderSettings): string => {
  if (isPast(task.deadline) && task.status !== 'completed') {
    return settings.taskStatusMessages.overdue;
  }
  if (isToday(task.deadline)) {
    return settings.taskStatusMessages.today;
  }
  if (isFuture(task.deadline)) {
    const days = differenceInDays(task.deadline, new Date());
    return settings.taskStatusMessages.upcoming.replace('{days}', days.toString());
  }
  return '';
};

// Reminder function to send WhatsApp messages
export const sendDailyReminders = async () => {
  try {
    // Fetch users with reminder settings
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, name');

    if (userError) throw userError;

    for (const user of users) {
      // Fetch user's reminder settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('reminder_settings')
        .select('settings')
        .eq('user_id', user.id)
        .single();

      if (settingsError) continue;

      const settings = settingsData.settings as ReminderSettings;
      
      // Set the API key for this user
      if (settings.whatsapp?.apiKey) {
        setFonnteApiKey(settings.whatsapp.apiKey);
      }

      // Check if daily reminders are enabled
      if (settings.dailyReminders?.enabled) {
        // Fetch tasks for today grouped by PIC
        const { data: tasks, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .order('deadline', { ascending: true });

        if (tasksError) continue;

        // Group tasks by PIC
        const tasksByPic: Record<string, Task[]> = {};
        tasks.forEach(task => {
          const formattedTask = {
            ...task,
            deadline: new Date(task.deadline),
            createdAt: new Date(task.created_at),
            updatedAt: new Date(task.updated_at)
          } as Task;
          
          if (!tasksByPic[task.pic]) {
            tasksByPic[task.pic] = [];
          }
          
          tasksByPic[task.pic].push(formattedTask);
        });

        // Send reminders to each PIC
        for (const [pic, picTasks] of Object.entries(tasksByPic)) {
          // Find the contact for this PIC
          const contact = settings.contacts.find(c => c.name === pic);
          
          if (contact && contact.phoneNumber) {
            const tasksList = picTasks
              .map(task => `- ${task.title} (${task.location}) - ${getTaskStatusMessage(task, settings)}`)
              .join('\n');
            
            // Prepare reminder message
            const reminderMessage = settings.dailyReminders.message
              .replace('{tasks}', tasksList)
              .replace('{reminder_number}', '1')
              .replace('{name}', pic);
            
            // Send WhatsApp message
            if (settings.whatsapp?.enabled) {
              await sendWhatsAppMessage(
                contact.phoneNumber, 
                reminderMessage
              );
            }
          }
        }
        
        // If group reminders are enabled
        if (settings.whatsapp?.enabled && settings.whatsapp?.useGroups && settings.whatsapp?.groupId) {
          const allTasksList = tasks
            .map(task => {
              const formattedTask = {
                ...task,
                deadline: new Date(task.deadline),
                createdAt: new Date(task.created_at),
                updatedAt: new Date(task.updated_at)
              } as Task;
              
              return `- ${task.title} (${task.location}) - ${task.pic} - ${getTaskStatusMessage(formattedTask, settings)}`;
            })
            .join('\n');
          
          // Prepare group reminder message
          const groupReminderMessage = settings.dailyReminders.message
            .replace('{tasks}', allTasksList)
            .replace('{reminder_number}', '1')
            .replace('{name}', 'Team');
          
          // Send WhatsApp group message
          await sendWhatsAppGroupMessage(
            settings.whatsapp.groupId,
            groupReminderMessage
          );
        }
      }
    }
  } catch (error) {
    console.error('Error sending daily reminders:', error);
  }
};

// Auth functions
export const signUp = async (email: string, password: string, name: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });
    
    if (error) throw error;
    
    if (data.user) {
      // Create user profile
      await supabase.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        name: name
      });
      
      // Create default reminder settings
      await supabase.from('reminder_settings').insert({
        user_id: data.user.id,
        settings: {
          dailyReminders: {
            enabled: true,
            times: [
              { time: "08:00", enabled: true },
              { time: "12:00", enabled: true },
              { time: "17:00", enabled: true }
            ],
            message: `Halo, BOSQU 👋\n\nGue mau ingetin nih! 😎\nIni status tugas lo!:\n\n{tasks}\n\nSampai jumpa besok! 👋 \n\nReminder {reminder_number} via TaskBoss.`
          },
          advanceReminders: {
            enabled: true,
            days: 14,
            time: "07:00",
            message: `Halo, BOS BESAR!! 👋\n\nGue mau ingetin nih!\nUntuk {days} hari ke depan, ada tugas:\n\n{tasks}\n\nHave a nice day!`
          },
          whatsapp: {
            enabled: true,
            phoneNumber: "081280892755"
          },
          nameInReminder: "BOSQU"
        }
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser();
  return data.user;
};

// Task functions
export const getTasks = async () => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('deadline', { ascending: true });
    
  if (error) throw error;
  
  return data.map(task => ({
    ...task,
    deadline: new Date(task.deadline),
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at)
  })) as Task[];
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>) => {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("You must be logged in to create a task");
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description || '',
        deadline: task.deadline.toISOString(),
        status: task.status,
        pic: task.pic,
        priority: task.priority,
        location: task.location,
        user_id: currentUser.id
      })
      .select()
      .single();
      
    if (error) {
      console.error("Error creating task:", error);
      throw error;
    }
    
    return {
      ...data,
      deadline: new Date(data.deadline),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as Task;
  } catch (error) {
    console.error("Error in createTask function:", error);
    throw error;
  }
};

export const updateTask = async (id: string, task: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>>) => {
  const updates: any = { ...task };
  
  if (task.deadline && task.deadline instanceof Date) {
    updates.deadline = task.deadline.toISOString();
  }
  
  try {
    // Make sure the ID is properly formatted
    // Ensure we're not passing a numeric string as a UUID
    const validId = id;
    
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', validId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating task:", error);
      throw error;
    }
    
    return {
      ...data,
      deadline: new Date(data.deadline),
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as Task;
  } catch (error) {
    console.error("Error in updateTask function:", error);
    throw error;
  }
};

export const deleteTask = async (id: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteTask function:", error);
    throw error;
  }
};

export const deleteAllTasks = async () => {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      throw new Error("You must be logged in to delete tasks");
    }
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('user_id', currentUser.id);
      
    if (error) {
      console.error("Error deleting all tasks:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteAllTasks function:", error);
    throw error;
  }
};

// Reminder settings
export const getReminderSettings = async (userId: string): Promise<ReminderSettings> => {
  const { data, error } = await supabase
    .from('reminder_settings')
    .select('settings')
    .eq('user_id', userId)
    .single();
    
  if (error) throw error;
  
  return data.settings as ReminderSettings;
};

// Update reminder settings function
export const updateReminderSettings = async (userId: string, settings: ReminderSettings) => {
  // Set API key if provided
  if (settings.whatsapp?.apiKey) {
    setFonnteApiKey(settings.whatsapp.apiKey);
  }
  
  const { data, error } = await supabase
    .from('reminder_settings')
    .update({ settings })
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  
  return data.settings as ReminderSettings;
};

// Get all tasks with improved sorting
export const getAllTasks = async (): Promise<Task[]> => {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      console.warn("No logged in user found, returning sample data.");
      return SAMPLE_TASKS;
    }
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('status', { ascending: false })  // Completed tasks at the bottom
      .order('deadline', { ascending: true }); // Sort by deadline
      
    if (error) throw error;
    
    // Process tasks and determine status (overdue etc.)
    const processedTasks = data.map(task => {
      const deadline = new Date(task.deadline);
      const now = new Date();
      
      // Update the status if the task is overdue
      let status = task.status;
      if (isPast(deadline) && task.status !== 'completed' && 
          task.status !== 'canceled' && task.status !== 'hold' &&
          task.status !== 'to-review') {
        status = 'overdue';
      }
      
      return {
        ...task,
        status,
        deadline,
        createdAt: new Date(task.created_at),
        updatedAt: new Date(task.updated_at)
      } as Task;
    });
    
    // Sort: overdue first, then today, then future, with completed last
    return processedTasks.sort((a, b) => {
      // Completed tasks go to the bottom
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      
      // Overdue tasks go to the top
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (a.status !== 'overdue' && b.status === 'overdue') return 1;
      
      // Today's tasks come next
      if (isToday(a.deadline) && !isToday(b.deadline)) return -1;
      if (!isToday(a.deadline) && isToday(b.deadline)) return 1;
      
      // Then sort by deadline
      return a.deadline.getTime() - b.deadline.getTime();
    });
  } catch (error) {
    console.error("Error in getAllTasks function:", error);
    throw error;
  }
};
