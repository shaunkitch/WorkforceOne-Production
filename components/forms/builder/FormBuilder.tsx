"use client";

import { DndContext, useSensor, useSensors, MouseSensor, TouchSensor, DragOverlay, DragStartEvent, DragEndEvent, useDndMonitor } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { FormElementInstance, ElementType } from "@/types/forms";
import { Database } from "@/types/database";
import DesignerContextProvider, { useDesigner } from "./DesignerContext";
import FormSidebar from "./FormSidebar";
import FormCanvas from "./FormCanvas";
import { SidebarBtnElementDragOverlay } from "./SidebarBtnElement";
import { FormElements } from "./FormElements";
import FieldProperties from "./FieldProperties";

import SaveFormBtn from "./SaveFormBtn";
import PublishFormBtn from "./PublishFormBtn";
import PreviewDialogBtn from "./PreviewDialogBtn";
import ImportPdfDialog from "./ImportPdfDialog";

type Form = Database['public']['Tables']['forms']['Row'];

interface FormBuilderProps {
    form: Form;
}

export default function FormBuilder({ form }: FormBuilderProps) {
    return (
        <DesignerContextProvider>
            <FormBuilderContent form={form} />
        </DesignerContextProvider>
    );
}

function FormBuilderContent({ form }: { form: Form }) {
    const { elements, setElements, addElement, moveElement } = useDesigner();
    const [activeDragElement, setActiveDragElement] = useState<any>(null); // Type this better locally

    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        },
    });

    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 300,
            tolerance: 5,
        },
    });

    const sensors = useSensors(mouseSensor, touchSensor);

    useEffect(() => {
        if (form.content && Array.isArray(form.content)) {
            setElements(form.content as any);
        }
    }, [form, setElements]);

    function onDragStart(event: DragStartEvent) {
        setActiveDragElement(event.active.data.current);
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveDragElement(null);
        const { active, over } = event;
        if (!over) return;

        const isDesignerBtnElement = active.data.current?.isDesignerBtnElement;
        const isDesignerDropArea = over.data.current?.isDesignerDropArea;

        // Dropping a sidebar button over the designer drop area
        if (isDesignerBtnElement && isDesignerDropArea) {
            const type = active.data.current?.type as ElementType;
            const newElement = FormElements[type].construct(crypto.randomUUID());
            addElement(elements.length, newElement);
            return;
        }

        const isDroppingOverDesignerElement = over.data.current?.isDesignerElement;

        // Dropping a sidebar button over an existing element
        if (isDesignerBtnElement && isDroppingOverDesignerElement) {
            const type = active.data.current?.type as ElementType;
            const newElement = FormElements[type].construct(crypto.randomUUID());

            const overId = over.data.current?.elementId;
            const overIndex = elements.findIndex((el) => el.id === overId);

            if (overIndex === -1) {
                throw new Error("Element not found");
            }
            // If dropping on top half, insert before. If bottom, insert after? 
            // Currently getting standard overIndex. Let's insert AFTER for simplicity or check interaction.
            // DesignerElementWrapper has top/bottom halves, but main wrapper is the sortable itself.
            // Let's assume standard insertion at index.

            let indexForNewElement = overIndex;
            // Note: If we rely on detailed collision with top/bottom, allow refined placement. 
            // For now, placing 'at' the index pushes current one down.

            addElement(indexForNewElement, newElement);
            return;
        }

        // Dropping an existing element over another existing element (Reordering)
        const isDraggingDesignerElement = active.data.current?.isDesignerElement;

        if (isDraggingDesignerElement && isDroppingOverDesignerElement) {
            const activeId = active.data.current?.elementId;
            const overId = over.data.current?.elementId;

            const activeIndex = elements.findIndex((el) => el.id === activeId);
            const overIndex = elements.findIndex((el) => el.id === overId);

            if (activeIndex === -1 || overIndex === -1) {
                // throw new Error("Element not found");
                return;
            }

            if (activeIndex !== overIndex) {
                moveElement(activeIndex, overIndex);
            }
        }
    }

    return (
        <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd}>
            <main className="flex flex-col w-full h-screen bg-background text-foreground">
                <nav className="flex justify-between border-b-2 p-4 gap-3 items-center">
                    <h2 className="truncate font-medium">
                        <span className="text-muted-foreground mr-2">Form:</span>
                        {form.title}
                    </h2>
                    <div className="flex items-center gap-2">
                        <ImportPdfDialog />
                        <PreviewDialogBtn />
                        <div className="w-px h-6 bg-border mx-2" /> {/* Separator */}
                        <SaveFormBtn id={form.id} />
                        <PublishFormBtn id={form.id} isPublished={form.is_published} />
                    </div>
                </nav>
                <div className="flex w-full h-full overflow-hidden">
                    <div className="flex-1 w-full h-full flex items-center justify-center bg-accent/20 relative overflow-y-auto">
                        <FormCanvas />
                    </div>
                    {/* Sidebar / Properties */}
                    <div className="w-[400px] max-w-[400px] border-l bg-background">
                        <SidebarWrapper />
                    </div>
                </div>
            </main>
            <DragOverlay>
                {activeDragElement && activeDragElement.isDesignerBtnElement && (
                    <SidebarBtnElementDragOverlay formElement={FormElements[activeDragElement.type as ElementType]} />
                )}
            </DragOverlay>
        </DndContext>
    );
}

function SidebarWrapper() {
    const { selectedElement } = useDesigner();
    if (selectedElement) return <FieldProperties />;
    return <FormSidebar />;
}
