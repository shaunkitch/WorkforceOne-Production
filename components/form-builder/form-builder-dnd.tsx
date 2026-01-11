"use client";

import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import Designer from "./designer";
import DragOverlayWrapper from "./drag-overlay-wrapper";
import { useEffect, useState } from "react";
import { useDesigner } from "./hooks/use-designer";
import { useAutoSave } from "./hooks/use-auto-save";
import { FormElements } from "./form-elements";
import { ElementsType } from "./types";

import SaveFormBtn from "./save-form-btn";

export default function FormBuilderDnd({ form }: { form: any }) {
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        },
    });

    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 300,
            tolerance: 5,
        }
    })

    const sensors = useSensors(mouseSensor, touchSensor);

    const { elements, addElement, removeElement, selectedElement, setSelectedElement, setElements } = useDesigner();

    useEffect(() => {
        if (form.content) {
            const parsedElements = typeof form.content === "string"
                ? JSON.parse(form.content)
                : form.content;
            setElements(Array.isArray(parsedElements) ? parsedElements : []);
        }
    }, [form, setElements]);

    const { isSaving } = useAutoSave(form.id, elements);

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={(event) => {
                const { active, over } = event;
                if (!over) return;

                const isDesignerBtnElement = active.data?.current?.isDesignerBtnElement;
                const isDroppingOverDesignerDropArea = over.data?.current?.isDesignerDropArea;

                // Scenario 1: Dropping a sidebar btn over the designer drop area
                if (isDesignerBtnElement && isDroppingOverDesignerDropArea) {
                    const type = active.data?.current?.type as ElementsType;
                    const newElement = FormElements[type].construct(
                        crypto.randomUUID()
                    );

                    addElement(elements.length, newElement);
                    return;
                }

                const isDroppingOverDesignerElement = over.data?.current?.isDesignerElement;

                // Scenario 2: Dropping a sidebar btn over a designer element
                if (isDesignerBtnElement && isDroppingOverDesignerElement) {
                    const type = active.data?.current?.type as ElementsType;
                    const newElement = FormElements[type].construct(
                        crypto.randomUUID()
                    );

                    const overId = over.data?.current?.elementId;
                    const overElementIndex = elements.findIndex((el) => el.id === overId);
                    if (overElementIndex === -1) {
                        throw new Error("element not found");
                    }

                    let indexForNewElement = overElementIndex; // Default to before
                    // Ideally we check if top or bottom half, but for now simple insert
                    // Simple logic: Insert AFTER if over bottom half? 
                    // Since we don't track mouse pos here easily, let's just insert AT index (pushing others down)

                    addElement(indexForNewElement, newElement);
                    return;
                }

                // Scenario 3: Reordering designer elements
                const isDraggingDesignerElement = active.data?.current?.isDesignerElement;
                if (isDraggingDesignerElement && isDroppingOverDesignerElement) {
                    const activeId = active.data?.current?.elementId;
                    const overId = over.data?.current?.elementId;

                    if (activeId !== overId) {
                        const activeElementIndex = elements.findIndex((el) => el.id === activeId);
                        const overElementIndex = elements.findIndex((el) => el.id === overId);

                        // Use arrayMove equivalent
                        const newElements = [...elements];
                        const [removed] = newElements.splice(activeElementIndex, 1);
                        newElements.splice(overElementIndex, 0, removed);
                        setElements(newElements);
                    }
                }
            }}
        >
            <main className="flex flex-col w-full h-screen">
                <nav className="flex justify-between border-b-2 p-4 gap-3 items-center">
                    <h2 className="truncate font-medium">
                        <span className="text-muted-foreground mr-2">Form:</span>
                        {form.title}
                    </h2>
                    <div className="flex items-center gap-2">
                        {isSaving && (
                            <span className="text-sm text-muted-foreground animate-pulse">Saving...</span>
                        )}
                        <SaveFormBtn id={form.id} />
                    </div>
                </nav>
                <div className="flex w-full flex-grow items-center justify-center relative overflow-y-auto h-[200px] bg-accent/30 dark:bg-accent/10 bg-[url(/graph-paper.svg)] dark:bg-[url(/graph-paper-dark.svg)]">
                    <Designer />
                </div>
            </main>
            <DragOverlayWrapper />
        </DndContext>
    );
}
