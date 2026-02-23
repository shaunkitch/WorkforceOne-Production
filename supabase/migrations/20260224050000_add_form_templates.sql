-- Add template support to forms
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS category text,
ADD COLUMN IF NOT EXISTS description text;

-- Example: Let's insert some default templates to make the marketplace useful on Day 1
INSERT INTO forms (title, description, is_template, category, content, organization_id)
VALUES 
(
    'Daily Security Patrol Report', 
    'Standard operating procedure for physical site patrols. Includes checkpoint verification and incident logging.', 
    true, 
    'Security & Safety', 
    '[{"id":"checkpoint","type":"text","required":true,"question":"Checkpoint Name / ID"},{"id":"status","type":"text","required":true,"question":"Status (Clear / Issue)"},{"id":"photo","type":"camera","required":false,"question":"Attach Photo of Issue"},{"id":"notes","type":"paragraph","required":false,"question":"Additional Notes"}]'::jsonb, 
    NULL
),
(
    'Warehouse Inventory Count', 
    'End of day stock check documentation.', 
    true, 
    'Logistics & Operations', 
    '[{"id":"aisle","type":"text","required":true,"question":"Aisle / Area"},{"id":"barcode","type":"text","required":true,"question":"Item Barcode"},{"id":"count","type":"number","required":true,"question":"Physical Count"},{"id":"discrepancy","type":"text","required":false,"question":"Reason for Discrepancy"}]'::jsonb, 
    NULL
);
