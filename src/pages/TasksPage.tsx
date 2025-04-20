
import React, { useEffect, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "@/lib/supabase";
import { Task, Status, Priority, Location } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays, subDays } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TasksPage = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskStatus, setTaskStatus] = useState<Status>("todo");
  const [taskPic, setTaskPic] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("medium");
  const [taskLocation, setTaskLocation] = useState<Location>("BOSQU");

  useEffect(() => {
    fetchTasks();
  }, [selectedDate]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error loading tasks",
        description: "Unable to fetch tasks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle || !taskDeadline || !taskPic) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const newTask = await createTask({
        title: taskTitle,
        description: taskDescription,
        deadline: new Date(taskDeadline),
        status: taskStatus,
        pic: taskPic,
        priority: taskPriority,
        location: taskLocation,
      });
      
      setTasks([...tasks, newTask]);
      
      toast({
        title: "Task Created",
        description: "Your new task has been created",
      });
      
      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error Creating Task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTaskTitle("");
    setTaskDescription("");
    setTaskDeadline("");
    setTaskStatus("todo");
    setTaskPic("");
    setTaskPriority("medium");
    setTaskLocation("BOSQU");
  };

  const filteredTasks = tasks.filter(task => {
    const taskDate = format(task.deadline, "yyyy-MM-dd");
    const selectedDateString = format(selectedDate, "yyyy-MM-dd");
    return taskDate === selectedDateString;
  });

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prevDate => 
      direction === 'prev' ? subDays(prevDate, 1) : addDays(prevDate, 1)
    );
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="Task title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  placeholder="Task description (optional)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={taskStatus} onValueChange={(value) => setTaskStatus(value as Status)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">Todo</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="pic">Person in Charge</Label>
                <Input
                  id="pic"
                  value={taskPic}
                  onChange={(e) => setTaskPic(e.target.value)}
                  placeholder="Who is responsible"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={taskPriority} onValueChange={(value) => setTaskPriority(value as Priority)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Select value={taskLocation} onValueChange={(value) => setTaskLocation(value as Location)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BOSQU">BOSQU</SelectItem>
                    <SelectItem value="RUMAH">RUMAH</SelectItem>
                    <SelectItem value="HP GOJEK">HP GOJEK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">
          {format(selectedDate, "MMMM d, yyyy")}
        </h2>
        <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-6">Loading tasks...</div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className="p-3 border rounded-md flex justify-between items-center"
              >
                <div>
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-muted-foreground">
                      {task.description}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    {task.pic} | {task.location} | {task.priority} Priority
                  </div>
                </div>
                <div 
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {task.status}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-6">
              No tasks for this day
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
