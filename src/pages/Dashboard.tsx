import React, { useEffect, useState } from "react";
import { getAllTasks, createTask } from "@/lib/supabase";
import { Task, Status, Priority, Location } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isToday, isPast, isFuture, differenceInDays, startOfMonth, endOfMonth, parseISO, getMonth, getYear } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { SAMPLE_TASKS } from "@/lib/default-data";
import { 
  Plus, ChevronLeft, ChevronRight, Calendar, Clock, X, Check, 
  AlertCircle, List, ChartBar, ChartPie
} from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import ColorThemeSwitcher from "../components/ColorThemeSwitcher";

const prepareLocationData = (tasks: Task[]) => {
  const colorMap: Record<string, string> = {
    "BOSQU": "#818cf8",
    "RUMAH": "#34d399",
    "HP GOJEK": "#fbbf24",
    "LAINNYA": "#94a3b8"
  };
  const tmp: Record<string, number> = {};
  tasks.forEach((t) => {
    const loc = ["BOSQU", "RUMAH", "HP GOJEK"].includes(t.location) ? t.location : "LAINNYA";
    tmp[loc] = (tmp[loc] || 0) + 1;
  });
  return Object.entries(tmp).map(([name, count]) => ({
    name,
    value: count,
    color: colorMap[name] || "#d1d5db"
  }));
};

