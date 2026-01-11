'use server'

import { signUpSchema, SignUpSchema } from '@/lib/validations/auth';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export interface FormState {
  errors?: {
    email?: string[];
    password?: string[];
    fullName?: string[];
    orgName?: string[];
    _form?: string[];
  };
  message?: string;
}

export async function signUp(
  prevState: FormState,
  formData: FormData
) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const fullName = formData.get('fullName') as string;
  const orgName = formData.get('orgName') as string;

  const validatedFields = signUpSchema.safeParse({ email, password, fullName, orgName });

  if (!validatedFields.success) {
    // Return validation errors
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
  const supabase = createClient();

  // 1. Sign up user with Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName, // Pass full name to auth.users metadata if desired
      },
    },
  });

  if (authError) {
    return {
      errors: {
        email: [authError.message], // Wrap in array
      },
    };
  }

  const user = authData.user;

  if (!user) {
    return {
      errors: {
        email: ['User could not be created. Please try again.'], // Wrap in array
      },
    };
  }

  // 2. Create Organization, Profile, and Organization Member
  try {
    // Create new organization
    const { data: orgData, error: orgError } = await supabase
      .from('organizations')
      .insert({ name: orgName, created_by_user_id: user.id })
      .select('id')
      .single();

    if (orgError) throw orgError;
    const organizationId = orgData.id;

    // Create profile (supabase RLS will handle user_id automatically if policy is set,
    // but explicit insert is safer and common. Ensure RLS allows this if needed.)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({ id: user.id, full_name: fullName }); // user.id from authData

    if (profileError) throw profileError;

    // Link user to organization as owner
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({ organization_id: organizationId, user_id: user.id, role: 'owner' });

    if (memberError) throw memberError;

  } catch (dbError: any) {
    console.error('Database operation failed during signup:', dbError);
    // If any database operation fails, consider rolling back user creation or notifying admin
    // For simplicity, we'll just return a generic error.
    return {
      errors: {
        _form: [dbError.message || 'An unexpected error occurred during setup. Please try again.'],
      },
    };
  }

  // If everything is successful, redirect the user
  // This will likely go to a verification page or dashboard
  redirect('/login?message=Check your email for a confirmation link');
}
