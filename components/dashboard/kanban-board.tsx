"use client";

import React, { useState, useEffect, useTransition } from 'react';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { KanbanTask, TaskStatus, updateTaskStatus, createTask, updateTask } from '@/lib/actions/tasks';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Loader2, Users, Edit2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export interface AssigneesData {
    users: { id: string; name: string }[];
    teams: { id: string; name: string }[];
    forms: { id: string; title: string }[];
}

interface KanbanBoardProps {
    orgId: string;
    initialTasks: KanbanTask[];
    assignees: AssigneesData;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
    { id: 'TODO', title: 'To Do' },
    { id: 'IN_PROGRESS', title: 'In Progress' },
    { id: 'DONE', title: 'Done' }
];

export function KanbanBoard({ orgId, initialTasks, assignees }: KanbanBoardProps) {
    const [tasks, setTasks] = useState<KanbanTask[]>(initialTasks);
    const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);
    const [editingTask, setEditingTask] = useState<KanbanTask | null>(null);

    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const task = tasks.find(t => t.id === active.id);
        if (task) setActiveTask(task);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveTask(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        // Is it dropped over a column?
        const isOverColumn = COLUMNS.some(col => col.id === overId);

        let newStatus: TaskStatus | null = null;

        if (isOverColumn) {
            newStatus = overId as TaskStatus;
        } else {
            // Is it dropped over another task?
            const overTask = tasks.find(t => t.id === overId);
            if (overTask) {
                newStatus = overTask.status;
            }
        }

        if (newStatus) {
            const task = tasks.find(t => t.id === activeId);
            if (task && task.status !== newStatus) {
                // Optimistic UI update
                setTasks(prev => prev.map(t => t.id === activeId ? { ...t, status: newStatus as TaskStatus } : t));

                // Server action update
                const res = await updateTaskStatus(orgId, activeId, newStatus);
                if (res?.error) {
                    console.error("Failed to update status", res.error);
                    alert(`Failed to save task: ${res.error}`);
                    // Revert on failure
                    setTasks(prev => prev.map(t => t.id === activeId ? { ...t, status: task.status } : t));
                }
            }
        }
    };

    return (
        <div className="w-full">
            <Tabs defaultValue="board" className="w-full">
                <div className="flex items-center justify-between mb-4">
                    <TabsList>
                        <TabsTrigger value="board">Board View</TabsTrigger>
                        <TabsTrigger value="list">List View</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="board" className="mt-0">
                    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                        <div className="grid gap-4 md:grid-cols-3">
                            {COLUMNS.map(column => (
                                <KanbanColumn
                                    key={column.id}
                                    column={column}
                                    tasks={tasks.filter(t => t.status === column.id)}
                                    orgId={orgId}
                                    assignees={assignees}
                                    onEdit={(t) => setEditingTask(t)}
                                />
                            ))}
                        </div>
                        <DragOverlay>
                            {activeTask ? <TaskCard task={activeTask} isOverlay /> : null}
                        </DragOverlay>
                    </DndContext>
                </TabsContent>

                <TabsContent value="list" className="mt-0">
                    <TaskListView tasks={tasks} onEdit={(t) => setEditingTask(t)} />
                </TabsContent>
            </Tabs>

            {editingTask && (
                <EditTaskDialog
                    task={editingTask}
                    orgId={orgId}
                    assignees={assignees}
                    isOpen={true}
                    onClose={() => setEditingTask(null)}
                    onSaved={(updatedTask) => {
                        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
                        setEditingTask(null);
                    }}
                />
            )}
        </div>
    );
}

