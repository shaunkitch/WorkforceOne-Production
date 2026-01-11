import { ElementType } from "@/types/forms";
import { TextFieldFormElement } from "../fields/TextField";
import { TitleFieldFormElement } from "../fields/TitleField";
import { SubTitleFieldFormElement } from "../fields/SubTitleField";
import { ParagraphFieldFormElement } from "../fields/ParagraphField";
import { SeparatorFieldFormElement } from "../fields/SeparatorField";
import { SpacerFieldFormElement } from "../fields/SpacerField";
import { NumberFieldFormElement } from "../fields/NumberField";
import { TextAreaFieldFormElement } from "../fields/TextAreaField";
import { DateFieldFormElement } from "../fields/DateField";
import { SelectFieldFormElement } from "../fields/SelectField";
import { CheckboxFieldFormElement } from "../fields/CheckboxField";
import { SignatureFieldFormElement } from "../fields/SignatureField";
import { LocationFieldFormElement } from "../fields/LocationField";
import { ImageUploadFieldFormElement } from "../fields/ImageUploadField";
import { BarcodeFieldFormElement } from "../fields/BarcodeField";
import { FormElement } from "./types";

type FormElementsType = {
    [key in ElementType]: FormElement;
};

export const FormElements: FormElementsType = {
    TextField: TextFieldFormElement,
    TitleField: TitleFieldFormElement,
    SubTitleField: SubTitleFieldFormElement,
    ParagraphField: ParagraphFieldFormElement,
    SeparatorField: SeparatorFieldFormElement,
    SpacerField: SpacerFieldFormElement,
    NumberField: NumberFieldFormElement,
    TextAreaField: TextAreaFieldFormElement,
    DateField: DateFieldFormElement,
    SelectField: SelectFieldFormElement,
    CheckboxField: CheckboxFieldFormElement,
    SignatureField: SignatureFieldFormElement,
    LocationField: LocationFieldFormElement,
    ImageUploadField: ImageUploadFieldFormElement,
    BarcodeField: BarcodeFieldFormElement,
};
