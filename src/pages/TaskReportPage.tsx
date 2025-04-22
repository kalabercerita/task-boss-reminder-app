
import React, { useEffect, useState, useRef } from "react";
import { getAllTasks } from "@/lib/supabase";
import { Task } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { format, getMonth, getYear, setMonth, setYear, isWithinInterval, startOfMonth, endOfMonth, isValid } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { FileText, Download, Calendar } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { sendWhatsAppMessage } from "@/lib/whatsapp";

const TaskReportPage = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(getMonth(new Date()));
  const [selectedYear, setSelectedYear] = useState(getYear(new Date()));
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await getAllTasks();
        setTasks(data);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error loading tasks",
          description: "Could not load task data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [toast]);

  const getFilteredTasks = () => {
    const startDate = startOfMonth(new Date(selectedYear, selectedMonth));
    const endDate = endOfMonth(new Date(selectedYear, selectedMonth));
    
    return tasks.filter(task => {
      const taskDate = new Date(task.deadline);
      return isWithinInterval(taskDate, { start: startDate, end: endDate });
    });
  };

  const getTasksByStatus = () => {
    const filteredTasks = getFilteredTasks();
    const statusCounts = {
      todo: 0,
      'in-progress': 0,
      completed: 0,
      'to-review': 0,
      hold: 0,
      canceled: 0,
      overdue: 0
    };
    
    filteredTasks.forEach(task => {
      if (task.status === 'overdue') {
        statusCounts.overdue += 1;
      } else if (statusCounts.hasOwnProperty(task.status)) {
        statusCounts[task.status as keyof typeof statusCounts] += 1;
      }
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value,
      color: getStatusColor(name)
    })).filter(item => item.value > 0);
  };

  const getTasksByLocation = () => {
    const filteredTasks = getFilteredTasks();
    const locationCounts: {[key: string]: number} = {};
    
    filteredTasks.forEach(task => {
      const location = task.location;
      locationCounts[location] = (locationCounts[location] || 0) + 1;
    });
    
    return Object.entries(locationCounts).map(([name, value]) => ({
      name,
      value,
      color: getLocationColor(name)
    }));
  };

  const getTasksByPriority = () => {
    const filteredTasks = getFilteredTasks();
    const priorityCounts = {
      high: 0,
      medium: 0,
      low: 0
    };
    
    filteredTasks.forEach(task => {
      priorityCounts[task.priority] += 1;
    });
    
    return Object.entries(priorityCounts).map(([name, value]) => ({
      name,
      value,
      color: getPriorityColor(name)
    })).filter(item => item.value > 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#22c55e";
      case "in-progress":
        return "#3b82f6";
      case "to-review":
        return "#8b5cf6";
      case "hold":
        return "#eab308";
      case "canceled":
        return "#6b7280";
      case "overdue":
        return "#ef4444";
      default:
        return "#94a3b8";
    }
  };

  const getLocationColor = (location: string) => {
    const colorMap: Record<string, string> = {
      "BOSQU": "#818cf8",
      "RUMAH": "#34d399",
      "HP GOJEK": "#fbbf24"
    };
    return colorMap[location] || "#94a3b8";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "#ef4444";
      case "medium":
        return "#eab308";
      case "low":
        return "#22c55e";
      default:
        return "#6b7280";
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const currentYear = getYear(new Date());
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);

  const exportToPdf = async () => {
    if (!reportRef.current) return;
    
    setPdfGenerating(true);
    try {
      const reportElement = reportRef.current;
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      const fileName = `Task_Report_${months[selectedMonth]}_${selectedYear}.pdf`;
      pdf.save(fileName);
      
      toast({
        title: "PDF Generated",
        description: "Your report has been downloaded",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF",
        variant: "destructive",
      });
    } finally {
      setPdfGenerating(false);
    }
  };

  const sendPdfViaWhatsApp = async () => {
    if (!reportRef.current || !whatsappNumber) {
      toast({
        title: "Error",
        description: "Please enter a valid WhatsApp number",
        variant: "destructive",
      });
      return;
    }
    
    setPdfGenerating(true);
    try {
      const reportElement = reportRef.current;
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Convert PDF to base64
      const pdfBase64 = pdf.output('datauristring');
      
      // Format phone number (ensure it has country code)
      let phoneNumber = whatsappNumber;
      if (!phoneNumber.startsWith('+')) {
        if (phoneNumber.startsWith('0')) {
          phoneNumber = '+62' + phoneNumber.substring(1);
        } else {
          phoneNumber = '+62' + phoneNumber;
        }
      }
      
      // Send PDF via WhatsApp
      await sendWhatsAppMessage({
        to: phoneNumber,
        message: `Task Report for ${months[selectedMonth]} ${selectedYear}`,
        attachment: pdfBase64
      });
      
      toast({
        title: "Report Sent",
        description: `Report was sent to ${phoneNumber} via WhatsApp`,
      });
    } catch (error) {
      console.error("Error sending PDF via WhatsApp:", error);
      toast({
        title: "Error",
        description: "Failed to send report via WhatsApp",
        variant: "destructive",
      });
    } finally {
      setPdfGenerating(false);
    }
  };

  const filteredTasks = getFilteredTasks();
  const tasksByStatus = getTasksByStatus();
  const tasksByLocation = getTasksByLocation();
  const tasksByPriority = getTasksByPriority();

  return (
    <div className="space-y-6 container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Task Report</h1>
        <div className="flex gap-3">
          <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="whatsapp">WhatsApp Number</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="whatsapp"
              placeholder="e.g. +628123456789"
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
            />
            <Button 
              onClick={sendPdfViaWhatsApp} 
              disabled={pdfGenerating || !whatsappNumber}
              className="whitespace-nowrap"
            >
              Send via WhatsApp
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Enter WhatsApp number with country code
          </p>
        </div>
        <div className="flex justify-end items-end">
          <Button 
            onClick={exportToPdf} 
            disabled={pdfGenerating}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download PDF Report
          </Button>
        </div>
      </div>

      <div ref={reportRef} className="bg-white p-6 rounded-lg space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Task Report</h2>
          <p className="text-muted-foreground">
            {months[selectedMonth]} {selectedYear}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <div className="bg-muted/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Task Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-background p-3 rounded-md border">
                <div className="text-sm text-muted-foreground">Total Tasks</div>
                <div className="text-2xl font-bold">{filteredTasks.length}</div>
              </div>
              <div className="bg-background p-3 rounded-md border">
                <div className="text-sm text-muted-foreground">Completed</div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredTasks.filter(t => t.status === 'completed').length}
                </div>
              </div>
              <div className="bg-background p-3 rounded-md border">
                <div className="text-sm text-muted-foreground">In Progress</div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredTasks.filter(t => t.status === 'in-progress').length}
                </div>
              </div>
              <div className="bg-background p-3 rounded-md border">
                <div className="text-sm text-muted-foreground">Overdue</div>
                <div className="text-2xl font-bold text-red-600">
                  {filteredTasks.filter(t => t.status === 'overdue').length}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-muted/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Tasks by Status</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tasksByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-muted/20 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Tasks by Priority</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tasksByPriority}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tasksByPriority.map((entry, index) => (
                      <Cell key={`cell-priority-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-muted/20 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Task List</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Person in Charge
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="px-4 py-2 text-sm">{task.title}</td>
                      <td className="px-4 py-2 text-sm">
                        <span 
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ backgroundColor: `${getStatusColor(task.status)}20`, color: getStatusColor(task.status) }}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {format(task.deadline, "MMM d, yyyy")}
                      </td>
                      <td className="px-4 py-2 text-sm">{task.pic}</td>
                      <td className="px-4 py-2 text-sm">
                        <span 
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ backgroundColor: `${getPriorityColor(task.priority)}20`, color: getPriorityColor(task.priority) }}
                        >
                          {task.priority}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-4 text-sm text-center text-gray-500">
                      No tasks found for this month
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskReportPage;
