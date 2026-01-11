"use client";

import { useFormState } from "react-dom";
import { createOrganization } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState = {
    error: "",
};

export default function OnboardingPage() {
    const [state, formAction] = useFormState(createOrganization, initialState);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Welcome to WorkforceOne
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Let's get you set up with your first workspace.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form action={formAction} className="space-y-6">
                        <div>
                            <Label htmlFor="name">Organization Name</Label>
                            <div className="mt-1">
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    placeholder="Acme Corp"
                                />
                            </div>
                            {state?.errors?.name && (
                                <p className="mt-2 text-sm text-red-600">{state.errors.name}</p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="slug">
                                Workspace Slug <span className="text-gray-400 font-normal">(Optional)</span>
                            </Label>
                            <div className="mt-1">
                                <Input
                                    id="slug"
                                    name="slug"
                                    type="text"
                                    placeholder="acme-corp"
                                />
                            </div>
                            <p className="mt-1 text-xs text-gray-500">
                                This will be used in your workspace URL.
                            </p>
                            {state?.errors?.slug && (
                                <p className="mt-2 text-sm text-red-600">{state.errors.slug}</p>
                            )}
                        </div>

                        {state?.error && (
                            <div className="rounded-md bg-red-50 p-4">
                                <div className="flex">
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">
                                            Error
                                        </h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>{state.error}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <Button type="submit" className="w-full">
                                Create Workspace
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
