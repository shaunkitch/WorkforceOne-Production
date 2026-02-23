-- RLS Policies for Inventory
DROP POLICY IF EXISTS "Members can view inventory" ON inventory;
CREATE POLICY "Members can view inventory" ON inventory FOR SELECT
USING (get_org_role_for_user(organization_id) IS NOT NULL);

DROP POLICY IF EXISTS "Admins/Owners/Editors can manage inventory" ON inventory;
CREATE POLICY "Admins/Owners/Editors can manage inventory" ON inventory FOR ALL
USING (get_org_role_for_user(organization_id) IN ('owner', 'admin', 'editor'));
