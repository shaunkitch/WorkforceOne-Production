const PDFParser = require("pdf2json");

export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(this, 1); // 1 = text mode

        pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error("PDF Parsing Error", errData.parserError);
            reject(new Error("Failed to parse PDF"));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
            try {
                // pdf2json returns text in encoded format (URI encoded) usually in Page array
                // The raw text content is often better obtained via the getter if available, 
                // but pdf2json main event returns a JSON object.
                // We enabled text mode (1), so executing getRawTextContent() is the way.
                const text = pdfParser.getRawTextContent();
                resolve(text);
            } catch (e) {
                reject(e);
            }
        });

        try {
            pdfParser.parseBuffer(buffer);
        } catch (e) {
            reject(e);
        }
    });
}
