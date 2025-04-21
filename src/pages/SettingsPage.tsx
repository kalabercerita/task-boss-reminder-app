
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { X, Plus } from "lucide-react";
import { updateUserPreferences } from "@/lib/supabase";

const SettingsPage = () => {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [theme, setTheme] = useState("light");
  const [backgroundColor, setBackgroundColor] = useState("#f3f4f6");
  const [locations, setLocations] = useState<string[]>(["BOSQU", "RUMAH", "HP GOJEK"]);
  const [newLocation, setNewLocation] = useState("");
  
  useEffect(() => {
    if (user?.preferences) {
      setTheme(user.preferences.theme || "light");
      setBackgroundColor(user.preferences.backgroundColor || "#f3f4f6");
      setLocations(user.preferences.locations || ["BOSQU", "RUMAH", "HP GOJEK"]);
    }
  }, [user]);

  const handleSaveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      const updatedPreferences = await updateUserPreferences(user.id, {
        theme,
        backgroundColor,
        locations,
      });
      
      // Update user context with new preferences
      setUser({
        ...user,
        preferences: updatedPreferences,
      });
      
      toast({
        title: "Settings Saved",
        description: "Your settings have been updated",
      });

      // Apply theme and background color
      document.documentElement.setAttribute('data-theme', theme);
      document.body.style.backgroundColor = backgroundColor;
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

  const handleAddLocation = () => {
    if (newLocation && !locations.includes(newLocation)) {
      setLocations([...locations, newLocation]);
      setNewLocation("");
    } else if (newLocation) {
      toast({
        title: "Location Already Exists",
        description: "This location is already in your list",
        variant: "destructive",
      });
    }
  };

  const handleRemoveLocation = (location: string) => {
    setLocations(locations.filter(loc => loc !== location));
  };

  // Apply theme on component mount
  useEffect(() => {
    if (theme) {
      document.documentElement.setAttribute('data-theme', theme);
    }
    if (backgroundColor) {
      document.body.style.backgroundColor = backgroundColor;
    }
  }, [theme, backgroundColor]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Theme Settings</CardTitle>
          <CardDescription>
            Customize the appearance of your application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <Select value={theme} onValueChange={setTheme}>
              <SelectTrigger id="theme">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
                <SelectItem value="system">System</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="background-color">Background Color</Label>
            <div className="flex gap-4 items-center">
              <Input 
                id="background-color" 
                type="color" 
                value={backgroundColor} 
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-24 h-10 p-1" 
              />
              <Input 
                value={backgroundColor} 
                onChange={(e) => setBackgroundColor(e.target.value)}
                placeholder="#000000"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Theme Settings"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Location Management</CardTitle>
          <CardDescription>
            Manage task location options for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="locations">Current Locations</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md">
              {locations.map((location) => (
                <div key={location} className="flex items-center gap-1 bg-secondary px-3 py-1 rounded-full">
                  <span>{location}</span>
                  <button
                    onClick={() => handleRemoveLocation(location)}
                    className="h-4 w-4 rounded-full bg-muted-foreground/20 flex items-center justify-center hover:bg-muted-foreground/40"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="new-location">Add New Location</Label>
            <div className="flex gap-2">
              <Input
                id="new-location"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Enter new location name"
              />
              <Button onClick={handleAddLocation} variant="outline" size="icon" title="Add Location">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Location Settings"}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>About TaskBoss</CardTitle>
          <CardDescription>
            Your ultimate task and reminder management solution
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Features</h3>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Comprehensive task management with deadline tracking</li>
              <li>Task categorization by priority, status, and location</li>
              <li>Calendar integration</li>
              <li>WhatsApp reminders via Fonnte.com API</li>
              <li>Customizable daily status reminders (up to 3x daily)</li>
              <li>Advance task notifications (7/14 days ahead)</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium">Credits</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Built with React, TailwindCSS, and Supabase. WhatsApp integration powered by Fonnte.com.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Version 1.0.0
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SettingsPage;
