"use client";

import { FormElements } from "./FormElements";
import SidebarBtnElement from "./SidebarBtnElement";
import { Separator } from "@/components/ui/separator";

export default function FormSidebar() {
    return (
        <aside className="w-[400px] max-w-[400px] flex flex-col flex-grow gap-2 border-l-2 border-muted p-4 bg-background overflow-y-auto h-full">
            <div className="p-4 text-xl font-bold">Files</div>
            <Separator className="my-2" />
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
            </div>

            <div className="p-4 text-xl font-bold">Workforce Essentials</div>
            <Separator className="my-2" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 place-items-center pb-4">
                <SidebarBtnElement formElement={FormElements.SignatureField} />
                <SidebarBtnElement formElement={FormElements.LocationField} />
                <SidebarBtnElement formElement={FormElements.ImageUploadField} />
                <SidebarBtnElement formElement={FormElements.BarcodeField} />
            </div>
        </aside>
    );
}
