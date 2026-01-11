import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  fullName: z.string().min(1, { message: "Full name is required." }),
  orgName: z.string().min(1, { message: "Organization name is required." }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
