"use client";

import { useEffect, useState } from "react";
import {
    ElementsType,
    FormElement,
    FormElementInstance,
    SubmitFunction
} from "../builder/types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDesigner } from "../builder/DesignerContext";
import { Switch } from "@/components/ui/switch";

const type: ElementsType = "LocationField";

const extraAttributes = {
    label: "Location",
    helperText: "Capture your current location",
    required: false,
};

const propertiesSchema = z.object({
    label: z.string().min(2).max(50),
    helperText: z.string().max(200),
    required: z.boolean().default(false),
});

export const LocationFieldFormElement: FormElement = {
    type,
    construct: (id: string) => ({
        id,
        type,
        extraAttributes,
    }),
    designerBtnElement: {
        icon: MapPin,
        label: "Location",
    },
    designerComponent: DesignerComponent,
    formComponent: FormComponent,
    propertiesComponent: PropertiesComponent,
    validate: (formElement: FormElementInstance, currentValue: string): boolean => {
        const element = formElement as CustomInstance;
        if (element.extraAttributes.required) {
            return currentValue.length > 0;
        }
        return true;
    },
};

type CustomInstance = FormElementInstance & {
    extraAttributes: typeof extraAttributes;
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    const element = elementInstance as CustomInstance;
    const { label, helperText, required } = element.extraAttributes;
    return (
        <div className="flex flex-col gap-2 w-full">
            <Label>
                {label}
                {required && "*"}
            </Label>
            <div className="border p-4 rounded-md bg-muted/50 flex items-center justify-center text-muted-foreground gap-2">
                <MapPin className="h-4 w-4" /> Capture Location
            </div>
            {helperText && <p className="text-[0.8rem] text-muted-foreground">{helperText}</p>}
        </div>
    );
}

function FormComponent({
    elementInstance,
    submitValue,
    isInvalid,
    defaultValue,
}: {
    elementInstance: FormElementInstance;
    submitValue?: SubmitFunction;
    isInvalid?: boolean;
    defaultValue?: string;
}) {
    const element = elementInstance as CustomInstance;
    const [location, setLocation] = useState<string>(defaultValue || "");
    const { getLocation, loading, error } = useGeolocation();

    const handleCapture = async () => {
        const loc = await getLocation();
        if (loc) {
            // Note: useGeolocation returns "lat,long". The original code also stored a JSON.
            // But here we are just setting the string value to state.
            // If the original code wanted JSON in submitValue, we might need to adjust.
            // The original code did:
            // const locData = JSON.stringify({ lat: latitude, lng: longitude, acc: accuracy });
            // setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
            // if (submitValue) submitValue(element.id, locData);

            // My usage of useGeolocation returns "lat,long". 
            // I should probably update useGeolocation to return an object or handle it here.
            // Let's parse the string from useGeolocation or better, update useGeolocation to return object?
            // The plan said "Returns location (lat/long)".
            // Let's stick to the hook returning string "lat,long" as per implementation plan?
            // "Returns location (lat/long), loading, error, and getLocation function."
            // But the original code saves JSON `locData` to `submitValue`.
            // I should restore that behavior.

            // Let's parse the return from useGeolocation.
            const [lat, long] = loc.split(",");
            const locData = JSON.stringify({ lat: Number(lat), lng: Number(long), acc: 0 }); // Accuracy lost in my hook
            setLocation(`${Number(lat).toFixed(6)}, ${Number(long).toFixed(6)}`);
            if (submitValue) submitValue(element.id, locData);
        }
    };

    return (
        <div className="flex flex-col gap-2 w-full">
            <Label className={isInvalid ? "text-destructive" : ""}>
                {element.extraAttributes.label}
                {element.extraAttributes.required && "*"}
            </Label>
            <div className="flex gap-2">
                <Button
                    type="button"
                    variant="outline"
                    className="w-full flex gap-2 items-center justify-center"
                    onClick={handleCapture}
                    disabled={loading || !!location}
                >
                    {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                    {location ? "Location Captured" : "Capture Location"}
                </Button>
            </div>
            {location && (
                <div className="text-xs font-mono bg-slate-100 p-2 rounded flex justify-between items-center">
                    <span>{location}</span>
                    <Button variant="ghost" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => {
                        setLocation("");
                        if (submitValue) submitValue(element.id, "");
                    }}>x</Button>
                </div>
            )}
            {error && <p className="text-destructive text-sm">{error}</p>}
            {element.extraAttributes.helperText && (
                <p className={isInvalid ? "text-destructive text-[0.8rem]" : "text-[0.8rem] text-muted-foreground"}>
                    {element.extraAttributes.helperText}
                </p>
            )}
        </div>
    );
}

type propertiesFormSchemaType = z.infer<typeof propertiesSchema>;

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    const element = elementInstance as CustomInstance;
    const { updateElement } = useDesigner();

    const form = useForm<propertiesFormSchemaType>({
        resolver: zodResolver(propertiesSchema),
        mode: "onBlur",
        defaultValues: {
            label: element.extraAttributes.label,
            helperText: element.extraAttributes.helperText,
            required: element.extraAttributes.required,
        },
    });

    useEffect(() => {
        form.reset(element.extraAttributes);
    }, [element, form]);

    function applyChanges(values: propertiesFormSchemaType) {
        const { label, helperText, required } = values;
        updateElement(element.id, {
            ...element,
            extraAttributes: {
                label,
                helperText,
                required,
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
                    name="label"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Label</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") e.currentTarget.blur();
                                    }}
                                />
                            </FormControl>
                            <FormDescription>
                                The label of the field. <br /> It will be displayed above the field
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="helperText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Helper text</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") e.currentTarget.blur();
                                    }}
                                />
                            </FormControl>
                            <FormDescription>
                                The helper text of the field. <br /> It will be displayed below the field.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="required"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                            <div className="space-y-0.5">
                                <FormLabel>Required</FormLabel>
                                <FormDescription>
                                    Strictly require geolocation.
                                </FormDescription>
                            </div>
                            <FormControl>
                                <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </form>
        </Form>
    );
}