function KanbanColumn({ column, tasks, orgId, assignees, onEdit }: { column: { id: string; title: string; }, tasks: KanbanTask[], orgId: string, assignees: AssigneesData, onEdit: (task: KanbanTask) => void }) {
    const { setNodeRef } = useDroppable({ id: column.id });
    const [isPending, startTransition] = useTransition();
    const [isOpen, setIsOpen] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assigneeType, setAssigneeType] = useState<'none' | 'user' | 'team'>('none');
    const [assignmentId, setAssignmentId] = useState('');
    const [formId, setFormId] = useState<'none' | string>('none');

    const handleCreate = () => {
        if (!title.trim()) return;
        startTransition(async () => {
            const payload: any = { title, description, status: column.id as TaskStatus };
            if (assigneeType === 'user' && assignmentId) payload.assignee_id = assignmentId;
            if (assigneeType === 'team' && assignmentId) payload.team_id = assignmentId;
            if (formId && formId !== 'none') payload.form_id = formId;

            const res = await createTask(orgId, payload);
            if (res?.error) {
                alert(`Error: ${res.error}`);
            } else {
                setTitle('');
                setDescription('');
                setAssigneeType('none');
                setAssignmentId('');
                setFormId('none');
                setIsOpen(false);
            }
        });
    };

    return (
        <div ref={setNodeRef} className="flex flex-col bg-slate-100/50 rounded-xl p-4 min-h-[500px]">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-slate-700 flex items-center">
                    {column.title}
                    <span className="ml-2 bg-slate-200 text-slate-600 text-xs py-0.5 px-2 rounded-full">
                        {tasks.length}
                    </span>
                </h3>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-800">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Task to {column.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
                                <Input id="title" placeholder="E.g. Fix login bug" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" placeholder="Add more details..." value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Assignment Type</Label>
                                    <Select value={assigneeType} onValueChange={(v: any) => { setAssigneeType(v); setAssignmentId(''); }}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Unassigned</SelectItem>
                                            <SelectItem value="user">User</SelectItem>
                                            <SelectItem value="team">Team</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {assigneeType !== 'none' && (
                                    <div className="space-y-2">
                                        <Label>{assigneeType === 'user' ? 'Select User' : 'Select Team'}</Label>
                                        <Select value={assignmentId} onValueChange={setAssignmentId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder={`Choose ${assigneeType}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assigneeType === 'user' && assignees.users.map(u => (
                                                    <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                                ))}
                                                {assigneeType === 'team' && assignees.teams.map(t => (
                                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="space-y-2 col-span-2">
                                    <Label>Attach Form (Optional)</Label>
                                    <Select value={formId} onValueChange={setFormId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="No form assigned" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">No Form</SelectItem>
                                            {assignees.forms?.map(f => (
                                                <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
                            <Button onClick={handleCreate} disabled={!title.trim() || isPending || (assigneeType !== 'none' && !assignmentId)}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Task
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <SortableContext id={column.id} items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="flex-1 space-y-3">
                    {tasks.map(task => (
                        <SortableTaskCard key={task.id} task={task} onEdit={onEdit} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}

function SortableTaskCard({ task, onEdit }: { task: KanbanTask, onEdit: (task: KanbanTask) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id, data: { type: 'Task', task } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <TaskCard task={task} onEdit={onEdit} />
        </div>
    );
}

function TaskCard({ task, isOverlay, onEdit }: { task: KanbanTask; isOverlay?: boolean; onEdit?: (task: KanbanTask) => void }) {
    return (
        <Card className={`cursor-grab active:cursor-grabbing shadow-sm border-slate-200 ${isOverlay ? 'shadow-lg rotate-2 scale-105' : ''}`}>
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <Badge variant={task.status === 'DONE' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold tracking-wider">
                        {task.status.replace('_', ' ')}
                    </Badge>
                    {task.due_date && (
                        <span className="text-xs text-slate-500 font-medium">
                            {format(new Date(task.due_date), 'MMM d')}
                        </span>
                    )}
                </div>

                <div className="group flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-slate-800 text-sm leading-tight flex-1">{task.title}</h4>
                    {!isOverlay && onEdit && (
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors flex-shrink-0 ml-2" onClick={(e) => { e.stopPropagation(); onEdit(task); }}>
                            <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                    )}
                </div>
                {task.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                        {task.description}
                    </p>
                )}

                {task.form && (
                    <div className="flex items-center text-[10px] text-amber-700 bg-amber-50 px-2 py-1 rounded-sm border border-amber-100 font-medium w-fit mb-3">
                        <ClipboardList className="h-3 w-3 mr-1.5" />
                        <span className="truncate max-w-[150px]">{task.form.title}</span>
                    </div>
                )}

                <div className="flex items-center justify-end mt-4 pt-3 border-t border-slate-100">
                    <AssignmentBadge task={task} />
                </div>
            </CardContent>
        </Card>
    );
}

function AssignmentBadge({ task }: { task: KanbanTask }) {
    if (task.assignee) {
        return (
            <div className="flex items-center text-xs font-medium text-slate-600 gap-1.5" title="Assigned User">
                <Avatar className="h-6 w-6 border border-slate-200">
                    <AvatarImage src={task.assignee.avatar_url || ''} />
                    <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                        {task.assignee.first_name?.[0]}{task.assignee.last_name?.[0]}
                    </AvatarFallback>
                </Avatar>
                <span className="truncate max-w-[100px]">{task.assignee.first_name} {task.assignee.last_name}</span>
            </div>
        );
    }

    if (task.team) {
        return (
            <div className="flex items-center text-xs font-medium text-indigo-600 gap-1.5 bg-indigo-50 px-2 py-1 rounded-full border border-indigo-100" title="Assigned Team">
                <Users className="h-3 w-3" />
                <span className="truncate max-w-[100px]">{task.team.name}</span>
            </div>
        );
    }

    return (
        <div className="h-6 w-6 rounded-full bg-slate-100 border border-slate-200 border-dashed flex items-center justify-center" title="Unassigned">
            <span className="text-[10px] text-slate-400">?</span>
        </div>
    );
}

function TaskListView({ tasks, onEdit }: { tasks: KanbanTask[], onEdit: (task: KanbanTask) => void }) {
    return (
        <div className="rounded-md border bg-white">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Assignee / Team</TableHead>
                        <TableHead className="text-right">Created</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                No tasks available.
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map((task) => (
                            <TableRow key={task.id} className="group cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => onEdit(task)}>
                                <TableCell className="font-medium">
                                    {task.title}
                                    {task.description && (
                                        <p className="text-xs text-muted-foreground line-clamp-1">{task.description}</p>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={task.status === 'DONE' ? 'default' : 'secondary'} className="text-[10px] uppercase font-bold tracking-wider">
                                        {task.status.replace('_', ' ')}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <AssignmentBadge task={task} />
                                </TableCell>
                                <TableCell className="text-right text-xs text-muted-foreground">
                                    {format(new Date(task.created_at), 'MMM d, yyyy')}
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function EditTaskDialog({ task, orgId, assignees, isOpen, onClose, onSaved }: { task: KanbanTask, orgId: string, assignees: AssigneesData, isOpen: boolean, onClose: () => void, onSaved: (task: KanbanTask) => void }) {
    const [isPending, startTransition] = useTransition();
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description || '');

    // Convert existing assignment into form state
    const [assigneeType, setAssigneeType] = useState<'none' | 'user' | 'team'>(
        task.assignee_id ? 'user' : (task.team_id ? 'team' : 'none')
    );
    const [assignmentId, setAssignmentId] = useState(task.assignee_id || task.team_id || '');
    const [formId, setFormId] = useState<'none' | string>(task.form_id || 'none');

    const handleSave = () => {
        if (!title.trim()) return;
        startTransition(async () => {
            const payload: any = { title, description };

            // Handle clearing old assignments explicitly if swapped
            if (assigneeType === 'none') {
                payload.assignee_id = null;
                payload.team_id = null;
            } else if (assigneeType === 'user') {
                payload.assignee_id = assignmentId;
                payload.team_id = null;
            } else if (assigneeType === 'team') {
                payload.assignee_id = null;
                payload.team_id = assignmentId;
            }

            payload.form_id = formId === 'none' ? null : formId;

            const res = await updateTask(orgId, task.id, payload);
            if (res?.error) {
                alert(`Error: ${res.error}`);
            } else {
                // Return updated task artificially so the optimistic UI can patch the array
                // Instead of fully reloading from server, we mock the joins
                const updatedTask = { ...task, title, description, assignee_id: payload.assignee_id, team_id: payload.team_id };
                if (payload.assignee_id) {
                    const u = assignees.users.find(u => u.id === payload.assignee_id);
                    if (u) updatedTask.assignee = { first_name: u.name, last_name: '', email: '', avatar_url: null };
                } else updatedTask.assignee = null;

                if (payload.team_id) {
                    const t = assignees.teams.find(t => t.id === payload.team_id);
                    if (t) updatedTask.team = { id: t.id, name: t.name };
                } else updatedTask.team = null;

                if (payload.form_id) {
                    const f = assignees.forms?.find(f => f.id === payload.form_id);
                    if (f) updatedTask.form = { id: f.id, title: f.title };
                } else updatedTask.form = null;

                onSaved(updatedTask);
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-title">Title <span className="text-red-500">*</span></Label>
                        <Input id="edit-title" value={title} onChange={e => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea id="edit-description" className="min-h-[100px]" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Assignment Type</Label>
                            <Select value={assigneeType} onValueChange={(v: any) => { setAssigneeType(v); setAssignmentId(''); }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Unassigned</SelectItem>
                                    <SelectItem value="user">User</SelectItem>
                                    <SelectItem value="team">Team</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {assigneeType !== 'none' && (
                            <div className="space-y-2">
                                <Label>{assigneeType === 'user' ? 'Select User' : 'Select Team'}</Label>
                                <Select value={assignmentId} onValueChange={setAssignmentId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder={`Choose ${assigneeType}`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {assigneeType === 'user' && assignees.users.map(u => (
                                            <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                                        ))}
                                        {assigneeType === 'team' && assignees.teams.map(t => (
                                            <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="space-y-2 col-span-2">
                            <Label>Attach Form (Optional)</Label>
                            <Select value={formId} onValueChange={setFormId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="No form assigned" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Form</SelectItem>
                                    {assignees.forms?.map(f => (
                                        <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!title.trim() || isPending || (assigneeType !== 'none' && !assignmentId)}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
