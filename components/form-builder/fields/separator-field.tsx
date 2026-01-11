"use client";

import { ElementsType, FormElement, FormElementInstance } from "../types";
import { Label } from "@/components/ui/label";
import { useDesigner } from "../hooks/use-designer";
import { RiSeparator } from "react-icons/ri";
import { Separator } from "@/components/ui/separator";

const type: ElementsType = "SeparatorField";

export const SeparatorFieldFormElement: FormElement = {
    type,
    construct: (id: string) => ({
        id,
        type,
    }),
    designerBtnElement: {
        icon: RiSeparator,
        label: "Separator Field",
    },
    designerComponent: DesignerComponent,
    formComponent: FormComponent,
    propertiesComponent: PropertiesComponent,
    validate: () => true,
};

function DesignerComponent({
    elementInstance,
}: {
    elementInstance: FormElementInstance;
}) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <Label className="text-muted-foreground">Separator field</Label>
            <Separator />
        </div>
    );
}

function FormComponent({
    elementInstance,
}: {
    elementInstance: FormElementInstance;
    submitValue?: (key: string, value: string) => void;
    isInvalid?: boolean;
    defaultValue?: string;
}) {
    return <Separator />;
}

function PropertiesComponent({
    elementInstance,
}: {
    elementInstance: FormElementInstance;
}) {
    return <p className="text-muted-foreground">No properties for this element</p>;
}
