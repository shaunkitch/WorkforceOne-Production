"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Sparkles, Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { generateFormFromPdf } from "@/lib/actions/ai";
import { useDesigner } from "./DesignerContext";

export default function ImportPdfDialog() {
    const [open, setOpen] = useState(false);
    const [loading, startTransition] = useTransition();
    const { setElements } = useDesigner();
    const { toast } = useToast();

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Verify PDF
        if (file.type !== "application/pdf") {
            toast({ title: "Invalid File", description: "Please upload a PDF file.", variant: "destructive" });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        startTransition(async () => {
            try {
                const elements = await generateFormFromPdf(formData);
                setElements(elements); // Replace current canvas? Or append? 
                // "Build a form as close as possible" implies replacement or full creation.
                // Let's replace for now, or maybe prompt?
                // setElements will replace.

                toast({
                    title: "Form Generated!",
                    description: "AI has successfully built your form from the PDF."
                });
                setOpen(false);
            } catch (error: any) {
                toast({
                    title: "Generation Failed",
                    description: error.message || "Something went wrong.",
                    variant: "destructive"
                });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border-emerald-200 text-emerald-700">
                    <Sparkles className="h-4 w-4 text-emerald-600" />
                    AI Import
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-500" />
                        AI PDF Import
                    </DialogTitle>
                    <DialogDescription>
                        Upload a PDF form, and our AI will attempt to recreate it for you automatically.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid w-full max-w-sm items-center gap-1.5 py-4">
                    <Label htmlFor="pdf-upload">Upload PDF</Label>
                    <div className="flex items-center gap-2">
                        <Input
                            id="pdf-upload"
                            type="file"
                            accept=".pdf"
                            onChange={handleUpload}
                            disabled={loading}
                        />
                    </div>
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2 animate-pulse">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Analyzing document structure... This may take a minute.
                        </div>
                    )}
                </div>

                <DialogFooter className="sm:justify-start">
                    <p className="text-[0.8rem] text-muted-foreground">
                        Note: AI generation is experimental. Please review the generate form for accuracy.
                    </p>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
