
import React, { useState } from 'react';
import { WhatsAppGroup } from '@/types';
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

interface WhatsAppGroupsManagerProps {
  groups: WhatsAppGroup[];
  onChange: (groups: WhatsAppGroup[]) => void;
}

const WhatsAppGroupsManager: React.FC<WhatsAppGroupsManagerProps> = ({ 
  groups, 
  onChange 
}) => {
  const [newName, setNewName] = useState('');
  const [newGroupId, setNewGroupId] = useState('');

  const handleAddGroup = () => {
    if (!newName || !newGroupId) return;
    
    const newGroup: WhatsAppGroup = {
      id: crypto.randomUUID(),
      name: newName,
      groupId: newGroupId
    };
    
    onChange([...groups, newGroup]);
    setNewName('');
    setNewGroupId('');
  };

  const handleDeleteGroup = (id: string) => {
    onChange(groups.filter(group => group.id !== id));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">WhatsApp Groups</h3>
      <p className="text-sm text-muted-foreground">
        Add WhatsApp groups to send task reminders to multiple people at once.
      </p>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="group-name">Group Name</Label>
          <Input
            id="group-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="e.g., Project Team"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="group-id">Group ID</Label>
          <div className="flex space-x-2">
            <Input
              id="group-id"
              value={newGroupId}
              onChange={(e) => setNewGroupId(e.target.value)}
              placeholder="e.g., 12345678900@g.us"
            />
            <Button size="icon" onClick={handleAddGroup} type="button">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      
      {groups.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Group Name</TableHead>
              <TableHead>Group ID</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map(group => (
              <TableRow key={group.id}>
                <TableCell>{group.name}</TableCell>
                <TableCell>{group.groupId}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteGroup(group.id)}
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
          No groups added yet. Add groups to send reminders to multiple people at once.
        </div>
      )}
    </div>
  );
};

export default WhatsAppGroupsManager;
