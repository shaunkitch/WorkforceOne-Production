"use client";

import { updateForm } from "@/lib/actions/forms";
import { useDesigner } from "./DesignerContext";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useTransition } from "react";

export default function SaveFormBtn({ id }: { id: string }) {
    const { elements } = useDesigner();
    const { toast } = useToast();
    const [loading, startTransition] = useTransition();

    const updateFormContent = async () => {
        try {
            const jsonContent = JSON.parse(JSON.stringify(elements)); // Ensure serializable
            const result = await updateForm(id, { content: jsonContent });

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
                description: "Your form has been saved",
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        }
    };

    return (
        <Button
            variant={"outline"}
            className="gap-2"
            disabled={loading}
            onClick={() => {
                startTransition(updateFormContent);
            }}
        >
            <Save className="h-4 w-4" />
            Save
            {loading && <Loader2 className="animate-spin h-4 w-4" />}
        </Button>
    );
}
