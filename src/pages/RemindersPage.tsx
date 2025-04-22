
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DEFAULT_REMINDER_SETTINGS } from '@/lib/default-data';
import { ReminderSettings } from '@/types';
import { updateReminderSettings, getReminderSettings } from '@/lib/supabase';
import { useToast } from "@/hooks/use-toast";
import { setFonnteApiKey, sendWhatsAppMessage } from '@/lib/whatsapp';
import WhatsAppGroupsManager from '@/components/WhatsAppGroupsManager';
import ContactsManager from '@/components/ContactsManager';
import { 
  Card, CardHeader, CardTitle, CardDescription, CardContent
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

const RemindersPage = () => {
  const { user } = useAuth();
  const [reminderSettings, setReminderSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('Hello! This is a test message from your task manager app.');
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

  const handleWhatsAppEnabledChange = (enabled: boolean) => {
    setReminderSettings(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        enabled: enabled,
      },
    }));
  };

  const handleWhatsAppPhoneChange = (phone: string) => {
    setReminderSettings(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        phoneNumber: phone,
      },
    }));
  };

  const handleWhatsAppApiKeyChange = (apiKey: string) => {
    setReminderSettings(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        apiKey: apiKey,
      },
    }));
  };

  const handleWhatsAppUseGroupsChange = (useGroups: boolean) => {
    setReminderSettings(prev => ({
      ...prev,
      whatsapp: {
        ...prev.whatsapp,
        useGroups: useGroups,
      },
    }));
  };

  const handleNameInReminderChange = (name: string) => {
    setReminderSettings(prev => ({
      ...prev,
      nameInReminder: name,
    }));
  };

  const handleDailyReminderMessageChange = (message: string) => {
    setReminderSettings(prev => ({
      ...prev,
      dailyReminders: {
        ...prev.dailyReminders,
        message: message,
      },
    }));
  };

  const handleAdvanceReminderMessageChange = (message: string) => {
    setReminderSettings(prev => ({
      ...prev,
      advanceReminders: {
        ...prev.advanceReminders,
        message: message,
      },
    }));
  };

  const handleContactsChange = (contacts) => {
    setReminderSettings(prev => ({
      ...prev,
      contacts: contacts,
    }));
  };

  const handleGroupsChange = (groups) => {
    setReminderSettings(prev => ({
      ...prev,
      groups: groups,
    }));
  };

  const handleTaskStatusMessageChange = (key, value) => {
    setReminderSettings(prev => ({
      ...prev,
      taskStatusMessages: {
        ...prev.taskStatusMessages,
        [key]: value,
      },
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

  const handleTestWhatsApp = async () => {
    if (!testPhone) {
      toast({
        title: "Error",
        description: "Please enter a phone number",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update API key if one is provided in settings
      const apiKey = reminderSettings.whatsapp?.apiKey;
      
      await sendWhatsAppMessage(
        testPhone,
        testMessage,
        false,
        apiKey
      );
      
      toast({
        title: "Success",
        description: "WhatsApp test message sent successfully",
      });
    } catch (error) {
      console.error("Failed to send test message:", error);
      toast({
        title: "Error",
        description: `Failed to send test message: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Reminder Settings</h1>
      
      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="daily">Daily Reminders</TabsTrigger>
          <TabsTrigger value="advance">Advance Reminders</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
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
          
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>Manage contacts to send reminders to.</CardDescription>
            </CardHeader>
            <CardContent>
              <ContactsManager 
                contacts={reminderSettings.contacts || []}
                onChange={handleContactsChange}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="daily">
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
              
              <div>
                <Label htmlFor="daily-reminder-message">Message Template</Label>
                <Textarea
                  id="daily-reminder-message"
                  value={reminderSettings.dailyReminders.message}
                  onChange={(e) => handleDailyReminderMessageChange(e.target.value)}
                  placeholder="Daily reminder message template"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can use {name}, {date}, {count}, and {tasks} as placeholders.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advance">
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
              
              <div>
                <Label htmlFor="advance-reminder-message">Message Template</Label>
                <Textarea
                  id="advance-reminder-message"
                  value={reminderSettings.advanceReminders.message}
                  onChange={(e) => handleAdvanceReminderMessageChange(e.target.value)}
                  placeholder="Advance reminder message template"
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  You can use {name}, {date}, {count}, {days}, and {tasks} as placeholders.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="whatsapp">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>WhatsApp Settings</CardTitle>
              <CardDescription>Configure WhatsApp integration for reminders.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-enabled">Enable WhatsApp Reminders</Label>
                <Switch
                  id="whatsapp-enabled"
                  checked={reminderSettings.whatsapp.enabled}
                  onCheckedChange={handleWhatsAppEnabledChange}
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp-phone">Your WhatsApp Phone Number</Label>
                <Input
                  id="whatsapp-phone"
                  type="text"
                  value={reminderSettings.whatsapp.phoneNumber}
                  onChange={(e) => handleWhatsAppPhoneChange(e.target.value)}
                  placeholder="+62xxxxxxxxxx"
                />
              </div>
              
              <div>
                <Label htmlFor="whatsapp-api-key">Fonnte API Key</Label>
                <Input
                  id="whatsapp-api-key"
                  type="password"
                  value={reminderSettings.whatsapp.apiKey || ''}
                  onChange={(e) => handleWhatsAppApiKeyChange(e.target.value)}
                  placeholder="Enter your Fonnte API key"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Get your API key at <a href="https://md.fonnte.com/api" target="_blank" rel="noopener noreferrer" className="text-primary">fonnte.com</a>
                </p>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-use-groups">Use WhatsApp Groups</Label>
                <Switch
                  id="whatsapp-use-groups"
                  checked={reminderSettings.whatsapp.useGroups || false}
                  onCheckedChange={handleWhatsAppUseGroupsChange}
                />
              </div>
              
              {reminderSettings.whatsapp.useGroups && (
                <WhatsAppGroupsManager 
                  groups={reminderSettings.groups || []}
                  onChange={handleGroupsChange}
                />
              )}
              
              <div className="mt-4 border-t pt-4">
                <h3 className="text-lg font-medium mb-2">Test WhatsApp Integration</h3>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="test-phone">Test Phone Number</Label>
                    <Input
                      id="test-phone"
                      type="text"
                      value={testPhone}
                      onChange={(e) => setTestPhone(e.target.value)}
                      placeholder="+62xxxxxxxxxx"
                    />
                  </div>
                  <div>
                    <Label htmlFor="test-message">Test Message</Label>
                    <Textarea
                      id="test-message"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      placeholder="Enter test message"
                    />
                  </div>
                  <Button onClick={handleTestWhatsApp}>Send Test Message</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="messages">
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>Message Templates</CardTitle>
              <CardDescription>Configure custom messages for different task statuses.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label htmlFor="message-overdue">Overdue Tasks</Label>
                <Textarea
                  id="message-overdue"
                  value={reminderSettings.taskStatusMessages?.overdue || ""}
                  onChange={(e) => handleTaskStatusMessageChange('overdue', e.target.value)}
                  placeholder="Message for overdue tasks"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Message to be sent for overdue tasks.
                </p>
              </div>
              
              <div>
                <Label htmlFor="message-today">Today's Tasks</Label>
                <Textarea
                  id="message-today"
                  value={reminderSettings.taskStatusMessages?.today || ""}
                  onChange={(e) => handleTaskStatusMessageChange('today', e.target.value)}
                  placeholder="Message for today's tasks"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Message to be sent for tasks due today.
                </p>
              </div>
              
              <div>
                <Label htmlFor="message-upcoming">Upcoming Tasks</Label>
                <Textarea
                  id="message-upcoming"
                  value={reminderSettings.taskStatusMessages?.upcoming || ""}
                  onChange={(e) => handleTaskStatusMessageChange('upcoming', e.target.value)}
                  placeholder="Message for upcoming tasks"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Message to be sent for upcoming tasks.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleUpdateSettings}>Update Settings</Button>
    </div>
  );
};

export default RemindersPage;
