"use client";

import { ElementType, FormElementInstance } from "@/types/forms";
import { FormElement } from "../builder/types";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useDesigner } from "../builder/DesignerContext";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { SeparatorHorizontal } from "lucide-react";

const type: ElementType = "SpacerField";

const extraAttributes = {
    height: 20, // px
};

const propertiesSchema = z.object({
    height: z.number().min(5).max(200),
});

export const SpacerFieldFormElement: FormElement = {
    type,
    construct: (id: string) => ({
        id,
        type,
        extraAttributes,
    }),
    designerBtnElement: {
        icon: SeparatorHorizontal,
        label: "Spacer Field",
    },
    designerComponent: DesignerComponent,
    formComponent: FormComponent,
    propertiesComponent: PropertiesComponent,
};

type CustomInstance = FormElementInstance & {
    extraAttributes: typeof extraAttributes;
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    const element = elementInstance as CustomInstance;
    const { height } = element.extraAttributes;

    return (
        <div className="flex flex-col gap-2 w-full items-center">
            <Label className="text-muted-foreground">Spacer field: {height}px</Label>
            <SeparatorHorizontal className="h-8 w-8" />
        </div>
    );
}

function FormComponent({
    elementInstance,
}: {
    elementInstance: FormElementInstance;
}) {
    const element = elementInstance as CustomInstance;
    const { height } = element.extraAttributes;

    return <div style={{ height: height, width: "100%" }}></div>;
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    const element = elementInstance as CustomInstance;
    const { updateElement } = useDesigner();

    const form = useForm<z.infer<typeof propertiesSchema>>({
        resolver: zodResolver(propertiesSchema) as any,
        mode: "onBlur",
        defaultValues: {
            height: element.extraAttributes.height,
        },
    });

    useEffect(() => {
        form.reset(element.extraAttributes);
    }, [element, form]);

    function applyChanges(values: z.infer<typeof propertiesSchema>) {
        const { height } = values;
        updateElement(element.id, {
            ...element,
            extraAttributes: {
                height,
            },
        });
    }

    return (
        <Form {...form}>
            <form
                onBlur={form.handleSubmit(applyChanges)}
                onSubmit={(e) => {
                    e.preventDefault();
                }}
                className="space-y-3"
            >
                <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Height (px): {form.watch("height")}</FormLabel>
                            <FormControl className="pt-2">
                                <Slider
                                    defaultValue={[field.value]}
                                    min={5}
                                    max={200}
                                    step={1}
                                    onValueChange={(value) => {
                                        field.onChange(value[0]);
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}
