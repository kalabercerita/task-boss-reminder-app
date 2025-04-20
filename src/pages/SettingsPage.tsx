
import React from "react";
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
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={user?.name || ""} disabled />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={user?.email || ""} disabled />
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Account management features coming soon
          </p>
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
