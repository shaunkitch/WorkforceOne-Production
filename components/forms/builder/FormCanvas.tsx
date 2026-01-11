"use client";

import { useDroppable } from "@dnd-kit/core";
import { useDesigner } from "./DesignerContext";
import { cn } from "@/lib/utils";
import DesignerElementWrapper from "./DesignerElementWrapper";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

export default function FormCanvas() {
    const { elements, selectedElement, setSelectedElement } = useDesigner();

    const droppable = useDroppable({
        id: "designer-drop-area",
        data: {
            isDesignerDropArea: true,
        },
    });

    return (
        <div
            ref={droppable.setNodeRef}
            className={cn(
                "flex-1 h-full bg-accent/20 rounded-xl flex flex-col flex-grow items-center justify-start py-12 px-4 overflow-y-auto w-full",
                droppable.isOver && "ring-2 ring-primary/20 bg-accent/40"
            )}
            onClick={() => {
                if (selectedElement) setSelectedElement(null);
            }}
        >
            {!droppable.isOver && elements.length === 0 && (
                <p className="text-3xl text-muted-foreground flex flex-grow items-center font-bold">
                    Drop fields here
                </p>
            )}

            {elements.length > 0 && (
                <div className="flex flex-col w-full gap-2 p-4 max-w-[900px]">
                    <SortableContext items={elements.map(e => e.id)} strategy={verticalListSortingStrategy}>
                        {elements.map((element) => (
                            <DesignerElementWrapper key={element.id} element={element} />
                        ))}
                    </SortableContext>
                </div>
            )}
        </div>
    );
}
