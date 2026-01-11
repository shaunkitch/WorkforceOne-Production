"use client";

import { useDesigner } from "./DesignerContext";
import { FormElements } from "./FormElements";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function FieldProperties() {
    const { selectedElement, setSelectedElement } = useDesigner();

    if (!selectedElement) return null;

    const PropertiesComponent = FormElements[selectedElement.type].propertiesComponent;

    return (
        <div className="flex flex-col p-2 bg-background border-l-2 border-muted h-full w-[400px]">
            <div className="flex justify-between items-center p-2">
                <p className="text-sm text-foreground/70">Element Properties</p>
                <Button
                    size={"icon"}
                    variant={"ghost"}
                    onClick={() => setSelectedElement(null)}
                >
                    <X />
                </Button>
            </div>
            <Separator className="mb-4" />
            <PropertiesComponent elementInstance={selectedElement} />
        </div>
    );
}
