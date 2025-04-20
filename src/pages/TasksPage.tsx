
import React, { useEffect, useState } from "react";
import { getAllTasks, createTask, updateTask, deleteTask } from "@/lib/supabase";
import { Task, Status, Priority, Location } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { format, addDays, subDays, differenceInDays, isToday, isPast } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, ChevronLeft, ChevronRight, Calendar, Clock, X, Check, 
  AlertCircle, List
} from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const TasksPage = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'date' | 'list'>('list');
  
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
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getAllTasks();
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
      
      // Refresh tasks to ensure proper sorting
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error Creating Task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: Status) => {
    try {
      await updateTask(taskId, { status: newStatus });
      
      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus } : task
      );
      setTasks(updatedTasks);
      
      toast({
        title: "Task Updated",
        description: "Task status has been updated",
      });
      
      // Refresh tasks to ensure proper sorting
      fetchTasks();
    } catch (error: any) {
      toast({
        title: "Error Updating Task",
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

  const getTaskDueText = (deadline: Date) => {
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
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <div className="flex space-x-4">
          <div className="flex border rounded-md">
            <Button 
              variant={viewMode === 'date' ? "default" : "ghost"}
              className="rounded-r-none"
              onClick={() => setViewMode('date')}
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Date View
            </Button>
            <Button 
              variant={viewMode === 'list' ? "default" : "ghost"}
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
              size="sm"
            >
              <List className="h-4 w-4 mr-2" />
              List View
            </Button>
          </div>
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
                      <SelectItem value="to-review">To Review</SelectItem>
                      <SelectItem value="hold">Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="canceled">Canceled</SelectItem>
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
      </div>

      {viewMode === 'date' && (
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
      )}

      {loading ? (
        <div className="text-center py-6">Loading tasks...</div>
      ) : (
        <div className="space-y-2">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div 
                key={task.id} 
                className={`p-4 border rounded-md ${task.status === 'completed' ? 'opacity-70' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(task.status)}
                      <span className={`font-medium ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                    
                    {task.description && (
                      <div className="text-sm text-muted-foreground">
                        {task.description}
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline">{task.pic}</Badge>
                      <Badge variant="outline">{task.location}</Badge>
                      <Badge variant="outline" className={
                        task.priority === 'high' ? 'bg-red-100 text-red-800' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {task.priority} Priority
                      </Badge>
                    </div>
                    
                    <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {format(task.deadline, "MMM d, yyyy")}
                        {" "}
                        <span className="text-xs italic">
                          ({getTaskDueText(task.deadline)})
                        </span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    
                    {task.status !== 'completed' && task.status !== 'canceled' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                      >
                        <Check className="h-3 w-3 mr-1" /> Mark Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-6">
              {viewMode === 'date' ? 'No tasks for this day' : 'No tasks found'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
