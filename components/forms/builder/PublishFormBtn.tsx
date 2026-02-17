"use client";

import { publishForm } from "@/lib/actions/forms";
import { Button } from "@/components/ui/button";
import { BookMarked, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTransition } from "react";
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

export default function PublishFormBtn({ id, isPublished }: { id: string, isPublished: boolean }) {
    const { toast } = useToast();
    const [loading, startTransition] = useTransition();

    const publish = async () => {
        try {
            const result = await publishForm(id);

            if (!result.success) {
                toast({
                    title: "Error",
                    description: result.error || "Something went wrong",
                    variant: "destructive",
                });
                return;
            }

            toast({
                title: "Success",
                description: "Your form is now available to the public",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        }
    };

    if (isPublished) {
        return (
            <div className="flex gap-2 items-center">
                <Button variant={"outline"} onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/submit/${id}`);
                    toast({
                        title: "Copied!",
                        description: "Link copied to clipboard",
                    });
                }}>
                    <BookMarked className="h-4 w-4 mr-2" />
                    Share Link
                </Button>
            </div>
        )
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button className="gap-2 text-white bg-gradient-to-r from-indigo-400 to-cyan-400">
                    <BookMarked className="h-4 w-4" />
                    Publish
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. After publishing you will not be able to edit this form.
                        <br />
                        <br />
                        <span className="font-medium">
                            By publishing this form you will make it available to the public and you will be able to collect submissions.
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault();
                            startTransition(publish);
                        }}
                    >
                        Proceed {loading && <Loader2 className="animate-spin h-4 w-4 ml-2" />}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
