"use client";

import { useDesigner } from "./hooks/use-designer";
import { FormElements } from "./form-elements";
import SidebarBtnElement from "./sidebar-btn-element";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AiOutlineClose } from "react-icons/ai";

export default function DesignerSidebar() {
    const { selectedElement } = useDesigner();

    return (
        <aside className="w-[400px] max-w-[400px] flex flex-col flex-grow gap-2 border-l-2 border-muted p-4 bg-background overflow-y-auto h-full">
            {!selectedElement && <FormElementsSidebar />}
            {selectedElement && <PropertiesFormSidebar />}
        </aside>
    );
}

function FormElementsSidebar() {
    return (
        <div>
            <p className="text-sm text-foreground/70 mb-2 font-medium">Drag and drop elements</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 place-items-center">
                <SidebarBtnElement formElement={FormElements.TextField} />
                <SidebarBtnElement formElement={FormElements.TitleField} />
                <SidebarBtnElement formElement={FormElements.SubTitleField} />
                <SidebarBtnElement formElement={FormElements.ParagraphField} />
                <SidebarBtnElement formElement={FormElements.SeparatorField} />
                <SidebarBtnElement formElement={FormElements.SpacerField} />
                <SidebarBtnElement formElement={FormElements.NumberField} />
                <SidebarBtnElement formElement={FormElements.TextAreaField} />
                <SidebarBtnElement formElement={FormElements.DateField} />
                <SidebarBtnElement formElement={FormElements.SelectField} />
                <SidebarBtnElement formElement={FormElements.CheckboxField} />
                <SidebarBtnElement formElement={FormElements.LicenseField} />
                <SidebarBtnElement formElement={FormElements.QRCodeField} />
            </div>
        </div>
    )
}

function PropertiesFormSidebar() {
    const { selectedElement, setSelectedElement } = useDesigner();

    if (!selectedElement) return null;

    const PropertiesComponent = FormElements[selectedElement.type].propertiesComponent;

    return (
        <div className="flex flex-col p-2">
            <div className="flex justify-between items-center">
                <p className="text-sm text-foreground/70 mb-2 font-medium">Element Properties</p>
                <Button
                    variant={"ghost"}
                    size={"icon"}
                    onClick={() => {
                        setSelectedElement(null);
                    }}
                >
                    <AiOutlineClose />
                </Button>
            </div>
            <Separator className="mb-4" />
            <PropertiesComponent elementInstance={selectedElement} />
        </div>
    )
}
