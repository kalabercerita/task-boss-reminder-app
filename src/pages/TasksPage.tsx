import React, { useEffect, useState } from "react";
import { getAllTasks, createTask, updateTask, deleteTask, deleteAllTasks } from "@/lib/supabase";
import { Task, Status, Priority, Location } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays, subDays, differenceInDays, isToday, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  Check, Clock, X, AlertCircle, List, Trash, Calendar
} from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_TASKS } from "@/lib/default-data";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const statusList: Status[] = [
  "todo", "in-progress", "to-review", "hold", "completed", "canceled"
];

const TasksPage = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'date' | 'list'>('list');
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskStatus, setTaskStatus] = useState<Status>("todo");
  const [taskPic, setTaskPic] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("medium");
  const [taskLocation, setTaskLocation] = useState<Location>("BOSQU");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getAllTasks();
      setTasks(data.length > 0 ? data : SAMPLE_TASKS);
      
      if (data.length === 0) {
        console.log("No tasks found, using sample tasks for testing");
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      setTasks(SAMPLE_TASKS);
      toast({
        title: "Error loading tasks",
        description: "Using sample data instead",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLocationDescription = (location: string) => {
    switch (location) {
      case "BOSQU":
        return "Kantor";
      case "RUMAH":
        return "Rumah";
      case "HP GOJEK":
        return "Aplikasi Gojek";
      default:
        return location;
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
      
      resetForm();
      setIsDialogOpen(false);
      
      fetchTasks();
    } catch (error: any) {
      console.error("Error creating task:", error);
      toast({
        title: "Error Creating Task",
        description: error.message || "Failed to create task",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Status) => {
    try {
      await updateTask(taskId, { status: newStatus });
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);
      toast({
        title: "Task Updated",
        description: "Task status has been updated",
      });
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error Updating Task",
        description: error.message || "Failed to update task status",
        variant: "destructive",
      });
    }
  };
  
  const handleDeleteAllTasks = async () => {
    try {
      await deleteAllTasks();
      setTasks([]);
      toast({
        title: "Tasks Deleted",
        description: "All tasks have been deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error Deleting Tasks",
        description: error.message || "Failed to delete all tasks",
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

  const filteredTasks = viewMode === 'date' 
    ? tasks.filter(task => {
        const taskDate = format(task.deadline, "yyyy-MM-dd");
        const selectedDateString = format(selectedDate, "yyyy-MM-dd");
        return taskDate === selectedDateString;
      })
    : tasks;

  const navigateDate = (direction: 'prev' | 'next') => {
    setSelectedDate(prevDate => 
      direction === 'prev' ? subDays(prevDate, 1) : addDays(prevDate, 1)
    );
  };

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'canceled':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'to-review':
        return 'bg-purple-100 text-purple-800';
      case 'hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'canceled':
        return 'bg-gray-100 text-gray-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusMessage = (deadline: Date) => {
    if (isPast(deadline) && !isToday(deadline)) {
      return `Terlewat ${Math.abs(differenceInDays(deadline, new Date()))} hari`;
    }
    if (isToday(deadline)) {
      return "Hari ini!";
    }
    const days = differenceInDays(deadline, new Date());
    return `${days} hari lagi`;
  };

  return (
    <div className="container mx-auto py-6 px-2 sm:px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl sm:text-2xl font-bold">Tasks</h1>
        <div className="flex gap-2 sm:gap-4">
          <div className="flex border rounded-md">
            <Button 
              variant={viewMode === 'date' ? "default" : "ghost"}
              className="rounded-r-none"
              onClick={() => setViewMode('date')}
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-1" />
              Date
            </Button>
            <Button 
              variant={viewMode === 'list' ? "default" : "ghost"}
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
              size="sm"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-1" /> Delete All
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will delete all tasks. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAllTasks}>
                  Delete All
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Check className="mr-2 h-4 w-4" /> Add Task
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
                      {statusList.map((status) => (
                        <SelectItem key={status} value={status} className="text-xs">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={taskLocation}
                    onChange={(e) => setTaskLocation(e.target.value as Location)}
                    placeholder="Where the task will be performed"
                  />
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
      </div>

      {viewMode === 'date' && (
        <div className="flex items-center justify-between mb-2">
          <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
            <span className="sr-only">Previous</span>
            <span>&lt;</span>
          </Button>
          <h2 className="text-base sm:text-xl font-semibold">
            {format(selectedDate, "MMMM d, yyyy")}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
            <span className="sr-only">Next</span>
            <span>&gt;</span>
          </Button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-6">Loading tasks...</div>
      ) : (
        <div className="flex flex-col gap-1">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-center border-b last:border-b-0 px-2 py-2 gap-2 ${task.status === "completed" ? "opacity-70" : ""}`}
              style={{fontSize: '0.95rem'}}
            >
              <div className="flex-shrink-0 flex flex-col items-center gap-1">
                {getStatusIcon(task.status)}
                <Badge className={`px-2 py-0.5 text-xs ${getStatusColor(task.status)}`}>
                  {task.status}
                </Badge>
              </div>
              
              <div className="flex-1 min-w-0 truncate">
                <div className="flex items-center min-w-0 gap-2">
                  <span className={`font-medium truncate ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                    {task.title}
                  </span>
                  {task.priority === 'high' && <span className="text-xs text-red-500 border border-red-300 bg-red-50 rounded px-1 ml-1">HIGH</span>}
                  {task.priority === 'medium' && <span className="text-xs text-yellow-700 border border-yellow-200 bg-yellow-50 rounded px-1 ml-1">MED</span>}
                  {task.priority === 'low' && <span className="text-xs text-green-700 border border-green-200 bg-green-50 rounded px-1 ml-1">LOW</span>}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-1 items-center text-xs text-muted-foreground">
                  <span>PIC: {task.pic}</span>
                  <span>Lokasi: {getLocationDescription(task.location)}</span>
                  <span>Deadline: {format(task.deadline, "MMM d, yyyy")} (<span className="italic">{getTaskStatusMessage(task.deadline)}</span>)</span>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 min-w-[110px]">
                <Select value={task.status} onValueChange={(value) => handleUpdateTaskStatus(task.id, value as Status)}>
                  <SelectTrigger className="h-7 w-[90px] text-xs border rounded bg-white/80">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusList.map((status) => (
                      <SelectItem key={status} value={status} className="text-xs">
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {task.status !== 'completed' && task.status !== 'canceled' && (
                  <Button 
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                  >
                    <Check className="h-3 w-3 mr-1" /> Complete
                  </Button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-4">
            {viewMode === 'date' ? 'No tasks for this day' : 'No tasks found'}
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
