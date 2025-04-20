
import React, { useEffect, useState } from "react";
import { getTasks } from "@/lib/supabase";
import { Task } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Calendar from "react-calendar";
import { format, isSameDay } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { SAMPLE_TASKS } from "@/lib/default-data";
import 'react-calendar/dist/Calendar.css';

const CalendarPage = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getTasks();
        const fetchedTasks = data.length ? data : SAMPLE_TASKS;
        setTasks(fetchedTasks);
        
        // Group tasks by date
        const groupedTasks: Record<string, Task[]> = {};
        fetchedTasks.forEach(task => {
          const dateKey = format(task.deadline, "yyyy-MM-dd");
          if (!groupedTasks[dateKey]) {
            groupedTasks[dateKey] = [];
          }
          groupedTasks[dateKey].push(task);
        });
        
        setTasksByDate(groupedTasks);
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

  const getSelectedDateTasks = () => {
    const dateKey = format(selectedDate, "yyyy-MM-dd");
    return tasksByDate[dateKey] || [];
  };

  const getPriorityColor = (priority: string) => {
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

  const getStatusColor = (status: string) => {
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

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;
    
    const dateKey = format(date, "yyyy-MM-dd");
    const dateTasks = tasksByDate[dateKey] || [];
    
    if (dateTasks.length === 0) return null;
    
    const tasksByPriority = {
      high: dateTasks.filter(task => task.priority === 'high').length,
      medium: dateTasks.filter(task => task.priority === 'medium').length,
      low: dateTasks.filter(task => task.priority === 'low').length,
    };
    
    return (
      <div className="flex flex-wrap gap-1 mt-1 justify-center">
        {tasksByPriority.high > 0 && (
          <div className="h-2 w-2 rounded-full bg-priority-high"></div>
        )}
        {tasksByPriority.medium > 0 && (
          <div className="h-2 w-2 rounded-full bg-priority-medium"></div>
        )}
        {tasksByPriority.low > 0 && (
          <div className="h-2 w-2 rounded-full bg-priority-low"></div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Calendar</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading calendar...</p>
              </div>
            ) : (
              <div className="calendar-container">
                <style>
                  {`
                  .react-calendar {
                    width: 100%;
                    background: transparent;
                    border: none;
                    font-family: inherit;
                  }
                  .react-calendar__tile {
                    padding: 1em 0.5em;
                    position: relative;
                    height: 80px;
                  }
                  .react-calendar__tile--now {
                    background: rgba(155, 135, 245, 0.1);
                  }
                  .react-calendar__tile--active {
                    background: rgba(155, 135, 245, 0.2);
                    color: black;
                  }
                  .react-calendar__month-view__days__day--neighboringMonth {
                    color: #ccc;
                  }
                  .react-calendar__tile--active:enabled:hover,
                  .react-calendar__tile--active:enabled:focus {
                    background: rgba(155, 135, 245, 0.3);
                  }
                  .react-calendar__tile:enabled:hover,
                  .react-calendar__tile:enabled:focus {
                    background: rgba(155, 135, 245, 0.1);
                  }
                  .react-calendar__navigation button:enabled:hover,
                  .react-calendar__navigation button:enabled:focus {
                    background: rgba(155, 135, 245, 0.1);
                  }
                  `}
                </style>
                <Calendar
                  onChange={(value: any) => {
                    if (value instanceof Date) {
                      setSelectedDate(value);
                    }
                  }}
                  value={selectedDate}
                  tileContent={tileContent}
                  className="border rounded-md shadow-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Tasks for {format(selectedDate, "MMMM d, yyyy")}
            </h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Loading tasks...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getSelectedDateTasks().length > 0 ? (
                  getSelectedDateTasks().map((task) => (
                    <div
                      key={task.id}
                      className="p-4 border rounded-md bg-card"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{task.title}</h3>
                          {task.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">
                              {task.pic}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                              {task.priority}
                            </Badge>
                            <Badge variant="outline" className="bg-secondary">
                              {task.location}
                            </Badge>
                          </div>
                        </div>
                        <div className={`h-3 w-3 rounded-full ${getStatusColor(task.status)}`} />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No tasks scheduled for this day
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
