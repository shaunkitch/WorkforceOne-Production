"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormElementInstance } from "@/types/forms";
import { FormElements } from "./FormElements";
import { useDesigner } from "./DesignerContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DesignerElementWrapperProps {
    element: FormElementInstance;
}

export default function DesignerElementWrapper({ element }: DesignerElementWrapperProps) {
    const { removeElement, selectedElement, setSelectedElement } = useDesigner();

    const topHalf = useSortable({
        id: element.id + "-top",
        data: {
            type: element.type,
            elementId: element.id,
            isDesignerElement: true,
        },
    });

    const bottomHalf = useSortable({
        id: element.id + "-bottom",
        data: {
            type: element.type,
            elementId: element.id,
            isDesignerElement: true,
        },
    });

    const draggable = useSortable({
        id: element.id,
        data: {
            type: element.type,
            elementId: element.id,
            isDesignerElement: true,
        },
    });

    const styles = {
        transform: CSS.Translate.toString(draggable.transform),
        transition: draggable.transition,
    };

    const DesignerElement = FormElements[element.type].designerComponent;

    return (
        <div
            ref={draggable.setNodeRef}
            style={styles}
            {...draggable.listeners}
            {...draggable.attributes}
            className={cn(
                "relative h-[120px] flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset",
                selectedElement?.id === element.id && "ring-2 ring-primary"
            )}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(element);
            }}
        >
            <div ref={topHalf.setNodeRef} className="absolute w-full h-1/2 top-0 rounded-t-md" />
            <div ref={bottomHalf.setNodeRef} className="absolute w-full h-1/2 bottom-0 rounded-b-md" />

            {/* Overlay for hovering/deleting */}
            {selectedElement?.id === element.id && (<div className="absolute right-0 h-full">
                <Button
                    variant={"destructive"}
                    className="h-full rounded-r-md rounded-l-none"
                    onClick={(e) => {
                        e.stopPropagation();
                        removeElement(element.id);
                    }}
                >
                    <Trash2 className="h-6 w-6" />
                </Button>
            </div>
            )}

            <div className="flex w-full h-full items-center px-4 pointer-events-none opacity-100">
                <DesignerElement elementInstance={element} />
            </div>
        </div>
    );
}
