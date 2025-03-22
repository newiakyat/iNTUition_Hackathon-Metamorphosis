"use client";

import { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent
} from "@/components/ui/card";
import { projects } from "@/app/data/mockData";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/AuthContext";
import { Department } from "@/lib/AuthContext";

const initialPhaseState = {
  id: 0,
  title: "",
  description: "",
  status: "Not Started",
  progress: 0,
  startDate: "",
  endDate: "",
};

const initialKpiState = {
  id: 0,
  title: "",
  value: 0,
  trend: "up",
  color: "bg-blue-500"
};

type ProjectFormState = {
  title: string;
  description: string;
  status: string;
  priority: string;
  owner: string;
  startDate: string;
  endDate: string;
  risk: string;
  budget: string;
  spent: string;
  stakeholders: string;
  allowedDepartments: Department[];
  kpis: {
    id: number;
    title: string;
    value: number;
    trend: string;
    color: string;
  }[];
  phases: {
    id: number;
    title: string;
    description: string;
    status: string;
    progress: number;
    startDate: string;
    endDate: string;
  }[];
};

const initialFormState: ProjectFormState = {
  title: "",
  description: "",
  status: "Planning",
  priority: "Medium",
  owner: "",
  startDate: "",
  endDate: "",
  risk: "Medium",
  budget: "",
  spent: "0",
  stakeholders: "",
  allowedDepartments: [],
  kpis: [{ ...initialKpiState, id: Date.now() }],
  phases: [{ ...initialPhaseState, id: Date.now() + 1 }],
};

