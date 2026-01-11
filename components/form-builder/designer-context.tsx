"use client";

import { createContext, Dispatch, SetStateAction, useState, ReactNode } from "react";
import { FormElementInstance, DesignerContextType } from "./types";

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
            const newElements = [...(prev || [])];
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
    }

    return (
        <DesignerContext.Provider
            value={{
                elements,
                setElements,
                addElement,
                removeElement,
                selectedElement,
                setSelectedElement,
                updateElement
            }}
        >
            {children}
        </DesignerContext.Provider>
    );
}
