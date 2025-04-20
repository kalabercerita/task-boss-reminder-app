
import React, { useState } from 'react';
import { Contact } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ContactsManagerProps {
  contacts: Contact[];
  onChange: (contacts: Contact[]) => void;
}

const ContactsManager: React.FC<ContactsManagerProps> = ({ contacts, onChange }) => {
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  const handleAddContact = () => {
    if (!newName || !newPhone) return;
    
    const newContact: Contact = {
      id: crypto.randomUUID(),
      name: newName,
      phoneNumber: newPhone
    };
    
    onChange([...contacts, newContact]);
    setNewName('');
    setNewPhone('');
  };

  const handleDeleteContact = (id: string) => {
    onChange(contacts.filter(contact => contact.id !== id));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">PIC Contacts</h3>
      <p className="text-sm text-muted-foreground">
        Add contacts for each Person in Charge (PIC) to enable sending task reminders directly to them.
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="contact-name">PIC Name</Label>
          <Input
            id="contact-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., BOSQU"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact-phone">WhatsApp Number</Label>
          <div className="flex space-x-2">
            <Input
              id="contact-phone"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g., 628123456789"
            />
            <Button size="icon" onClick={handleAddContact} type="button">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {contacts.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>PIC Name</TableHead>
              <TableHead>WhatsApp Number</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map(contact => (
              <TableRow key={contact.id}>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.phoneNumber}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteContact(contact.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-4 border rounded-md text-muted-foreground">
          No contacts added yet. Add contacts to enable PIC-specific reminders.
        </div>
      )}
    </div>
  );
};

export default ContactsManager;
