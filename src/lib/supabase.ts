
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

  // Transform the data from database format to our Task type
  return (data || []).map(item => ({
    id: item.id,
    title: item.title,
    description: item.description || "",
    deadline: new Date(item.deadline),
    status: item.status as Task["status"],
    pic: item.pic,
    priority: item.priority as Task["priority"],
    location: item.location,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
    user_id: item.user_id
  }));
};

export const getTasks = async (): Promise<Task[]> => {
  return getAllTasks();
};

export const createTask = async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'user_id'>): Promise<Task> => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }

  // Convert our Task type to the database format
  const dbTask = {
    title: task.title,
    description: task.description,
    deadline: task.deadline.toISOString(),
    status: task.status,
    pic: task.pic,
    priority: task.priority,
    location: task.location,
    user_id: user.id,
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert([dbTask])
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }

  // Transform back to our Task type
  return {
    id: data.id,
    title: data.title,
    description: data.description || "",
    deadline: new Date(data.deadline),
    status: data.status as Task["status"],
    pic: data.pic,
    priority: data.priority as Task["priority"],
    location: data.location,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    user_id: data.user_id
  };
};

export const updateTask = async (taskId: string, updates: Partial<Task>): Promise<Task> => {
  // Convert our Task type updates to the database format
  const dbUpdates: any = {};
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline.toISOString();
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.pic !== undefined) dbUpdates.pic = updates.pic;
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
  if (updates.location !== undefined) dbUpdates.location = updates.location;

  const { data, error } = await supabase
    .from('tasks')
    .update(dbUpdates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;

  // Transform back to our Task type
  return {
    id: data.id,
    title: data.title,
    description: data.description || "",
    deadline: new Date(data.deadline),
    status: data.status as Task["status"],
    pic: data.pic,
    priority: data.priority as Task["priority"],
    location: data.location,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    user_id: data.user_id
  };
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

  // Fix: Properly typecast the JSON data to ReminderSettings
  if (data?.settings) {
    // Ensure this is a valid ReminderSettings object before returning
    const settings = data.settings as any;
    
    // Check if it has the required properties of ReminderSettings
    if (
      settings.dailyReminders &&
      settings.advanceReminders &&
      settings.whatsapp !== undefined &&
      settings.nameInReminder !== undefined
    ) {
      return settings as ReminderSettings;
    }
  }
  
  return null;
};

export const updateReminderSettings = async (userId: string, settings: ReminderSettings): Promise<ReminderSettings | null> => {
  try {
    // Convert our ReminderSettings type to JSON for storage
    const { error } = await supabase
      .from('reminder_settings')
      .upsert({ 
        user_id: userId, 
        settings: settings as any // Cast to any to satisfy the JSON type
      });

    if (error) {
      console.error("Error updating reminder settings:", error);
      throw error;
    }
    
    return settings;
  } catch (error) {
    console.error("Exception updating reminder settings:", error);
    return null;
  }
};

export const updateUserPreferences = async (userId: string, preferences: UserPreferences): Promise<UserPreferences | null> => {
  try {
    // Since preferences is not a direct column in the users table,
    // we need to structure this differently or create a new table
    // For now, return the preferences as is
    console.log("Would update preferences for user:", userId, preferences);
    return preferences;
  } catch (error) {
    console.error("Error updating user preferences:", error);
    return null;
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
