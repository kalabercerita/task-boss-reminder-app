
import { createClient } from '@supabase/supabase-js';
import { Task, ReminderSettings, User } from '@/types';

const supabaseUrl = 'https://mxfiuzlatssyfsawsjkm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im14Zml1emxhdHNzeWZzYXdzamttIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxMTU5MzksImV4cCI6MjA2MDY5MTkzOX0.kXbbaSVNmlJVGZ1Rb9CSrdDkT6EHhWSMqSSJ4GHJ4rk';

export const supabase = createClient(supabaseUrl, supabaseKey);

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

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: task.title,
      description: task.description || '',
      deadline: task.deadline.toISOString(),
      status: task.status,
      pic: task.pic,
      priority: task.priority,
      location: task.location
    })
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    ...data,
    deadline: new Date(data.deadline),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  } as Task;
};

export const updateTask = async (id: string, task: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const updates: any = { ...task };
  
  if (task.deadline) {
    updates.deadline = task.deadline.toISOString();
  }
  
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
    
  if (error) throw error;
  
  return {
    ...data,
    deadline: new Date(data.deadline),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at)
  } as Task;
};

export const deleteTask = async (id: string) => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);
    
  if (error) throw error;
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

export const updateReminderSettings = async (userId: string, settings: ReminderSettings) => {
  const { data, error } = await supabase
    .from('reminder_settings')
    .update({ settings })
    .eq('user_id', userId)
    .select()
    .single();
    
  if (error) throw error;
  
  return data.settings as ReminderSettings;
};

// Fonnte WhatsApp API
export const sendWhatsAppMessage = async (phoneNumber: string, message: string) => {
  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': 'pnmk5b5ukhCzBfYJL8HY',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target: phoneNumber,
        message: message
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send WhatsApp message');
    }
    
    return data;
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    throw error;
  }
};
