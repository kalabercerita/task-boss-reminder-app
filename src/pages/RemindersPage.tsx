
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateReminderSettings } from "@/lib/supabase";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { ReminderSettings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ContactsManager from "@/components/ContactsManager";
import WhatsAppGroupsManager from "@/components/WhatsAppGroupsManager";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { DEFAULT_REMINDER_SETTINGS } from "@/lib/default-data";
import { Check, Users } from "lucide-react";

const RemindersPage = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  // Initialize settings with the default values including contacts array
  const [settings, setSettings] = useState<ReminderSettings>({
    ...DEFAULT_REMINDER_SETTINGS,
    taskStatusMessages: {
      overdue: "terlewat hari / overdue",
      today: "this is the day!!",
      upcoming: "{days} hari lagi"
    },
    contacts: [],
    groups: [],
    dailyTargets: {
      useIndividual: true,
      useGroups: false,
      selectedContacts: [],
      selectedGroups: []
    },
    advanceTargets: {
      useIndividual: true,
      useGroups: false,
      selectedContacts: [],
      selectedGroups: []
    }
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [testLoading, setTestLoading] = useState(false);

  useEffect(() => {
    if (user && user.reminderSettings) {
      // Make sure we have a fallback for taskStatusMessages, contacts, and targets
      const userSettings = {
        ...user.reminderSettings,
        taskStatusMessages: user.reminderSettings.taskStatusMessages || {
          overdue: "terlewat hari / overdue",
          today: "this is the day!!",
          upcoming: "{days} hari lagi"
        },
        contacts: user.reminderSettings.contacts || [],
        groups: user.reminderSettings.groups || [],
        dailyTargets: user.reminderSettings.dailyTargets || {
          useIndividual: true,
          useGroups: false,
          selectedContacts: [],
          selectedGroups: []
        },
        advanceTargets: user.reminderSettings.advanceTargets || {
          useIndividual: true,
          useGroups: false,
          selectedContacts: [],
          selectedGroups: []
        }
      };
      setSettings(userSettings);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Ensure API key is set before sending test messages
      if (settings.whatsapp?.apiKey) {
        // Update the API key in the whatsapp.ts module
        await sendWhatsAppMessage("", "", true, settings.whatsapp.apiKey);
      }
      
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

  const handleToggleWhatsAppGroups = (value: boolean) => {
    setSettings({
      ...settings,
      whatsapp: {
        ...settings.whatsapp,
        useGroups: value,
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

  const handleChangeFonnteApiKey = (value: string) => {
    setSettings({
      ...settings,
      whatsapp: {
        ...settings.whatsapp,
        apiKey: value,
      },
    });
  };

  const handleChangeWhatsAppGroupId = (value: string) => {
    setSettings({
      ...settings,
      whatsapp: {
        ...settings.whatsapp,
        groupId: value,
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

  const handleChangeContacts = (contacts: ReminderSettings['contacts']) => {
    setSettings({
      ...settings,
      contacts,
    });
  };

  const handleChangeGroups = (groups: ReminderSettings['groups']) => {
    setSettings({
      ...settings,
      groups,
    });
  };

  const handleChangeTaskStatusMessage = (field: keyof ReminderSettings['taskStatusMessages'], value: string) => {
    setSettings({
      ...settings,
      taskStatusMessages: {
        ...settings.taskStatusMessages,
        [field]: value,
      },
    });
  };

  // New handlers for target selections
  const handleToggleDailyTarget = (target: 'individual' | 'groups', value: boolean) => {
    setSettings({
      ...settings,
      dailyTargets: {
        ...settings.dailyTargets,
        useIndividual: target === 'individual' ? value : settings.dailyTargets.useIndividual,
        useGroups: target === 'groups' ? value : settings.dailyTargets.useGroups,
      },
    });
  };

  const handleToggleAdvanceTarget = (target: 'individual' | 'groups', value: boolean) => {
    setSettings({
      ...settings,
      advanceTargets: {
        ...settings.advanceTargets,
        useIndividual: target === 'individual' ? value : settings.advanceTargets.useIndividual,
        useGroups: target === 'groups' ? value : settings.advanceTargets.useGroups,
      },
    });
  };

  const handleSelectDailyContacts = (selectedContacts: string[]) => {
    setSettings({
      ...settings,
      dailyTargets: {
        ...settings.dailyTargets,
        selectedContacts,
      },
    });
  };

  const handleSelectDailyGroups = (selectedGroups: string[]) => {
    setSettings({
      ...settings,
      dailyTargets: {
        ...settings.dailyTargets,
        selectedGroups,
      },
    });
  };

  const handleSelectAdvanceContacts = (selectedContacts: string[]) => {
    setSettings({
      ...settings,
      advanceTargets: {
        ...settings.advanceTargets,
        selectedContacts,
      },
    });
  };

  const handleSelectAdvanceGroups = (selectedGroups: string[]) => {
    setSettings({
      ...settings,
      advanceTargets: {
        ...settings.advanceTargets,
        selectedGroups,
      },
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
    
    if (!settings.whatsapp.phoneNumber && !settings.dailyTargets.selectedContacts?.length) {
      toast({
        title: "No Recipients Selected",
        description: "Please enter a phone number or select contacts for testing",
        variant: "destructive",
      });
      return;
    }
    
    setTestLoading(true);
    try {
      // Ensure the API key is set for testing
      if (settings.whatsapp?.apiKey) {
        // Update the API key in the whatsapp.ts module
        await sendWhatsAppMessage("", "", true, settings.whatsapp.apiKey);
      }
      
      const messageTemplate = messageType === 'daily' 
        ? settings.dailyReminders.message 
        : settings.advanceReminders.message;
      
      const sampleMessage = messageTemplate
        .replace('{tasks}', 'Sample task 1 (BOSQU) - today\nSample task 2 (RUMAH) - tomorrow')
        .replace('{reminder_number}', '1')
        .replace('{days}', settings.advanceReminders.days.toString())
        .replace('{name}', settings.nameInReminder);
      
      // Get target phone number (default or first selected contact)
      const targetPhone = settings.whatsapp.phoneNumber || 
        (settings.contacts.find(c => 
          settings.dailyTargets.selectedContacts?.includes(c.name))?.phoneNumber || "");
      
      if (targetPhone) {
        await sendWhatsAppMessage(targetPhone, sampleMessage);
        
        toast({
          title: "Test Message Sent",
          description: "WhatsApp test message was sent successfully",
        });
      } else {
        throw new Error("No valid phone number found for testing");
      }
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
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="daily">Daily Status</TabsTrigger>
              <TabsTrigger value="advance">Advance Reminders</TabsTrigger>
              <TabsTrigger value="status">Status Messages</TabsTrigger>
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
                  <Label htmlFor="fonnte-api-key">Fonnte API Key</Label>
                  <Input
                    id="fonnte-api-key"
                    value={settings.whatsapp.apiKey}
                    onChange={(e) => handleChangeFonnteApiKey(e.target.value)}
                    placeholder="Enter your Fonnte API key"
                    disabled={!settings.whatsapp.enabled}
                  />
                  <p className="text-sm text-muted-foreground">
                    Get your API key from <a href="https://fonnte.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Fonnte.com</a>
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone-number">Default WhatsApp Phone Number</Label>
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
                  <div className="flex items-center justify-between">
                    <Label htmlFor="whatsapp-groups">Enable Group Reminders</Label>
                    <Switch
                      id="whatsapp-groups"
                      checked={settings.whatsapp.useGroups}
                      onCheckedChange={handleToggleWhatsAppGroups}
                      disabled={!settings.whatsapp.enabled}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Send reminders to WhatsApp groups in addition to individual contacts
                  </p>
                </div>
                
                {settings.whatsapp.useGroups && (
                  <div className="space-y-2">
                    <Label htmlFor="group-id">Default WhatsApp Group ID</Label>
                    <Input
                      id="group-id"
                      value={settings.whatsapp.groupId || ''}
                      onChange={(e) => handleChangeWhatsAppGroupId(e.target.value)}
                      placeholder="e.g., 1234567890-1234567890@g.us"
                      disabled={!settings.whatsapp.enabled || !settings.whatsapp.useGroups}
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter your WhatsApp group ID (contact Fonnte support for help)
                    </p>
                  </div>
                )}
                
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
            
            <TabsContent value="contacts">
              <ContactsManager 
                contacts={settings.contacts}
                onChange={handleChangeContacts}
              />
              
              {settings.whatsapp.useGroups && (
                <div className="mt-8">
                  <WhatsAppGroupsManager 
                    groups={settings.groups}
                    onChange={handleChangeGroups}
                  />
                </div>
              )}
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
                  <h3 className="text-sm font-medium">Reminder Recipients</h3>
                  <div className="p-4 border rounded-md space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>Individual Contacts</span>
                      </div>
                      <Switch
                        checked={settings.dailyTargets?.useIndividual || false}
                        onCheckedChange={(value) => handleToggleDailyTarget('individual', value)}
                        disabled={!settings.dailyReminders.enabled}
                      />
                    </div>
                    
                    {settings.dailyTargets?.useIndividual && (
                      <div className="ml-6 space-y-2">
                        <Label>Select Contacts</Label>
                        <Select
                          value="select"
                          disabled={!settings.dailyReminders.enabled}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={
                              settings.dailyTargets?.selectedContacts?.length 
                                ? `${settings.dailyTargets.selectedContacts.length} contacts selected` 
                                : "Select contacts"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {settings.contacts.map(contact => (
                              <div key={contact.name} className="flex items-center space-x-2 p-2">
                                <input
                                  type="checkbox"
                                  id={`daily-contact-${contact.name}`}
                                  checked={settings.dailyTargets?.selectedContacts?.includes(contact.name) || false}
                                  onChange={(e) => {
                                    const currentSelected = settings.dailyTargets?.selectedContacts || [];
                                    if (e.target.checked) {
                                      handleSelectDailyContacts([...currentSelected, contact.name]);
                                    } else {
                                      handleSelectDailyContacts(currentSelected.filter(name => name !== contact.name));
                                    }
                                  }}
                                />
                                <label htmlFor={`daily-contact-${contact.name}`}>{contact.name}</label>
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Select which contacts should receive daily reminders
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>WhatsApp Groups</span>
                      </div>
                      <Switch
                        checked={settings.dailyTargets?.useGroups || false}
                        onCheckedChange={(value) => handleToggleDailyTarget('groups', value)}
                        disabled={!settings.dailyReminders.enabled || !settings.whatsapp.useGroups}
                      />
                    </div>
                    
                    {settings.dailyTargets?.useGroups && settings.whatsapp.useGroups && (
                      <div className="ml-6 space-y-2">
                        <Label>Select Groups</Label>
                        <Select
                          value="select"
                          disabled={!settings.dailyReminders.enabled}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={
                              settings.dailyTargets?.selectedGroups?.length 
                                ? `${settings.dailyTargets.selectedGroups.length} groups selected` 
                                : "Select groups"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {settings.groups.map(group => (
                              <div key={group.name} className="flex items-center space-x-2 p-2">
                                <input
                                  type="checkbox"
                                  id={`daily-group-${group.name}`}
                                  checked={settings.dailyTargets?.selectedGroups?.includes(group.name) || false}
                                  onChange={(e) => {
                                    const currentSelected = settings.dailyTargets?.selectedGroups || [];
                                    if (e.target.checked) {
                                      handleSelectDailyGroups([...currentSelected, group.name]);
                                    } else {
                                      handleSelectDailyGroups(currentSelected.filter(name => name !== group.name));
                                    }
                                  }}
                                />
                                <label htmlFor={`daily-group-${group.name}`}>{group.name}</label>
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Select which groups should receive daily reminders
                        </p>
                      </div>
                    )}
                  </div>
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
                    Use {'{tasks}'} for task list, {'{reminder_number}'} for reminder number, {'{name}'} for PIC name
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
                  <h3 className="text-sm font-medium">Reminder Recipients</h3>
                  <div className="p-4 border rounded-md space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>Individual Contacts</span>
                      </div>
                      <Switch
                        checked={settings.advanceTargets?.useIndividual || false}
                        onCheckedChange={(value) => handleToggleAdvanceTarget('individual', value)}
                        disabled={!settings.advanceReminders.enabled}
                      />
                    </div>
                    
                    {settings.advanceTargets?.useIndividual && (
                      <div className="ml-6 space-y-2">
                        <Label>Select Contacts</Label>
                        <Select
                          value="select"
                          disabled={!settings.advanceReminders.enabled}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={
                              settings.advanceTargets?.selectedContacts?.length 
                                ? `${settings.advanceTargets.selectedContacts.length} contacts selected` 
                                : "Select contacts"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {settings.contacts.map(contact => (
                              <div key={contact.name} className="flex items-center space-x-2 p-2">
                                <input
                                  type="checkbox"
                                  id={`advance-contact-${contact.name}`}
                                  checked={settings.advanceTargets?.selectedContacts?.includes(contact.name) || false}
                                  onChange={(e) => {
                                    const currentSelected = settings.advanceTargets?.selectedContacts || [];
                                    if (e.target.checked) {
                                      handleSelectAdvanceContacts([...currentSelected, contact.name]);
                                    } else {
                                      handleSelectAdvanceContacts(currentSelected.filter(name => name !== contact.name));
                                    }
                                  }}
                                />
                                <label htmlFor={`advance-contact-${contact.name}`}>{contact.name}</label>
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Select which contacts should receive advance reminders
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>WhatsApp Groups</span>
                      </div>
                      <Switch
                        checked={settings.advanceTargets?.useGroups || false}
                        onCheckedChange={(value) => handleToggleAdvanceTarget('groups', value)}
                        disabled={!settings.advanceReminders.enabled || !settings.whatsapp.useGroups}
                      />
                    </div>
                    
                    {settings.advanceTargets?.useGroups && settings.whatsapp.useGroups && (
                      <div className="ml-6 space-y-2">
                        <Label>Select Groups</Label>
                        <Select
                          value="select"
                          disabled={!settings.advanceReminders.enabled}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={
                              settings.advanceTargets?.selectedGroups?.length 
                                ? `${settings.advanceTargets.selectedGroups.length} groups selected` 
                                : "Select groups"
                            } />
                          </SelectTrigger>
                          <SelectContent>
                            {settings.groups.map(group => (
                              <div key={group.name} className="flex items-center space-x-2 p-2">
                                <input
                                  type="checkbox"
                                  id={`advance-group-${group.name}`}
                                  checked={settings.advanceTargets?.selectedGroups?.includes(group.name) || false}
                                  onChange={(e) => {
                                    const currentSelected = settings.advanceTargets?.selectedGroups || [];
                                    if (e.target.checked) {
                                      handleSelectAdvanceGroups([...currentSelected, group.name]);
                                    } else {
                                      handleSelectAdvanceGroups(currentSelected.filter(name => name !== group.name));
                                    }
                                  }}
                                />
                                <label htmlFor={`advance-group-${group.name}`}>{group.name}</label>
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Select which groups should receive advance reminders
                        </p>
                      </div>
                    )}
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
                    Use {'{tasks}'} for task list, {'{days}'} for number of days, {'{name}'} for PIC name
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
            
            <TabsContent value="status">
              <div className="space-y-6">
                <h3 className="text-md font-medium">Task Status Messages</h3>
                <p className="text-sm text-muted-foreground">
                  Customize how task statuses are displayed in reminders
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="overdue-message">Overdue Tasks</Label>
                    <Input
                      id="overdue-message"
                      value={settings.taskStatusMessages?.overdue || "terlewat hari / overdue"}
                      onChange={(e) => handleChangeTaskStatusMessage('overdue', e.target.value)}
                      placeholder="e.g., terlewat hari / overdue"
                    />
                    <p className="text-sm text-muted-foreground">
                      Message for tasks that are past due date
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="today-message">Today's Tasks</Label>
                    <Input
                      id="today-message"
                      value={settings.taskStatusMessages?.today || "You must to do!"}
                      onChange={(e) => handleChangeTaskStatusMessage('today', e.target.value)}
                      placeholder="e.g., You must to do!"
                    />
                    <p className="text-sm text-muted-foreground">
                      Message for tasks due today
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="upcoming-message">Upcoming Tasks</Label>
                    <Input
                      id="upcoming-message"
                      value={settings.taskStatusMessages?.upcoming || "{days} hari lagi"}
                      onChange={(e) => handleChangeTaskStatusMessage('upcoming', e.target.value)}
                      placeholder="e.g., {days} hari lagi"
                    />
                    <p className="text-sm text-muted-foreground">
                      Message for upcoming tasks. Use {'{days}'} to include number of days until due date.
                    </p>
                  </div>
                </div>
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
