"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { deleteForm } from "@/lib/actions/forms";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage({
    params,
}: {
    params: { orgId: string, formId: string };
}) {
    const { toast } = useToast();
    const router = useRouter();
    const [loading, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            try {
                const result = await deleteForm(params.formId);

                if (!result.success) {
                    toast({
                        title: "Error",
                        description: result.error || "Failed to delete form",
                        variant: "destructive"
                    });
                    return;
                }

                toast({ title: "Deleted", description: "Form deleted successfully." });
                router.push(`/dashboard/${params.orgId}`);
            } catch (error: any) {
                toast({
                    title: "Error",
                    description: error.message || "Failed to delete form",
                    variant: "destructive"
                });
            }
        });
    };

    return (
        <div className="py-4 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Settings</h2>

            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="text-red-600 flex items-center gap-2">
                        <Trash2 className="h-5 w-5" />
                        Danger Zone
                    </CardTitle>
                    <CardDescription>
                        Destructive actions for this form.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm">
                        Deleting a form will also delete all its submissions. This action cannot be undone.
                    </p>
                </CardContent>
                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={loading}>
                                {loading ? "Deleting..." : "Delete Form"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the form and all its collected data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleDelete}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    );
}
