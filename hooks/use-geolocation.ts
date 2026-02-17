"use client";

import { useState, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";

export function useGeolocation() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getLocation = useCallback(async (): Promise<string | null> => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            const msg = "Geolocation is not supported by your browser";
            setError(msg);
            setLoading(false);
            return null;
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const long = position.coords.longitude;
                    const locationString = `${lat},${long}`;
                    setLoading(false);
                    resolve(locationString);
                },
                (err) => {
                    let errorMsg = "Unable to retrieve your location";
                    if (err.code === err.PERMISSION_DENIED) {
                        errorMsg = "Location permission denied. Please enable it in your browser settings.";
                    } else if (err.code === err.POSITION_UNAVAILABLE) {
                        errorMsg = "Location information is unavailable.";
                    } else if (err.code === err.TIMEOUT) {
                        errorMsg = "The request to get user location timed out.";
                    }

                    setError(errorMsg);
                    setLoading(false);
                    toast({
                        title: "Location Error",
                        description: errorMsg,
                        variant: "destructive",
                    });
                    resolve(null);
                }
            );
        });
    }, []);

    return {
        getLocation,
        loading,
        error,
    };
}