export default function AddProjectModal({
  open,
  onClose,
  onAddProject,
}: {
  open: boolean;
  onClose: () => void;
  onAddProject: (project: any) => void;
}) {
  const [formState, setFormState] = useState<ProjectFormState>(initialFormState);
  const { isAdmin } = useAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhaseChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updatedPhases = [...formState.phases];
    updatedPhases[index] = { ...updatedPhases[index], [name]: value };
    setFormState((prev) => ({ ...prev, phases: updatedPhases }));
  };

  const handlePhaseSelectChange = (index: number, name: string, value: string) => {
    const updatedPhases = [...formState.phases];
    updatedPhases[index] = { ...updatedPhases[index], [name]: value };
    setFormState((prev) => ({ ...prev, phases: updatedPhases }));
  };

  const addPhase = () => {
    setFormState((prev) => ({
      ...prev,
      phases: [...prev.phases, { ...initialPhaseState, id: Date.now() }],
    }));
  };

  const removePhase = (index: number) => {
    if (formState.phases.length > 1) {
      const updatedPhases = [...formState.phases];
      updatedPhases.splice(index, 1);
      setFormState((prev) => ({ ...prev, phases: updatedPhases }));
    }
  };

  const handleKpiChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedKpis = [...formState.kpis];
    updatedKpis[index] = { 
      ...updatedKpis[index], 
      [name]: name === 'value' ? Math.min(parseInt(value) || 0, 100) : value 
    };
    setFormState((prev) => ({ ...prev, kpis: updatedKpis }));
  };

  const handleKpiSelectChange = (index: number, name: string, value: string) => {
    const updatedKpis = [...formState.kpis];
    updatedKpis[index] = { ...updatedKpis[index], [name]: value };
    setFormState((prev) => ({ ...prev, kpis: updatedKpis }));
  };

  const addKpi = () => {
    setFormState((prev) => ({
      ...prev,
      kpis: [...prev.kpis, { ...initialKpiState, id: Date.now() }],
    }));
  };

  const removeKpi = (index: number) => {
    if (formState.kpis.length > 1) {
      const updatedKpis = [...formState.kpis];
      updatedKpis.splice(index, 1);
      setFormState((prev) => ({ ...prev, kpis: updatedKpis }));
    }
  };

  const toggleDepartment = (department: Department) => {
    setFormState(prev => {
      if (prev.allowedDepartments.includes(department)) {
        return {
          ...prev,
          allowedDepartments: prev.allowedDepartments.filter(d => d !== department)
        };
      } else {
        return {
          ...prev,
          allowedDepartments: [...prev.allowedDepartments, department]
        };
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Process form data
    const newProject = {
      id: projects.length + 1,
      title: formState.title,
      description: formState.description,
      status: formState.status,
      priority: formState.priority,
      owner: formState.owner,
      startDate: formState.startDate,
      endDate: formState.endDate,
      progress: 0, // New projects start at 0%
      risk: formState.risk,
      budget: parseFloat(formState.budget) || 0,
      spent: parseFloat(formState.spent) || 0,
      stakeholders: formState.stakeholders.split(',').map(s => s.trim()),
      allowedDepartments: formState.allowedDepartments as Department[],
      kpis: formState.kpis.map(kpi => ({
        ...kpi,
        value: parseInt(String(kpi.value)) || 0
      })),
      phases: formState.phases.map((phase, idx) => ({
        ...phase,
        id: (projects.length + 1) * 100 + (idx + 1),
        progress: phase.status === "Completed" ? 100 : 
                 phase.status === "In Progress" ? parseInt(String(phase.progress)) || 50 : 0
      })),
    };
    
    onAddProject(newProject);
    setFormState(initialFormState);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Project</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                name="title"
                value={formState.title}
                onChange={handleInputChange}
                placeholder="Project title"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Owner *</label>
              <Input
                name="owner"
                value={formState.owner}
                onChange={handleInputChange}
                placeholder="Project owner"
                required
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                name="description"
                value={formState.description}
                onChange={handleInputChange}
                placeholder="Project description"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={formState.status}
                onValueChange={(value) => handleSelectChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="On Hold">On Hold</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={formState.priority}
                onValueChange={(value) => handleSelectChange("priority", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date *</label>
              <Input
                type="date"
                name="startDate"
                value={formState.startDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date *</label>
              <Input
                type="date"
                name="endDate"
                value={formState.endDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Risk Level</label>
              <Select
                value={formState.risk}
                onValueChange={(value) => handleSelectChange("risk", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Budget ($)</label>
              <Input
                type="number"
                name="budget"
                value={formState.budget}
                onChange={handleInputChange}
                placeholder="0.00"
                min="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Stakeholders (comma-separated)</label>
              <Input
                name="stakeholders"
                value={formState.stakeholders}
                onChange={handleInputChange}
                placeholder="e.g. IT, Finance, Marketing"
              />
            </div>

            {isAdmin && (
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Department Access</label>
                  <span className="text-xs text-muted-foreground">
                    {formState.allowedDepartments.length === 0 
                      ? "All departments will have access" 
                      : `${formState.allowedDepartments.length} department(s) selected`}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Select which departments can access this project. If none are selected, all departments will have access.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dept-rd" 
                      checked={formState.allowedDepartments.includes('RD')}
                      onCheckedChange={() => toggleDepartment('RD')}
                    />
                    <Label htmlFor="dept-rd">Research & Development</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dept-it" 
                      checked={formState.allowedDepartments.includes('IT')}
                      onCheckedChange={() => toggleDepartment('IT')}
                    />
                    <Label htmlFor="dept-it">IT & Digital Data</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dept-sales" 
                      checked={formState.allowedDepartments.includes('SALES')}
                      onCheckedChange={() => toggleDepartment('SALES')}
                    />
                    <Label htmlFor="dept-sales">Sales</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dept-marketing" 
                      checked={formState.allowedDepartments.includes('MARKETING')}
                      onCheckedChange={() => toggleDepartment('MARKETING')}
                    />
                    <Label htmlFor="dept-marketing">Marketing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dept-engineering" 
                      checked={formState.allowedDepartments.includes('ENGINEERING')}
                      onCheckedChange={() => toggleDepartment('ENGINEERING')}
                    />
                    <Label htmlFor="dept-engineering">Engineering</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dept-supply" 
                      checked={formState.allowedDepartments.includes('SUPPLY')}
                      onCheckedChange={() => toggleDepartment('SUPPLY')}
                    />
                    <Label htmlFor="dept-supply">Supply Chain</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dept-manufacturing" 
                      checked={formState.allowedDepartments.includes('MANUFACTURING')}
                      onCheckedChange={() => toggleDepartment('MANUFACTURING')}
                    />
                    <Label htmlFor="dept-manufacturing">Manufacturing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="dept-hr" 
                      checked={formState.allowedDepartments.includes('HR')}
                      onCheckedChange={() => toggleDepartment('HR')}
                    />
                    <Label htmlFor="dept-hr">Human Resources</Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project KPIs</h3>
              <Button type="button" variant="outline" size="sm" onClick={addKpi}>
                <Plus className="h-4 w-4 mr-2" /> Add KPI
              </Button>
            </div>
            
            <div className="space-y-4">
              {formState.kpis.map((kpi, index) => (
                <Card key={kpi.id} className="border border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">KPI {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeKpi(index)}
                        disabled={formState.kpis.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title *</label>
                        <Input
                          name="title"
                          value={kpi.title}
                          onChange={(e) => handleKpiChange(index, e)}
                          placeholder="KPI title"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Value (%) *</label>
                        <Input
                          type="number"
                          name="value"
                          value={kpi.value}
                          onChange={(e) => handleKpiChange(index, e)}
                          placeholder="0-100"
                          min="0"
                          max="100"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Trend</label>
                        <Select
                          value={kpi.trend}
                          onValueChange={(value) => handleKpiSelectChange(index, "trend", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select trend" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="up">Trending Up</SelectItem>
                            <SelectItem value="down">Trending Down</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Color</label>
                        <Select
                          value={kpi.color}
                          onValueChange={(value) => handleKpiSelectChange(index, "color", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select color" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bg-blue-500">Blue</SelectItem>
                            <SelectItem value="bg-green-500">Green</SelectItem>
                            <SelectItem value="bg-red-500">Red</SelectItem>
                            <SelectItem value="bg-yellow-500">Yellow</SelectItem>
                            <SelectItem value="bg-purple-500">Purple</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Project Phases</h3>
              <Button type="button" variant="outline" size="sm" onClick={addPhase}>
                <Plus className="h-4 w-4 mr-2" /> Add Phase
              </Button>
            </div>
            
            <div className="space-y-4">
              {formState.phases.map((phase, index) => (
                <Card key={phase.id} className="border border-gray-200">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium">Phase {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removePhase(index)}
                        disabled={formState.phases.length <= 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title *</label>
                        <Input
                          name="title"
                          value={phase.title}
                          onChange={(e) => handlePhaseChange(index, e)}
                          placeholder="Phase title"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <Select
                          value={phase.status}
                          onValueChange={(value) => handlePhaseSelectChange(index, "status", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Not Started">Not Started</SelectItem>
                            <SelectItem value="In Progress">In Progress</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                          name="description"
                          value={phase.description}
                          onChange={(e) => handlePhaseChange(index, e)}
                          placeholder="Phase description"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date *</label>
                        <Input
                          type="date"
                          name="startDate"
                          value={phase.startDate}
                          onChange={(e) => handlePhaseChange(index, e)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date *</label>
                        <Input
                          type="date"
                          name="endDate"
                          value={phase.endDate}
                          onChange={(e) => handlePhaseChange(index, e)}
                          required
                        />
                      </div>

                      {phase.status === "In Progress" && (
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-medium">Progress (%)</label>
                          <Input
                            type="number"
                            name="progress"
                            value={phase.progress}
                            onChange={(e) => handlePhaseChange(index, e)}
                            min="1"
                            max="99"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Save Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 