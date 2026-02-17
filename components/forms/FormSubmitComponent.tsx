"use client";

import React from "react";
import { FormElementInstance } from "@/types/forms";
import { FormElements } from "./builder/FormElements";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { submitForm } from "@/lib/actions/forms";
import { useFormSubmission } from "@/hooks/use-form-submission";

export default function FormSubmitComponent({
    formUrl,
    content,
    preview,
}: {
    formUrl: string;
    content: FormElementInstance[];
    preview?: boolean;
}) {
    const {
        submitValue,
        handleSubmit,
        isSubmitting,
        isSubmitted,
        errors,
        renderKey,
    } = useFormSubmission({
        content,
        createSubmission: async (json) => {
            const result = await submitForm(formUrl, json);
            return result;
        },
        preview,
    });

    if (isSubmitted) {
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
                            isInvalid={errors[element.id]}
                            defaultValue={element.extraAttributes?.defaultValue}
                        />
                    );
                })}
                <Button
                    className="mt-8"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                >
                    {!isSubmitting && <>Submit</>}
                    {isSubmitting && <Loader2 className="animate-spin" />}
                </Button>
            </div>
        </div>
    );
}
