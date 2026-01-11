"use server";

import OpenAI from "openai";
import { extractTextFromPdf } from "@/lib/pdf";
import { FormElementInstance, ElementType } from "@/types/forms";
import { FormElements } from "@/components/forms/builder/FormElements";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function generateFormFromPdf(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file uploaded");

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 1. Extract Text
    const text = await extractTextFromPdf(buffer);
    if (!text || text.length < 10) throw new Error("Could not extract enough text from PDF");

    // 2. Generate JSON with OpenAI
    const systemPrompt = `
    You are an expert Form Builder assistant.
    Your goal is to analyze the provided text from a PDF document and generate a JSON array of Form Elements that represents the form described in the text.
    
    The available Form Elements are:
    - TextField: { type: "TextField", extraAttributes: { label: string, required: boolean, placeHolder: string, helperText: string } }
    - TitleField: { type: "TitleField", extraAttributes: { title: string } }
    - SubTitleField: { type: "SubTitleField", extraAttributes: { title: string } }
    - ParagraphField: { type: "ParagraphField", extraAttributes: { text: string } }
    - SeparatorField: { type: "SeparatorField" }
    - SpacerField: { type: "SpacerField", extraAttributes: { height: number } }
    - NumberField: { type: "NumberField", extraAttributes: { label: string, required: boolean, placeHolder: string } }
    - TextAreaField: { type: "TextAreaField", extraAttributes: { label: string, required: boolean, placeHolder: string, rows: number } }
    - DateField: { type: "DateField", extraAttributes: { label: string, required: boolean, helperText: string } }
    - SelectField: { type: "SelectField", extraAttributes: { label: string, required: boolean, placeHolder: string, options: string[] } } // Options is array of strings
    - CheckboxField: { type: "CheckboxField", extraAttributes: { label: string, required: boolean, helperText: string } }
    
    RETURN ONLY THE JSON ARRAY. NO MARKDOWN, NO EXPLANATION.
    `;

    const userPrompt = `
    Here is the text content of the form:
    ---
    ${text.substring(0, 15000)} // Limit context to avoid token limits
    ---
    Generate the form elements JSON.
    `;

    const response = await openai.chat.completions.create({
        model: "gpt-4o", // or gpt-4-turbo
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.2, // Low temperature for deterministic output
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("Failed to generate form");

    // Clean up potential markdown code blocks
    const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
        const rawElements = JSON.parse(cleanContent);

        // 3. Hydrate elements with IDs (Client needs unique IDs usually, but DesignerContext will re-ID on import? 
        // Actually DesignerContext 'addElement' expects a constructed element with ID.
        // We can assigning random IDs here.

        const hydratedElements = rawElements.map((el: any) => {
            // Create a base element structure
            return {
                id: crypto.randomUUID(),
                type: el.type,
                extraAttributes: el.extraAttributes
            };
        });

        return hydratedElements;
    } catch (e) {
        console.error("JSON Parse Error:", e);
        throw new Error("AI generated invalid JSON");
    }
}
