
import React, { useEffect, useState } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "@/lib/supabase";
import { Task, Status, Priority, Location } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { CheckSquare, Edit, Plus, Trash } from "lucide-react";
import { SAMPLE_TASKS } from "@/lib/default-data";

const TasksPage = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  
  // New/Edit task form state
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskStatus, setTaskStatus] = useState<Status>("todo");
  const [taskPic, setTaskPic] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("medium");
  const [taskLocation, setTaskLocation] = useState<Location>("BOSQU");
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [filterPriority, setFilterPriority] = useState<Priority | "all">("all");
  const [filterLocation, setFilterLocation] = useState<Location | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data.length ? data : SAMPLE_TASKS);
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
      const deadlineDate = new Date(taskDeadline);
      
      if (isEditMode && editTaskId) {
        // Update existing task
        const updatedTask = await updateTask(editTaskId, {
          title: taskTitle,
          description: taskDescription,
          deadline: deadlineDate,
          status: taskStatus,
          pic: taskPic,
          priority: taskPriority,
          location: taskLocation,
        });
        
        setTasks(tasks.map(task => task.id === editTaskId ? updatedTask : task));
        
        toast({
          title: "Task Updated",
          description: "Your task has been successfully updated",
        });
      } else {
        // Create new task
        const newTask = await createTask({
          title: taskTitle,
          description: taskDescription,
          deadline: deadlineDate,
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
      }
      
      // Reset form and close dialog
      resetForm();
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: isEditMode ? "Error Updating Task" : "Error Creating Task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditTask = (task: Task) => {
    setIsEditMode(true);
    setEditTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || "");
    setTaskDeadline(format(task.deadline, "yyyy-MM-dd"));
    setTaskStatus(task.status);
    setTaskPic(task.pic);
    setTaskPriority(task.priority);
    setTaskLocation(task.location);
    setIsDialogOpen(true);
  };

  const handleDeleteTask = async (id: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
        setTasks(tasks.filter(task => task.id !== id));
        toast({
          title: "Task Deleted",
          description: "Your task has been successfully deleted",
        });
      } catch (error: any) {
        toast({
          title: "Error Deleting Task",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const resetForm = () => {
    setIsEditMode(false);
    setEditTaskId(null);
    setTaskTitle("");
    setTaskDescription("");
    setTaskDeadline("");
    setTaskStatus("todo");
    setTaskPic("");
    setTaskPriority("medium");
    setTaskLocation("BOSQU");
  };

  const handleStatusChange = async (taskId: string, newStatus: Status) => {
    try {
      const updatedTask = await updateTask(taskId, {
        status: newStatus
      });
      
      setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
      
      toast({
        title: "Status Updated",
        description: `Task status changed to ${newStatus}`,
      });
    } catch (error: any) {
      toast({
        title: "Error Updating Status",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "completed":
        return "bg-green-500 hover:bg-green-600";
      case "in-progress":
        return "bg-blue-500 hover:bg-blue-600";
      case "overdue":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "bg-priority-high text-white";
      case "medium":
        return "bg-priority-medium text-white";
      case "low":
        return "bg-priority-low text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getLocationBadge = (location: Location) => {
    switch (location) {
      case "BOSQU":
        return "bg-primary text-primary-foreground";
      case "RUMAH":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "HP GOJEK":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  // Apply filters to tasks
  const filteredTasks = tasks.filter(task => {
    return (
      (filterStatus === "all" || task.status === filterStatus) &&
      (filterPriority === "all" || task.priority === filterPriority) &&
      (filterLocation === "all" || task.location === filterLocation) &&
      (searchTerm === "" || 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        task.pic.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  });

  const statusOptions: Status[] = ["todo", "in-progress", "completed", "overdue"];
  const priorityOptions: Priority[] = ["low", "medium", "high"];
  const locationOptions: Location[] = ["BOSQU", "RUMAH", "HP GOJEK"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Edit Task" : "Create New Task"}</DialogTitle>
              <DialogDescription>
                {isEditMode 
                  ? "Update the details of your existing task." 
                  : "Fill in the details to create a new task."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title *</Label>
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
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="deadline">Deadline *</Label>
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
                      {statusOptions.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="pic">Person in Charge *</Label>
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
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Select value={taskLocation} onValueChange={(value) => setTaskLocation(value as Location)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locationOptions.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                resetForm();
                setIsDialogOpen(false);
              }}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>
                {isEditMode ? "Update Task" : "Create Task"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search tasks..."
                />
              </div>
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as Status | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {statusOptions.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority-filter">Priority</Label>
                <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as Priority | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {priorityOptions.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location-filter">Location</Label>
                <Select value={filterLocation} onValueChange={(value) => setFilterLocation(value as Location | "all")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locationOptions.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tasks Table */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading tasks...</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[400px]">Task</TableHead>
                      <TableHead>Deadline</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length > 0 ? (
                      filteredTasks.map((task) => {
                        const isToday = format(task.deadline, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                        const isPast = task.deadline < new Date() && task.status !== "completed";
                        
                        return (
                          <TableRow key={task.id}>
                            <TableCell className="font-medium">
                              <div className="font-medium">{task.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {task.pic}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className={isPast ? "text-destructive" : ""}>
                                {format(task.deadline, "MMM d, yyyy")}
                              </div>
                              {isToday && !isPast && (
                                <div className="text-xs text-blue-600 font-medium">
                                  This is the day! C'mon!
                                </div>
                              )}
                              {isPast && (
                                <div className="text-xs text-destructive font-medium">
                                  Overdue
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <Select
                                value={task.status}
                                onValueChange={(value) => handleStatusChange(task.id, value as Status)}
                              >
                                <SelectTrigger className="w-[130px]">
                                  <SelectValue placeholder={task.status} />
                                </SelectTrigger>
                                <SelectContent>
                                  {statusOptions.map((status) => (
                                    <SelectItem key={status} value={status}>
                                      {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={getLocationBadge(task.location)}>
                                {task.location}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleStatusChange(task.id, "completed")}
                                  disabled={task.status === "completed"}
                                >
                                  <CheckSquare className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEditTask(task)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          No tasks found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TasksPage;
