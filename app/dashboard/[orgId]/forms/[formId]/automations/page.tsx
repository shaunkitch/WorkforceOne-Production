"use client";

import { useTransition, useState, useEffect } from "react";
import { createAutomation, deleteAutomation, getAutomations } from "@/lib/actions/automations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Zap } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

import { getForm } from "@/lib/actions/forms"; // Import getForm

export default function AutomationsPage({ params }: { params: { orgId: string, formId: string } }) {
    const [automations, setAutomations] = useState<any[]>([]);
    const [formFields, setFormFields] = useState<any[]>([]); // Store fields
    const [loading, startTransition] = useTransition();

    const refresh = () => {
        startTransition(async () => {
            // Parallel fetch
            const [autos, form] = await Promise.all([
                getAutomations(params.formId),
                getForm(params.formId)
            ]);
            setAutomations(autos);
            // Parse form content to get fields. Content is JSON array.
            if (form && Array.isArray(form.content)) {
                setFormFields(form.content);
            }
        });
    };

    useEffect(() => {
        refresh();
    }, [params.formId]);

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure?")) return;
        startTransition(async () => {
            try {
                await deleteAutomation(id, params.formId, params.orgId);
                toast({ title: "Deleted", description: "Automation removed." });
                refresh();
            } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" });
            }
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="h-6 w-6 text-yellow-500" />
                    Workflow Automations
                </h2>
                <CreateAutomationDialog
                    orgId={params.orgId}
                    formId={params.formId}
                    formFields={formFields} // Pass fields
                    onSuccess={refresh}
                />
            </div>
            {/* Same list rendering... */}
            <div className="grid gap-4">
                {automations.map(auto => (
                    <Card key={auto.id}>
                        <CardHeader className="flex flex-row items-start justify-between space-y-0">
                            <div>
                                <CardTitle className="text-lg">{auto.name}</CardTitle>
                                <CardDescription>Trigger: {auto.trigger_type}</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(auto.id)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="text-sm space-y-1">
                                <div>
                                    <strong>Conditions:</strong>
                                    {auto.conditions.length === 0 ? " Always run" : (
                                        <ul className="list-disc pl-5 mt-1 text-muted-foreground">
                                            {auto.conditions.map((c: any, i: number) => (
                                                <li key={i}>
                                                    Field "{c.fieldId}" {c.operator} "{c.value}"
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                                <p><strong>Action:</strong> Send Email to {auto.actions[0]?.to}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {automations.length === 0 && (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        No automations set up yet. Create one to automate your workflow.
                    </div>
                )}
            </div>
        </div>
    );
}

function CreateAutomationDialog({ orgId, formId, formFields, onSuccess }: { orgId: string, formId: string, formFields: any[], onSuccess: () => void }) {
    const [open, setOpen] = useState(false);
    const [loading, startTransition] = useTransition();

    const [name, setName] = useState("");
    const [emailTarget, setEmailTarget] = useState("");

    // Condition State
    const [useCondition, setUseCondition] = useState(false);
    const [selectedField, setSelectedField] = useState("");
    const [operator, setOperator] = useState("equals");
    const [conditionValue, setConditionValue] = useState("");

    const handleCreate = () => {
        if (!name || !emailTarget) return;

        startTransition(async () => {
            try {
                const conditions: any[] = [];

                if (useCondition && selectedField) {
                    // Find label for better UX? For now store ID.
                    // Ideally store ID, match against submission data keys.
                    conditions.push({
                        fieldId: selectedField,
                        operator: operator,
                        value: conditionValue
                    });
                }

                const actions = [
                    {
                        type: "email",
                        to: emailTarget,
                        subject: "New Form Submission Notification",
                        body: "A new form has been submitted."
                    }
                ];

                await createAutomation(formId, orgId, {
                    name,
                    conditions,
                    actions
                });

                toast({ title: "Success", description: "Automation created." });
                setOpen(false);
                setName("");
                setEmailTarget("");
                setUseCondition(false);
                setSelectedField("");
                setConditionValue("");
                onSuccess();
            } catch (e: any) {
                toast({ title: "Error", description: e.message, variant: "destructive" });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Add Automation</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Create Automation</DialogTitle>
                    <DialogDescription>
                        Define rules to automate actions based on form submissions.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Automation Name</Label>
                        <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Urgent Alert" />
                    </div>

                    {/* Condition Builder */}
                    <div className="space-y-2 border p-4 rounded-md bg-muted/20">
                        <div className="flex items-center justify-between">
                            <Label className="font-semibold">Conditions</Label>
                            <Button variant="ghost" size="sm" onClick={() => setUseCondition(!useCondition)}>
                                {useCondition ? "Remove Condition" : "Add Condition"}
                            </Button>
                        </div>

                        {useCondition ? (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                <div className="col-span-1">
                                    <Select value={selectedField} onValueChange={setSelectedField}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Field" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {formFields.map(f => (
                                                <SelectItem key={f.id} value={f.id}>{f.label || f.id}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-1">
                                    <Select value={operator} onValueChange={setOperator}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="equals">Equals</SelectItem>
                                            <SelectItem value="not_equals">Does not equal</SelectItem>
                                            <SelectItem value="contains">Contains</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="col-span-1">
                                    <Input
                                        value={conditionValue}
                                        onChange={e => setConditionValue(e.target.value)}
                                        placeholder="Value"
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground italic">Try adding a condition like "Status equals Urgent"</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label>Then Call Action</Label>
                        <div className="flex gap-2 items-center border p-3 rounded bg-green-50/10 border-green-200/20">
                            <span className="text-sm font-mono text-green-400">SEND EMAIL</span>
                            <span className="text-sm text-muted-foreground">TO:</span>
                            <Input
                                className="h-8 flex-1"
                                value={emailTarget}
                                onChange={e => setEmailTarget(e.target.value)}
                                placeholder="recipient@example.com"
                            />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} disabled={loading}>Create Automation</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
