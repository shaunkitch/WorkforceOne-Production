"use client";

import React, { useCallback, useRef, useState, useTransition } from "react";
import { FormElementInstance } from "@/types/forms";
import { FormElement } from "./builder/types";
import { FormElements } from "./builder/FormElements";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { submitForm } from "@/lib/actions/forms";

export default function FormSubmitComponent({
    formUrl,
    content,
}: {
    formUrl: string;
    content: FormElementInstance[];
    preview?: boolean;
}) {
    const formValues = useRef<{ [key: string]: string }>({});
    const formErrors = useRef<{ [key: string]: boolean }>({});
    const [renderKey, setRenderKey] = useState(new Date().getTime());
    const [submitted, setSubmitted] = useState(false);
    const [pending, startTransition] = useTransition();

    const validateForm: () => boolean = useCallback(() => {
        for (const field of content) {
            const actualValue = formValues.current[field.id] || "";
            const valid = FormElements[field.type].validate?.(field, actualValue);

            if (valid === false) {
                formErrors.current[field.id] = true;
            }
        }

        if (Object.keys(formErrors.current).length > 0) {
            return false;
        }

        return true;
    }, [content]);

    const submitValue = useCallback((key: string, value: string) => {
        formValues.current[key] = value;
    }, []);

    const submitFormHandler = async () => {
        formErrors.current = {};
        const validForm = validateForm();
        if (!validForm) {
            setRenderKey(new Date().getTime());
            toast({
                title: "Error",
                description: "Please check the form for errors",
                variant: "destructive",
            });
            return;
        }

        if (preview) {
            toast({
                title: "Preview Mode",
                description: "Form is valid! Submission is disabled in preview.",
            });
            return;
        }

        try {
            const jsonContent = JSON.stringify(formValues.current);
            await submitForm(formUrl, jsonContent);
            setSubmitted(true);
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        }
    };

    if (submitted) {
        return (
            <div className="flex justify-center w-full h-full items-center p-8">
                <div className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl rounded shadow-blue-700/20">
                    <h1 className="text-2xl font-bold">Form submitted</h1>
                    <p className="text-muted-foreground">Thank you for submitting the form, you can close this page now.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full h-full items-center p-8">
            <div
                key={renderKey}
                className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl rounded shadow-blue-700/20"
            >
                {content.map((element) => {
                    const FormElement = FormElements[element.type].formComponent;
                    return (
                        <FormElement
                            key={element.id}
                            elementInstance={element}
                            submitValue={submitValue}
                            isInvalid={formErrors.current[element.id]}
                            defaultValue={formValues.current[element.id]}
                        />
                    );
                })}
                <Button
                    className="mt-8"
                    onClick={() => startTransition(submitFormHandler)}
                    disabled={pending}
                >
                    {!pending && <>Submit</>}
                    {pending && <Loader2 className="animate-spin" />}
                </Button>
            </div>
        </div>
    );
}
