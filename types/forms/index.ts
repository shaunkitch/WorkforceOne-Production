export type ElementType =
    | "TextField"
    | "TitleField"
    | "SubTitleField"
    | "ParagraphField"
    | "SeparatorField"
    | "SpacerField"
    | "NumberField"
    | "TextAreaField"
    | "DateField"
    | "SelectField"
    | "CheckboxField"
    | "SignatureField"
    | "LocationField"
    | "ImageUploadField"
    | "BarcodeField";

export type FormElement = {
    id: string;
    type: ElementType;
    extraAttributes?: Record<string, any>;
};

export type FormElementInstance = {
    id: string;
    type: ElementType;
    extraAttributes?: Record<string, any>;
};
