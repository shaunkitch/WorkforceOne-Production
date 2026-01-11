"use client";

import DesignerContextProvider from "./designer-context";
import FormBuilderDnd from "./form-builder-dnd";

export default function FormBuilder({ form }: { form: any }) {
    return (
        <DesignerContextProvider>
            <FormBuilderDnd form={form} />
        </DesignerContextProvider>
    );
}
