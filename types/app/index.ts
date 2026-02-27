import { Database } from "../database";

// Re-export Database type for convenience
export type SupabaseDB = Database;

// Utility to extract Row types (falls back to any if schema is not updated locally)
export type Tables<T extends string> = T extends keyof Database['public']['Tables'] ? Database['public']['Tables'][T]['Row'] : any;
export type Enums<T extends string> = T extends keyof Database['public']['Enums'] ? Database['public']['Enums'][T] : any;

// Domain Entities
export type Organization = Tables<'organizations'>;
export type OrganizationMember = Tables<'organization_members'> & {
    profiles?: Profile;
    organizations?: Organization;
};
export type Profile = Tables<'profiles'>;
export type Form = Tables<'forms'>;
export type Submission = Tables<'submissions'>;
export type Notification = Tables<'notifications'>;
export type Visit = Tables<'visits'> & { clients?: Client }; // Join
export type Client = Tables<'clients'>;
export type Assignment = Tables<'form_assignments'> & { forms?: Form }; // Join
export type Team = Tables<'teams'>;

export interface BankDetails {
    bankName?: string;
    accountNumber?: string;
    iban?: string;
}

// Custom/Composite Types
export interface UserProfile extends Profile {
    email: string; // Ensure email is always present in our app usage
}

export interface DashboardStats {
    formsCount: number;
    submissionsCount: number;
    recentActivity: any[]; // To be typed strictly later
}
