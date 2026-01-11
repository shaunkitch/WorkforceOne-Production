"use client";

import DesignerSidebar from "./designer-sidebar";
import { DragEndEvent, useDndMonitor, useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useDesigner } from "./hooks/use-designer";
import { FormElements } from "./form-elements";
import { useState } from "react";
import { FormElementInstance } from "./types";
import { Button } from "@/components/ui/button";
import { BiSolidTrash } from "react-icons/bi";

export default function Designer() {
    const { elements, addElement, selectedElement, setSelectedElement, removeElement } = useDesigner();
    const droppable = useDroppable({
        id: "designer-drop-area",
        data: {
            isDesignerDropArea: true,
        },
    });

    return (
        <div className="flex w-full h-full">
            <div
                className="p-4 w-full"
                onClick={() => {
                    if (selectedElement) setSelectedElement(null);
                }}
            >
                <div
                    ref={droppable.setNodeRef}
                    className={cn("bg-background max-w-[920px] h-full m-auto rounded-xl flex flex-col flex-grow items-center justify-start flex-1 overflow-y-auto",
                        droppable.isOver && "ring-2 ring-primary ring-inset"
                    )}
                >
                    {!droppable.isOver && elements.length === 0 && (
                        <p className="text-3xl text-muted-foreground flex flex-grow items-center font-bold">
                            Drop here
                        </p>
                    )}
                    {droppable.isOver && elements.length === 0 && (
                        <div className="p-4 w-full">
                            <div className="h-[120px] rounded-md bg-primary/20"></div>
                        </div>
                    )}
                    {elements.length > 0 && (
                        <div className="flex flex-col text-background w-full gap-2 p-4">
                            <SortableContext items={elements} strategy={verticalListSortingStrategy}>
                                {elements.map((element) => (
                                    <DesignerElementWrapper key={element.id} element={element} />
                                ))}
                            </SortableContext>
                        </div>
                    )}
                </div>
            </div>
            <DesignerSidebar />
        </div>
    );
}

function DesignerElementWrapper({ element }: { element: FormElementInstance }) {
    const { removeElement, selectedElement, setSelectedElement } = useDesigner();
    const [mouseIsOver, setMouseIsOver] = useState<boolean>(false);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: element.id,
        data: {
            type: element.type,
            elementId: element.id,
            isDesignerElement: true,
        },
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
    };

    const DesignerElement = FormElements[element.type].designerComponent;

    // If dragging, show placeholder logic handled by DragOverlay, but here we can hide or dim
    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="opacity-30 h-[120px] flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset"
            >
                {/* Placeholder content if needed, but opacity handles it */}
            </div>
        )
    }

    return (
        <div
            ref={setNodeRef}
            {...attributes}
            {...listeners}
            style={style}
            className="relative h-[120px] flex flex-col text-foreground hover:cursor-pointer rounded-md ring-1 ring-accent ring-inset"
            onMouseEnter={() => {
                setMouseIsOver(true);
            }}
            onMouseLeave={() => {
                setMouseIsOver(false);
            }}
            onClick={(e) => {
                e.stopPropagation();
                setSelectedElement(element);
            }}
        >
            <div ref={null} className="absolute w-full h-1/2 top-0" />
            <div ref={null} className="absolute w-full h-1/2 bottom-0" />
            {mouseIsOver && (
                <>
                    <div className="absolute right-0 h-full z-10">
                        <Button
                            className="flex justify-center h-full border rounded-md rounded-l-none bg-red-500"
                            variant={"outline"}
                            onClick={(e) => {
                                e.stopPropagation(); // Avoid selecting element
                                removeElement(element.id);
                            }}
                        >
                            <BiSolidTrash className="h-6 w-6" />
                        </Button>
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse">
                        <p className="text-muted-foreground text-sm">Click for properties or drag to move</p>
                    </div>
                </>
            )}

            <div
                className={cn(
                    "flex w-full h-[120px] items-center rounded-md bg-accent/40 px-4 py-2 pointer-events-none opacity-100",
                    mouseIsOver && "opacity-30"
                )}
            >
                <DesignerElement elementInstance={element} />
            </div>
        </div>
    );
}
