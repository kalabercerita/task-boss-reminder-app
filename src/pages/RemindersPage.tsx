
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_REMINDER_SETTINGS } from '@/lib/default-data';
import { ReminderSettings } from '@/types';
import { updateReminderSettings, getReminderSettings } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const RemindersPage = () => {
  const { user } = useAuth();
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const { toast } = useToast();

  useEffect(() => {
    const loadReminderSettings = async () => {
      if (user && user.id) {
        try {
          const settings = await getReminderSettings(user.id);
          setReminderSettings(settings || DEFAULT_REMINDER_SETTINGS);
        } catch (error) {
          console.error("Failed to load reminder settings:", error);
          toast({
            title: "Error",
            description: "Failed to load reminder settings",
            variant: "destructive",
          });
          setReminderSettings(DEFAULT_REMINDER_SETTINGS);
        }
      }
    };

    loadReminderSettings();
  }, [user, toast]);

  const handleDailyRemindersEnabledChange = (enabled: boolean) => {
    setReminderSettings(prev => ({
      ...prev,
      dailyReminders: {
        ...prev.dailyReminders,
        enabled: enabled,
      },
    }));
  };

  const handleAdvanceRemindersEnabledChange = (enabled: boolean) => {
    setReminderSettings(prev => ({
      ...prev,
      advanceReminders: {
        ...prev.advanceReminders,
        enabled: enabled,
      },
    }));
  };

  const handleAdvanceRemindersDaysChange = (days: number) => {
    setReminderSettings(prev => ({
      ...prev,
      advanceReminders: {
        ...prev.advanceReminders,
        days: days,
      },
    }));
  };

  const handleAdvanceRemindersTimeChange = (time: string) => {
    setReminderSettings(prev => ({
      ...prev,
      advanceReminders: {
        ...prev.advanceReminders,
        time: time,
      },
    }));
  };

  const handleNameInReminderChange = (name: string) => {
    setReminderSettings(prev => ({
      ...prev,
      nameInReminder: name,
    }));
  };

  const handleUpdateSettings = async () => {
    if (user && user.id) {
      try {
        const updatedSettings = { ...reminderSettings };
        const result = await updateReminderSettings(user.id, updatedSettings);
        if (result) {
          setReminderSettings(result);
          toast({
            title: "Success",
            description: "Reminder settings updated successfully",
          });
        } else {
          toast({
            title: "Warning",
            description: "Settings may not have been saved properly",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to update reminder settings:", error);
        toast({
          title: "Error",
          description: "Failed to update reminder settings",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Reminder Settings</h1>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Daily Reminders</CardTitle>
          <CardDescription>Configure your daily reminder settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-reminders-enabled">Enabled</Label>
            <Switch
              id="daily-reminders-enabled"
              checked={reminderSettings.dailyReminders.enabled}
              onCheckedChange={handleDailyRemindersEnabledChange}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Advance Reminders</CardTitle>
          <CardDescription>Configure your advance reminder settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="advance-reminders-enabled">Enabled</Label>
            <Switch
              id="advance-reminders-enabled"
              checked={reminderSettings.advanceReminders.enabled}
              onCheckedChange={handleAdvanceRemindersEnabledChange}
            />
          </div>
          <div>
            <Label htmlFor="advance-reminders-days">Days in Advance</Label>
            <Input
              id="advance-reminders-days"
              type="number"
              value={String(reminderSettings.advanceReminders.days)}
              onChange={(e) => handleAdvanceRemindersDaysChange(Number(e.target.value))}
            />
          </div>
          <div>
            <Label htmlFor="advance-reminders-time">Time</Label>
            <Input
              id="advance-reminders-time"
              type="time"
              value={reminderSettings.advanceReminders.time}
              onChange={(e) => handleAdvanceRemindersTimeChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Configure general reminder settings.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label htmlFor="name-in-reminder">Name in Reminder</Label>
            <Input
              id="name-in-reminder"
              type="text"
              value={reminderSettings.nameInReminder}
              onChange={(e) => handleNameInReminderChange(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleUpdateSettings}>Update Settings</Button>
    </div>
  );
};

export default RemindersPage;
