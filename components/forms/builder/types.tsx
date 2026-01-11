import { ElementType, FormElementInstance } from "@/types/forms";
import { LucideIcon } from "lucide-react";
import React from "react";

export type FormElement = {
    type: ElementType;
    construct: (id: string) => FormElementInstance;
    designerBtnElement: {
        icon: React.ElementType;
        label: string;
    };
    designerComponent: React.FC<{
        elementInstance: FormElementInstance;
    }>;
    formComponent: React.FC<{
        elementInstance: FormElementInstance;
        submitValue?: (key: string, value: string) => void;
        isInvalid?: boolean;
        defaultValue?: string;
    }>;
    propertiesComponent: React.FC<{
        elementInstance: FormElementInstance;
    }>;
    validate?: (formElement: FormElementInstance, currentValue: string) => boolean;
};
