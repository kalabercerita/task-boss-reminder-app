
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateReminderSettings } from "@/lib/supabase";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { ReminderSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_REMINDER_SETTINGS } from "@/lib/default-data";

const RemindersPage = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<ReminderSettings>(DEFAULT_REMINDER_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (user && user.reminderSettings) {
      setSettings(user.reminderSettings);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const updatedSettings = await updateReminderSettings(user.id, settings);
      
      // Update user context with new settings
      setUser({
        ...user,
        reminderSettings: updatedSettings,
      });
      
      toast({
        title: "Settings Saved",
        description: "Your reminder settings have been updated",
      });
    } catch (error: any) {
      toast({
        title: "Error Saving Settings",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleDailyReminder = (value: boolean) => {
    setSettings({
      ...settings,
      dailyReminders: {
        ...settings.dailyReminders,
        enabled: value,
      },
    });
  };

  const handleToggleReminderTime = (index: number, value: boolean) => {
    const updatedTimes = [...settings.dailyReminders.times];
    updatedTimes[index] = { ...updatedTimes[index], enabled: value };
    
    setSettings({
      ...settings,
      dailyReminders: {
        ...settings.dailyReminders,
        times: updatedTimes,
      },
    });
  };

  const handleChangeReminderTime = (index: number, value: string) => {
    const updatedTimes = [...settings.dailyReminders.times];
    updatedTimes[index] = { ...updatedTimes[index], time: value };
    
    setSettings({
      ...settings,
      dailyReminders: {
        ...settings.dailyReminders,
        times: updatedTimes,
      },
    });
  };

  const handleToggleAdvanceReminder = (value: boolean) => {
    setSettings({
      ...settings,
      advanceReminders: {
        ...settings.advanceReminders,
        enabled: value,
      },
    });
  };

  const handleToggleWhatsApp = (value: boolean) => {
    setSettings({
      ...settings,
      whatsapp: {
        ...settings.whatsapp,
        enabled: value,
      },
    });
  };

  const handleChangeAdvanceDays = (value: string) => {
    setSettings({
      ...settings,
      advanceReminders: {
        ...settings.advanceReminders,
        days: parseInt(value) || 14,
      },
    });
  };

  const handleChangeAdvanceTime = (value: string) => {
    setSettings({
      ...settings,
      advanceReminders: {
        ...settings.advanceReminders,
        time: value,
      },
    });
  };

  const handleChangePhoneNumber = (value: string) => {
    setSettings({
      ...settings,
      whatsapp: {
        ...settings.whatsapp,
        phoneNumber: value,
      },
    });
  };

  const handleChangeDailyMessage = (value: string) => {
    setSettings({
      ...settings,
      dailyReminders: {
        ...settings.dailyReminders,
        message: value,
      },
    });
  };

  const handleChangeAdvanceMessage = (value: string) => {
    setSettings({
      ...settings,
      advanceReminders: {
        ...settings.advanceReminders,
        message: value,
      },
    });
  };

  const handleChangeNameInReminder = (value: string) => {
    setSettings({
      ...settings,
      nameInReminder: value,
    });
  };

  const handleTestMessage = async (messageType: 'daily' | 'advance') => {
    if (!settings.whatsapp.enabled) {
      toast({
        title: "WhatsApp Not Enabled",
        description: "Please enable WhatsApp reminders first",
        variant: "destructive",
      });
      return;
    }
    
    if (!settings.whatsapp.phoneNumber) {
      toast({
        title: "No Phone Number",
        description: "Please enter a phone number for testing",
        variant: "destructive",
      });
      return;
    }
    
    setTestLoading(true);
    try {
      const messageTemplate = messageType === 'daily' 
        ? settings.dailyReminders.message 
        : settings.advanceReminders.message;
      
      const sampleMessage = messageTemplate
        .replace('{tasks}', 'Sample task 1\nSample task 2')
        .replace('{reminder_number}', '1')
        .replace('{days}', settings.advanceReminders.days.toString());
      
      await sendWhatsAppMessage(settings.whatsapp.phoneNumber, sampleMessage);
      
      toast({
        title: "Test Message Sent",
        description: "WhatsApp test message was sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error Sending Test Message",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reminder Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Configure WhatsApp Reminders</CardTitle>
          <CardDescription>
            Set up and customize your task reminder messages via WhatsApp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="general">General Settings</TabsTrigger>
              <TabsTrigger value="daily">Daily Status</TabsTrigger>
              <TabsTrigger value="advance">Advance Reminders</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="whatsapp-enabled">Enable WhatsApp Reminders</Label>
                    <Switch
                      id="whatsapp-enabled"
                      checked={settings.whatsapp.enabled}
                      onCheckedChange={handleToggleWhatsApp}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Turn on to receive task reminders via WhatsApp
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone-number">WhatsApp Phone Number</Label>
                  <Input
                    id="phone-number"
                    value={settings.whatsapp.phoneNumber}
                    onChange={(e) => handleChangePhoneNumber(e.target.value)}
                    placeholder="e.g., 628123456789"
                    disabled={!settings.whatsapp.enabled}
                  />
                  <p className="text-sm text-muted-foreground">
                    Enter your WhatsApp number with country code (e.g., 628123456789)
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="name-in-reminder">Your Name in Reminders</Label>
                  <Input
                    id="name-in-reminder"
                    value={settings.nameInReminder}
                    onChange={(e) => handleChangeNameInReminder(e.target.value)}
                    placeholder="e.g., BOSQU, Boss, etc."
                  />
                  <p className="text-sm text-muted-foreground">
                    How would you like to be addressed in reminders?
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="daily">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="daily-enabled">Enable Daily Status Reminders</Label>
                    <Switch
                      id="daily-enabled"
                      checked={settings.dailyReminders.enabled}
                      onCheckedChange={handleToggleDailyReminder}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily summary of your task status
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Reminder Times</h3>
                  <div className="space-y-4">
                    {settings.dailyReminders.times.map((time, index) => (
                      <div key={index} className="flex items-center gap-4">
                        <Switch
                          id={`time-${index}`}
                          checked={time.enabled}
                          onCheckedChange={(value) => handleToggleReminderTime(index, value)}
                          disabled={!settings.dailyReminders.enabled}
                        />
                        <Input
                          type="time"
                          value={time.time}
                          onChange={(e) => handleChangeReminderTime(index, e.target.value)}
                          className="w-32"
                          disabled={!settings.dailyReminders.enabled || !time.enabled}
                        />
                        <span className="text-sm text-muted-foreground">
                          Reminder #{index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Configure up to 3 daily reminders at different times
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="daily-message">Daily Reminder Message Template</Label>
                  <Textarea
                    id="daily-message"
                    value={settings.dailyReminders.message}
                    onChange={(e) => handleChangeDailyMessage(e.target.value)}
                    placeholder="Enter your custom message template"
                    rows={10}
                    disabled={!settings.dailyReminders.enabled}
                  />
                  <p className="text-sm text-muted-foreground">
                    Use {'{tasks}'} for task list, {'{reminder_number}'} for reminder number
                  </p>
                </div>
                
                <Button 
                  onClick={() => handleTestMessage('daily')}
                  disabled={testLoading || !settings.whatsapp.enabled || !settings.dailyReminders.enabled}
                >
                  {testLoading ? "Sending..." : "Test Daily Reminder"}
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="advance">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="advance-enabled">Enable Advance Reminders</Label>
                    <Switch
                      id="advance-enabled"
                      checked={settings.advanceReminders.enabled}
                      onCheckedChange={handleToggleAdvanceReminder}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Get notified about upcoming tasks in advance
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="advance-days">Reminder Days</Label>
                    <Input
                      id="advance-days"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.advanceReminders.days}
                      onChange={(e) => handleChangeAdvanceDays(e.target.value)}
                      disabled={!settings.advanceReminders.enabled}
                    />
                    <p className="text-sm text-muted-foreground">
                      How many days to look ahead
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="advance-time">Reminder Time</Label>
                    <Input
                      id="advance-time"
                      type="time"
                      value={settings.advanceReminders.time}
                      onChange={(e) => handleChangeAdvanceTime(e.target.value)}
                      disabled={!settings.advanceReminders.enabled}
                    />
                    <p className="text-sm text-muted-foreground">
                      What time to send the reminder
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="advance-message">Advance Reminder Message Template</Label>
                  <Textarea
                    id="advance-message"
                    value={settings.advanceReminders.message}
                    onChange={(e) => handleChangeAdvanceMessage(e.target.value)}
                    placeholder="Enter your custom message template"
                    rows={10}
                    disabled={!settings.advanceReminders.enabled}
                  />
                  <p className="text-sm text-muted-foreground">
                    Use {'{tasks}'} for task list, {'{days}'} for number of days
                  </p>
                </div>
                
                <Button 
                  onClick={() => handleTestMessage('advance')}
                  disabled={testLoading || !settings.whatsapp.enabled || !settings.advanceReminders.enabled}
                >
                  {testLoading ? "Sending..." : "Test Advance Reminder"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            Powered by Fonnte.com WhatsApp API
          </p>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RemindersPage;
