/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import { useState } from "react";
import {
  Plus,
  X,
  ArrowRight,
  CheckCircle,
  Clock,
  Calendar,
  AlignLeft,
  CheckSquare,
  Paperclip,
  MoreHorizontal,
  User,
  Tag,
  GripVertical,
} from "lucide-react";

type Checklist = {
  completed: number;
  total: number;
};

type Task = {
  id: number;
  title: string;
  status:string;
  assignees: string[];
  deadline: string;
  estimatedTime: string;
  checklist?: Checklist;
};


// --- Sample Data ---
const sampleTasks = [
  {
    id: 1,
    title: "Brand Logo Design",
    status: "todo",
    deadline: "Sep 20, 2025",
    estimatedTime: "5 hours",
    assignees: ["/avatars/1.jpg", "/avatars/2.jpg"],
  },
  {
    id: 2,
    title: "Setup CI/CD Pipeline",
    status: "todo",
    deadline: "Sep 22, 2025",
    estimatedTime: "2 days",
    assignees: ["/avatars/3.jpg"],
  },
  {
    id: 3,
    title: "Develop Authentication Service",
    status: "inprogress",
    deadline: "Sep 25, 2025",
    estimatedTime: "3 days",
    checklist: { completed: 2, total: 4 },
    assignees: ["/avatars/1.jpg", "/avatars/4.jpg"],
  },
  {
    id: 4,
    title: "Create Landing Page Wireframe",
    status: "inprogress",
    deadline: "Sep 24, 2025",
    estimatedTime: "1 day",
    checklist: { completed: 1, total: 3 },
    assignees: ["/avatars/2.jpg"],
  },
  {
    id: 5,
    title: "Deploy Staging Environment",
    status: "completed",
    deadline: "Sep 18, 2025",
    estimatedTime: "4 hours",
    assignees: ["/avatars/3.jpg", "/avatars/4.jpg"],
  },
  {
    id: 6,
    title: "Initial Database Schema",
    status: "completed",
    deadline: "Sep 17, 2025",
    estimatedTime: "6 hours",
    assignees: ["/avatars/1.jpg"],
  },
];

const projectDetails = {
  name: "Task Plan",
  members: [
    "/avatars/1.jpg",
    "/avatars/2.jpg",
    "/avatars/3.jpg",
    "/avatars/4.jpg",
  ],
};

