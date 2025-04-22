
import { Task, User, ReminderSettings, UserPreferences } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export { supabase };

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
      },
    },
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getAllTasks = async (): Promise<Task[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }

  return data || [];
};

export const getTasks = async (): Promise<Task[]> => {
  return getAllTasks();
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>): Promise<Task> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { data, error } = await supabase
    .from('tasks')
    .insert([{ ...task, user_id: user.id, createdAt: new Date(), updatedAt: new Date() }])
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }

  return data;
};

export const updateTask = async (taskId: string, updates: Partial<Task>) => {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', taskId);

  if (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const deleteAllTasks = async (): Promise<void> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('user_id', user.id);

  if (error) {
    console.error("Error deleting all tasks:", error);
    throw error;
  }
};

export const getUserProfile = async (userId: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data || null;
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error("Error updating user profile:", error);
    return null;
  }

  return data || null;
};

export const getReminderSettings = async (userId: string): Promise<ReminderSettings | null> => {
  const { data, error } = await supabase
    .from('reminder_settings')
    .select('settings')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error("Error fetching reminder settings:", error);
    return null;
  }

  return data?.settings || null;
};

export const updateReminderSettings = async (userId: string, settings: ReminderSettings): Promise<void> => {
  const { error } = await supabase
    .from('reminder_settings')
    .upsert({ user_id: userId, settings })
    .select();

  if (error) {
    console.error("Error updating reminder settings:", error);
    throw error;
  }
};

export const updateUserPreferences = async (userId: string, preferences: UserPreferences): Promise<void> => {
  const { error } = await supabase
    .from('users')
    .update({ preferences })
    .eq('id', userId);

  if (error) {
    console.error("Error updating user preferences:", error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email || 'User',
  };
};
