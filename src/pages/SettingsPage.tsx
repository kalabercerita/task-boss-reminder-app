
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateUserProfile, updateUserPreferences } from "@/lib/supabase";
import { UserPreferences } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    theme: "light",
    backgroundColor: "#f0f0f0",
    locations: [],
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
    }
  }, [user]);

  const handleNameChange = async () => {
    if (user) {
      try {
        await updateUserProfile(user.id, { name });
        toast({
          title: "Profile Updated",
          description: "Your name has been updated",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive",
        });
      }
    }
  };

  const handlePreferencesChange = async () => {
    if (user) {
      try {
        const result = await updateUserPreferences(user.id, userPreferences);
        if (result) {
          setUserPreferences(result);
          toast({
            title: "Success",
            description: "User preferences updated successfully",
          });
        } else {
          toast({
            title: "Warning",
            description: "Preferences may not have been saved properly",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Failed to update user preferences:", error);
        toast({
          title: "Error",
          description: "Failed to update user preferences",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={handleNameChange}>Update Name</Button>
        </div>
        <div>
          <Label>Theme</Label>
          <select
            value={userPreferences.theme}
            onChange={(e) =>
              setUserPreferences({ ...userPreferences, theme: e.target.value })
            }
            className="w-full p-2 border rounded"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div>
          <Label htmlFor="backgroundColor">Background Color</Label>
          <Input
            type="color"
            id="backgroundColor"
            value={userPreferences.backgroundColor}
            onChange={(e) =>
              setUserPreferences({
                ...userPreferences,
                backgroundColor: e.target.value,
              })
            }
          />
        </div>
        <Button onClick={handlePreferencesChange}>Update Preferences</Button>
      </div>
    </div>
  );
};

export default SettingsPage;
