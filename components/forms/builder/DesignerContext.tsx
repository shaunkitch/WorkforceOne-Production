"use client";

import { FormElementInstance } from "@/types/forms";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

type DesignerContextType = {
    elements: FormElementInstance[];
    setElements: Dispatch<SetStateAction<FormElementInstance[]>>;
    addElement: (index: number, element: FormElementInstance) => void;
    removeElement: (id: string) => void;
    selectedElement: FormElementInstance | null;
    setSelectedElement: Dispatch<SetStateAction<FormElementInstance | null>>;
    updateElement: (id: string, element: FormElementInstance) => void;
    moveElement: (activeIndex: number, overIndex: number) => void;
};

export const DesignerContext = createContext<DesignerContextType | null>(null);

export default function DesignerContextProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [elements, setElements] = useState<FormElementInstance[]>([]);
    const [selectedElement, setSelectedElement] = useState<FormElementInstance | null>(null);

    const addElement = (index: number, element: FormElementInstance) => {
        setElements((prev) => {
            const newElements = [...prev];
            newElements.splice(index, 0, element);
            return newElements;
        });
    };

    const removeElement = (id: string) => {
        setElements((prev) => prev.filter((element) => element.id !== id));
    };

    const updateElement = (id: string, element: FormElementInstance) => {
        setElements((prev) => {
            const newElements = [...prev];
            const index = newElements.findIndex((el) => el.id === id);
            newElements[index] = element;
            return newElements;
        });
    };

    const moveElement = (activeIndex: number, overIndex: number) => {
        setElements((prev) => {
            const newElements = [...prev];
            const [removed] = newElements.splice(activeIndex, 1);
            newElements.splice(overIndex, 0, removed);
            return newElements;
        });
    };

    return (
        <DesignerContext.Provider
            value={{
                elements,
                setElements,
                addElement,
                removeElement,
                selectedElement,
                setSelectedElement,
                updateElement,
                moveElement,
            }}
        >
            {children}
        </DesignerContext.Provider>
    );
}

export const useDesigner = () => {
    const context = useContext(DesignerContext);

    if (!context) {
        throw new Error("useDesigner must be used within a DesignerContextProvider");
    }

    return context;
};