const Dashboard = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [taskDeadline, setTaskDeadline] = useState("");
  const [taskStatus, setTaskStatus] = useState<Status>("todo");
  const [taskPic, setTaskPic] = useState("");
  const [taskPriority, setTaskPriority] = useState<Priority>("medium");
  const [taskLocation, setTaskLocation] = useState<Location>("BOSQU");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getAllTasks();
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

    fetchTasks();
  }, [toast]);

  const upcomingTasks = tasks.filter((task) => 
    isFuture(task.deadline) && 
    task.status !== "completed" && 
    task.status !== "canceled"
  );

  const overdueTasks = tasks.filter(
    (task) => 
      !isToday(task.deadline) &&
      (task.status === "overdue" ||
        (isPast(task.deadline) &&
        task.status !== "completed" &&
        task.status !== "canceled" &&
        task.status !== "hold" &&
        task.status !== "to-review"))
  );

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  );

  const prepareMonthlyTaskData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    
    const monthlyData = months.map((month, index) => ({
      name: month,
      total: 0,
      completed: 0,
      overdue: 0
    }));
    
    tasks.forEach(task => {
      const taskMonth = getMonth(task.deadline);
      const taskYear = getYear(task.deadline);
      
      if (taskYear === currentYear) {
        monthlyData[taskMonth].total += 1;
        
        if (task.status === 'completed') {
          monthlyData[taskMonth].completed += 1;
        } else if (task.status === 'overdue' || (isPast(task.deadline) && task.status !== 'completed' && task.status !== 'canceled')) {
          monthlyData[taskMonth].overdue += 1;
        }
      }
    });
    
    return monthlyData;
  };
  
  const prepareStatusData = () => {
    const statusData = [
      { name: 'To Do', value: 0, color: '#94a3b8' },
      { name: 'In Progress', value: 0, color: '#3b82f6' },
      { name: 'Completed', value: 0, color: '#22c55e' },
      { name: 'Overdue', value: 0, color: '#ef4444' },
      { name: 'Hold', value: 0, color: '#eab308' },
      { name: 'To Review', value: 0, color: '#8b5cf6' },
      { name: 'Canceled', value: 0, color: '#6b7280' }
    ];
    
    tasks.forEach(task => {
      if (task.status === 'todo') {
        statusData[0].value += 1;
      } else if (task.status === 'in-progress') {
        statusData[1].value += 1;
      } else if (task.status === 'completed') {
        statusData[2].value += 1;
      } else if (task.status === 'overdue' || (isPast(task.deadline) && 
                  task.status !== 'completed' && 
                  task.status !== 'canceled' && 
                  task.status !== 'hold' && 
                  task.status !== 'to-review')) {
        statusData[3].value += 1;
      } else if (task.status === 'hold') {
        statusData[4].value += 1;
      } else if (task.status === 'to-review') {
        statusData[5].value += 1;
      } else if (task.status === 'canceled') {
        statusData[6].value += 1;
      }
    });
    
    return statusData.filter(status => status.value > 0);
  };

  const monthlyTaskData = prepareMonthlyTaskData();
  const statusData = prepareStatusData();
  const locationData = prepareLocationData(tasks);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "to-review":
        return "bg-purple-500";
      case "hold":
        return "bg-yellow-500";
      case "canceled":
        return "bg-gray-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadgeColor = (status: Status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "to-review":
        return "bg-purple-100 text-purple-800";
      case "hold":
        return "bg-yellow-100 text-yellow-800";
      case "canceled":
        return "bg-gray-100 text-gray-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "high":
        return "bg-priority-high";
      case "medium":
        return "bg-priority-medium";
      case "low":
        return "bg-priority-low";
      default:
        return "bg-gray-500";
    }
  };

  const getTaskDueText = (deadline: Date) => {
    if (isPast(deadline) && !isToday(deadline)) {
      return `Terlewat ${Math.abs(differenceInDays(deadline, new Date()))} hari`;
    }
    if (isToday(deadline)) {
      return "You must to do!";
    }
    const days = differenceInDays(deadline, new Date());
    return `${days} hari lagi`;
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
    } catch (error: any) {
      toast({
        title: "Error Creating Task",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const todayTasks = tasks.filter((task) => isToday(task.deadline));

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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-3 items-center">
          <ColorThemeSwitcher />
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" /> Quick Add Task
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
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading tasks...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Monthly Task Overview</CardTitle>
                  <ChartBar className="h-5 w-5 text-muted-foreground" />
                </div>
                <CardDescription>
                  Task distribution by month
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={monthlyTaskData}
                    margin={{
                      top: 20,
                      right: 30,
                      left: 0,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" name="Total Tasks" fill="#9333ea" />
                    <Bar dataKey="completed" name="Completed" fill="#22c55e" />
                    <Bar dataKey="overdue" name="Overdue" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Task Status</CardTitle>
                    <ChartPie className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription>
                    Distribution of tasks by status
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 h-36">
                  {statusData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={50}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No task data available
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Task Location</CardTitle>
                    <ChartPie className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <CardDescription>
                    Tasks grouped by location
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 h-36">
                  {locationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={locationData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={50}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {locationData.map((entry, index) => (
                            <Cell key={`cell-location-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                      No task data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="bg-secondary/50 pb-2">
                <CardTitle className="text-lg">Today's Tasks</CardTitle>
                <CardDescription>
                  {todayTasks.length === 0
                    ? "No tasks for today"
                    : `${todayTasks.length} tasks to do today`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {todayTasks.length > 0 ? (
                    todayTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-start justify-between bg-card p-3 rounded-md border">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs text-muted-foreground">
                            PIC: {task.pic} • Lokasi: {task.location}
                          </div>
                          <div className="text-xs italic mt-1 text-primary">
                            You must to do!
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Badge variant="outline" className={
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No tasks scheduled for today
                    </div>
                  )}
                  {todayTasks.length > 5 && (
                    <div className="text-center text-sm text-primary">
                      +{todayTasks.length - 5} more tasks
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-secondary/50 pb-2">
                <CardTitle className="text-lg">Upcoming Tasks</CardTitle>
                <CardDescription>
                  {upcomingTasks.length === 0
                    ? "No upcoming tasks"
                    : `${upcomingTasks.length} tasks coming up`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {upcomingTasks.length > 0 ? (
                    upcomingTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-start justify-between bg-card p-3 rounded-md border">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {format(task.deadline, "MMM d, yyyy")} • {task.pic}
                            <div className="text-xs italic mt-1">
                              {getTaskDueText(task.deadline)}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className={
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {task.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No upcoming tasks
                    </div>
                  )}
                  {upcomingTasks.length > 5 && (
                    <div className="text-center text-sm text-primary">
                      +{upcomingTasks.length - 5} more tasks
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-secondary/50 pb-2">
                <CardTitle className="text-lg">Overdue Tasks</CardTitle>
                <CardDescription>
                  {overdueTasks.length === 0
                    ? "No overdue tasks"
                    : `${overdueTasks.length} tasks overdue`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {overdueTasks.length > 0 ? (
                    overdueTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-start justify-between bg-card p-3 rounded-md border border-destructive/30">
                        <div>
                          <div className="font-medium">{task.title}</div>
                          <div className="text-xs text-destructive">
                            Due {format(task.deadline, "MMM d, yyyy")} • {task.pic}
                            <div className="text-xs italic mt-1">
                              {getTaskDueText(task.deadline)}
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          {task.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No overdue tasks
                    </div>
                  )}
                  {overdueTasks.length > 5 && (
                    <div className="text-center text-sm text-primary">
                      +{overdueTasks.length - 5} more tasks
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="bg-secondary/50 pb-2">
                <CardTitle className="text-lg">Completed Tasks</CardTitle>
                <CardDescription>
                  {completedTasks.length === 0
                    ? "No completed tasks"
                    : `${completedTasks.length} tasks completed`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-3">
                  {completedTasks.length > 0 ? (
                    completedTasks.slice(0, 5).map((task) => (
                      <div key={task.id} className="flex items-start justify-between bg-card p-3 rounded-md border opacity-70">
                        <div>
                          <div className="font-medium line-through">{task.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {task.pic} • {task.location}
                          </div>
                        </div>
                        <Badge variant="outline">Completed</Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No completed tasks
                    </div>
                  )}
                  {completedTasks.length > 5 && (
                    <div className="text-center text-sm text-primary">
                      +{completedTasks.length - 5} more tasks
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
