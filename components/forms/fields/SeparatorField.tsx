"use client";

import { ElementType, FormElementInstance } from "@/types/forms";
import { FormElement } from "../builder/types";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RiSeparator } from "react-icons/ri";

const type: ElementType = "SeparatorField";

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
};

function DesignerComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
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
}) {
    return <Separator />;
}

function PropertiesComponent({ elementInstance }: { elementInstance: FormElementInstance }) {
    return <p>No properties for this element</p>;
}