// --- AddTaskModal ---
const AddTaskModal = ({
  isOpen,
  onClose,
  onAddTask,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: any) => void;
}) => {
  const [title, setTitle] = useState("");
  const [assignees, setAssignees] = useState<string[]>([]);
  const [deadline, setDeadline] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
   const availableAssignees = [
    { id: "1", name: "John Doe", avatar: "/avatars/1.jpg" },
    { id: "2", name: "Jane Smith", avatar: "/avatars/2.jpg" },
    { id: "3", name: "Mike Johnson", avatar: "/avatars/3.jpg" },
    { id: "4", name: "Sarah Wilson", avatar: "/avatars/4.jpg" },
  ];
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onAddTask({
      id: Date.now(),
      title,
      status: "todo",
      
      deadline: deadline || "N/A",
      estimatedTime: estimatedTime || "N/A",
      assignees,
      tags,
    });
    onClose();
    setTitle("");
    setAssignees([]);
    setDeadline("");
    setEstimatedTime("");
    setTags([]);
    setNewTag("");
  };
  
  const toggleAssignee = (assigneeId: string) => {
    setAssignees(prev =>
      prev.includes(assigneeId)
        ? prev.filter(id => id !== assigneeId)
        : [...prev, assigneeId]
    );
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };
  
  
  
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50  animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white   rounded-2xl p-3 shadow-xl transform transition-all duration-200 animate-in slide-in-from-bottom-4 scale-in-95 "
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Add New Task
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-3 bg-slate-100 border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
              placeholder="e.g., Design the new dashboard"
              required
            />
          </div>
        
         {/* Assigned to */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <User size={16} className="inline mr-1" />
              Assigned to
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableAssignees.map((assignee) => (
                <button
                  key={assignee.id}
                  type="button"
                  onClick={() => toggleAssignee(assignee.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${
                    assignees.includes(assignee.id)
                      ? "bg-fuchsia-100 border-fuchsia-300 text-fuchsia-700"
                      : "bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-400 flex items-center justify-center text-white text-xs font-medium">
                    {assignee.id}
                  </div>
                  <span className="text-sm">{assignee.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Tag size={16} className="inline mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-red-200 rounded-full p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="flex-1 px-3 py-2 bg-slate-100 border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
                placeholder="Add a tag"
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Calendar size={16} className="inline mr-1" />
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-3 bg-slate-100 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            />
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Clock size={16} className="inline mr-1" />
              Estimated Time
            </label>
            <select
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              className="w-full px-3 py-3 bg-slate-100 border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              <option value="">Select estimated time</option>
              <option value="1 hour">1 hour</option>
              <option value="2 hours">2 hours</option>
              <option value="4 hours">4 hours</option>
              <option value="6 hours">6 hours</option>
              <option value="1 day">1 day</option>
              <option value="2 days">2 days</option>
              <option value="3 days">3 days</option>
              <option value="1 week">1 week</option>
              <option value="2 weeks">2 weeks</option>
            </select>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-fuchsia-600 to-violet-600 rounded-lg hover:from-fuchsia-700 hover:to-violet-700 transition-all"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
    
   

// --- MoveTaskModal ---
const MoveTaskModal = ({
  isOpen,
  onClose,
  tasksToMove,
  onMoveTask,
  targetStatus,
}: {
  isOpen: boolean;
  onClose: () => void;
  tasksToMove: any[];
  onMoveTask: (taskId: number) => void;
  targetStatus: string;
}) => {
  const getTargetTitle = (status: string) => {
    switch (status) {
      case "todo": return "To Do";
      case "inprogress": return "In Progress";
      case "completed": return "Completed";
      default: return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            Move to &quot;{getTargetTitle(targetStatus)}&quot;
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {tasksToMove.length > 0 ? (
            tasksToMove.map((task) => (
              <button
                key={task.id}
                onClick={() => onMoveTask(task.id)}
                className="w-full text-left p-3 bg-slate-100 rounded-lg hover:bg-fuchsia-100 text-slate-700 transition-colors flex items-center justify-between group"
              >
                <span className="font-medium">{task.title}</span>
                <ArrowRight size={16} className="text-slate-400 group-hover:text-fuchsia-600 transition-colors" />
              </button>
            ))
          ) : (
            <p className="text-slate-500 text-center py-8">No tasks available to move.</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- KanbanColumn ---
const KanbanColumn = ({
  title,
  status,
  tasks,
  onTaskClick,
  onButtonClick,
  onDrop,
  onDragOver,
}: {
  title: string;
  status: string;
  tasks: any[];
  onTaskClick: (task: any) => void;
  onButtonClick: () => void;
  onDrop: (e: React.DragEvent, status: string) => void;
  onDragOver: (e: React.DragEvent) => void;
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "todo": return "bg-blue-500";
      case "inprogress": return "bg-yellow-500";
      case "completed": return "bg-green-500";
      default: return "bg-slate-500";
    }
  };

  return (
    <div 
      className="flex-1 min-w-[320px] bg-slate-100/80 rounded-xl p-4 flex flex-col transition-all hover:bg-slate-100"
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}></div>
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-600 bg-slate-200 px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {tasks.map((task) => (
          <TaskCard 
            key={task.id} 
            task={task} 
            onClick={() => onTaskClick(task)} 
          />
        ))}
      </div>
      {status === "todo" && (
      <button
        onClick={onButtonClick}
        className="w-full mt-4 flex items-center justify-center gap-2 text-slate-500 hover:text-fuchsia-600 transition-colors py-3 rounded-lg hover:bg-white/50 border-2 border-dashed border-slate-300 hover:border-fuchsia-300"
      >
        <Plus size={16} />
        Add New Task
      </button>
       )}
    </div>
  );
};

// --- TaskCard ---
const TaskCard = ({ task, onClick }: { task: any; onClick: () => void }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData("text/plain", task.id.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={onClick}
      className={`relative bg-white p-4 rounded-lg border border-slate-200 shadow-sm cursor-pointer hover:border-fuchsia-500 transition-all group ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            alert("Options for: " + task.title);
          }}
          className="text-slate-400 hover:text-slate-700 p-1 rounded"
        >
          <MoreHorizontal size={16} />
        </button>
        <div className="text-slate-400 cursor-move">
          <GripVertical size={16} />
        </div>
      </div>
      
      <div className="pr-12">
        <p className="font-semibold text-slate-800 leading-snug">{task.title}</p>
        
        {task.checklist && (
          <div className="flex items-center gap-2 mt-2">
            <CheckSquare size={14} className="text-slate-400" />
            <span className="text-xs text-slate-500">
              {task.checklist.completed}/{task.checklist.total} completed
            </span>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>{task.deadline}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            <span>{task.estimatedTime}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <div className="flex -space-x-1">
            {task.assignees.slice(0, 3).map((avatar: string, index: number) => (
              <div
                key={index}
                className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-fuchsia-400 to-violet-400 flex items-center justify-center text-white text-xs font-medium"
              >
                {index + 1}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-400 flex items-center justify-center text-white text-xs font-medium">
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
          
          {task.status === "completed" && (
            <CheckCircle size={16} className="text-green-500" />
          )}
        </div>
      </div>
    </div>
  );
};

export default function ProjectsPage() {
  // const [tasks, setTasks] = useState(sampleTasks);
  // const [selectedTask, setSelectedTask] = useState(null);
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [targetColumn, setTargetColumn] = useState("");

  const handleAddTask = (newTask: any) => {
    setTasks((prev) => [...prev, newTask]);
  };

  const handleMoveTask = (taskId: number) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status: targetColumn } : t
      )
    );
    setIsMoveModalOpen(false);
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData("text/plain"));
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, status } : t
      )
    );
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const openModalForColumn = (status: string) => {
    setTargetColumn(status);
    if (status === "todo") {
      setIsAddModalOpen(true);
    } else {
      const availableTasks = tasks.filter(t => t.status !== status);
      if (availableTasks.length === 0) {
        alert("No tasks available to move!");
        return;
      }
      setIsMoveModalOpen(true);
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const closeSidebar = () => {
    setSelectedTask(null);
  };

  const columns = {
    todo: tasks.filter((t) => t.status === "todo"),
    inprogress: tasks.filter((t) => t.status === "inprogress"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  const totalTasks = tasks.length;

  return (
    <>
      <AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddTask={handleAddTask}
      />
      <MoveTaskModal
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        tasksToMove={tasks.filter(t => t.status !== targetColumn)}
        onMoveTask={handleMoveTask}
        targetStatus={targetColumn}
      />

      <div className="flex h-screen bg-slate-50 text-slate-800 overflow-hidden">
        <main className={`flex-1 flex flex-col p-8 overflow-y-auto ${selectedTask ? 'mr-0' : ''}`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                {projectDetails.name}
              </h1>
              <p className="text-slate-600">
                Total Tasks: <span className="font-semibold text-slate-800">{totalTasks}</span>
                {" • "}
                <span className="text-blue-600 font-medium">{columns.todo.length} To Do</span>
                {" • "}
                <span className="text-yellow-600 font-medium">{columns.inprogress.length} In Progress</span>
                {" • "}
                <span className="text-green-600 font-medium">{columns.completed.length} Completed</span>
              </p>
            </div>
          </div>
          
          <div className="flex-1 flex flex-wrap gap-6 min-h-0">
            <KanbanColumn
              title="To Do"
              status="todo"
              tasks={columns.todo}
              onTaskClick={handleTaskClick}
              onButtonClick={() => openModalForColumn("todo")}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
            <KanbanColumn
              title="In Progress"
              status="inprogress"
              tasks={columns.inprogress}
              onTaskClick={handleTaskClick}
              onButtonClick={() => openModalForColumn("inprogress")}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
            <KanbanColumn
              title="Completed"
              status="completed"
              tasks={columns.completed}
              onTaskClick={handleTaskClick}
              onButtonClick={() => openModalForColumn("completed")}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            />
          </div>
        </main>

        {/* --- Sidebar --- */}
        {selectedTask && (
          <aside className="w-[340px] bg-white border-l border-slate-200 p-6 flex-shrink-0 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                selectedTask.status === "todo" ? "bg-blue-100 text-blue-700" :
                selectedTask.status === "inprogress" ? "bg-yellow-100 text-yellow-700" :
                "bg-green-100 text-green-700"
              }`}>
                {selectedTask.status === "todo" ? "To Do" :
                 selectedTask.status === "inprogress" ? "In Progress" : "Completed"}
              </span>
              <button
                onClick={closeSidebar}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-md hover:bg-slate-100"
                title="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">
              {selectedTask.title}
            </h2>
            
            <div className="mt-6 space-y-4 text-sm border-t border-b border-slate-200 py-6">
              <div className="flex items-center gap-4">
                <User size={16} className="text-slate-500" />
                <div>
                  <p className="text-slate-600 mb-1">Assigned to</p>
                  <div className="flex -space-x-1">
                    {selectedTask.assignees.length > 0 ? (
                      selectedTask.assignees.slice(0, 3).map((avatar: string, index: number) => (
                        <div
                          key={index}
                          className="w-6 h-6 rounded-full border-2 border-white bg-gradient-to-br from-fuchsia-400 to-violet-400 flex items-center justify-center text-white text-xs font-medium"
                        >
                          {index + 1}
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 text-sm">Unassigned</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Tag size={16} className="text-slate-500" />
                <div>
                  <p className="text-slate-600 mb-1">Tags</p>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      Backend
                    </span>
                    {/* <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      API
                    </span> */}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Calendar size={16} className="text-slate-500" />
                <div>
                  <p className="text-slate-600 mb-1">Deadline</p>
                  <p className="font-semibold text-slate-800">{selectedTask.deadline}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Clock size={16} className="text-slate-500" />
                <div>
                  <p className="text-slate-600 mb-1">Estimated Time</p>
                  <p className="font-semibold text-slate-800">{selectedTask.estimatedTime}</p>
                </div>
              </div>
              
              {selectedTask.checklist && (
                <div className="flex items-center gap-4">
                  <CheckSquare size={16} className="text-slate-500" />
                  <div>
                    <p className="text-slate-600 mb-1">Progress</p>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all duration-300"
                          style={{ 
                            width: `${(selectedTask.checklist.completed / selectedTask.checklist.total) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-600 font-medium">
                        {selectedTask.checklist.completed}/{selectedTask.checklist.total}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <AlignLeft size={16} className="text-slate-500" />
                <h3 className="font-semibold text-slate-800">Description</h3>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">
                This task involves implementing the core authentication system for the application. 
                It includes user registration, login, password reset functionality, and JWT token management.
              </p>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}