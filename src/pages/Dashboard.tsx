
import React, { useEffect, useState } from "react";
import { getTasks } from "@/lib/supabase";
import { Task, Status, Priority } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { SAMPLE_TASKS } from "@/lib/default-data";

const Dashboard = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
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

    fetchTasks();
  }, [toast]);

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "overdue":
        return "bg-red-500";
      default:
        return "bg-gray-500";
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

  const todayTasks = tasks.filter(
    (task) => format(task.deadline, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
  );

  const upcomingTasks = tasks.filter(
    (task) =>
      format(task.deadline, "yyyy-MM-dd") !== format(new Date(), "yyyy-MM-dd") &&
      task.deadline > new Date() &&
      task.status !== "completed"
  );

  const overdueTasks = tasks.filter(
    (task) => task.deadline < new Date() && task.status !== "completed"
  );

  const completedTasks = tasks.filter((task) => task.status === "completed");

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading tasks...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="bg-secondary/50 pb-2">
              <CardTitle className="text-lg">Today's Tasks</CardTitle>
              <CardDescription>
                {todayTasks.length === 0
                  ? "No tasks for today"
                  : `${todayTasks.length} tasks to complete today`}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {todayTasks.length > 0 ? (
                  todayTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-start justify-between bg-card p-3 rounded-md border">
                      <div>
                        <div className="font-medium">{task.title}</div>
                        <div className="text-xs text-muted-foreground">{task.pic}</div>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <div className={`h-2 w-2 rounded-full ${getStatusColor(task.status)}`} />
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
                        </div>
                      </div>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
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
                        </div>
                      </div>
                      <Badge variant="outline" className={getPriorityColor(task.priority)}>
                        {task.priority}
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
                          {task.pic}
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
      )}
    </div>
  );
};

export default Dashboard;
