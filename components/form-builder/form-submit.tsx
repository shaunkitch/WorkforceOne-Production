"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import { FormElementInstance, FormElementsType } from "./types";
import { FormElements } from "./form-elements";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { submitForm } from "./actions";
import { Loader2 } from "lucide-react";

export default function FormSubmitComponent({
    formUrl,
    content,
}: {
    formUrl: string;
    content: FormElementInstance[];
}) {
    const formValues = useRef<Record<string, string>>({});
    const formErrors = useRef<Record<string, boolean>>({});
    const [renderKey, setRenderKey] = useState(new Date().getTime());
    const [submitted, setSubmitted] = useState(false);
    const [pending, startTransition] = useTransition();

    const validateForm: () => boolean = useCallback(() => {
        for (const field of content) {
            const actualValue = formValues.current[field.id] || "";
            const valid = FormElements[field.type].validate(field, actualValue);

            if (!valid) {
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

    const submit = async () => {
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
                <div className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl rounded outline outline-1 outline-border">
                    <h1 className="text-2xl font-bold">Form Submitted</h1>
                    <p className="text-muted-foreground">
                        Thank you for submitting this form, you can close this page now.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center w-full h-full items-center p-8">
            <div key={renderKey} className="max-w-[620px] flex flex-col gap-4 flex-grow bg-background w-full p-8 overflow-y-auto border shadow-xl rounded outline outline-1 outline-border">
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
                    onClick={() => {
                        startTransition(submit);
                    }}
                    disabled={pending}
                >
                    {!pending && <>Submit</>}
                    {pending && <Loader2 className="animate-spin" />}
                </Button>
            </div>
        </div>
    );
}
