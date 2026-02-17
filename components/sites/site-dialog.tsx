"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSite, updateSite, type Site } from "@/lib/actions/sites"
import { Loader2, Plus, Pencil, MapPin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SiteDialogProps {
    orgId: string;
    site?: Site;
}

export function SiteDialog({ orgId, site }: SiteDialogProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [name, setName] = useState(site?.name || "")
    const [address, setAddress] = useState(site?.address || "")
    const [radius, setRadius] = useState(site?.radius ? site.radius.toString() : "100")
    const [latitude, setLatitude] = useState(site?.latitude ? site.latitude.toString() : "")
    const [longitude, setLongitude] = useState(site?.longitude ? site.longitude.toString() : "")

    useEffect(() => {
        if (open && site) {
            setName(site.name)
            setAddress(site.address || "")
            setRadius(site.radius.toString())
            setLatitude(site.latitude?.toString() || "")
            setLongitude(site.longitude?.toString() || "")
        } else if (open && !site) {
            // Reset for new entry
            setName("")
            setAddress("")
            setRadius("100")
            setLatitude("")
            setLongitude("")
        }
    }, [open, site])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const lat = latitude ? parseFloat(latitude) : undefined;
            const lng = longitude ? parseFloat(longitude) : undefined;

            if (site) {
                await updateSite(orgId, site.id, {
                    name,
                    address,
                    radius: parseInt(radius),
                    latitude: lat,
                    longitude: lng
                })
                toast({ title: "Success", description: "Site updated successfully" })
            } else {
                await createSite(orgId, {
                    name,
                    address,
                    radius: parseInt(radius),
                    latitude: lat,
                    longitude: lng
                })
                toast({ title: "Success", description: "Site created successfully" })
            }

            setOpen(false)
            router.refresh()
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message,
            })
        } finally {
            setLoading(false)
        }
    }

    const handleGetCurrentLocation = () => {
        if (!navigator.geolocation) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Geolocation is not supported by your browser",
            })
            return
        }

        setLoading(true)
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude.toString())
                setLongitude(position.coords.longitude.toString())
                setLoading(false)
                toast({ title: "Success", description: "Location retrieved!" })
            },
            (error) => {
                setLoading(false)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Unable to retrieve your location",
                })
            }
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {site ? (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Site
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{site ? "Edit Site" : "Add Site"}</DialogTitle>
                        <DialogDescription>
                            {site ? "Update site details and location." : "Create a new site location for your organization."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">Address</Label>
                            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="radius" className="text-right">Radius (m)</Label>
                            <Input id="radius" type="number" value={radius} onChange={(e) => setRadius(e.target.value)} className="col-span-3" min="10" />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <div className="col-span-4 flex justify-end">
                                <Button type="button" variant="outline" size="sm" onClick={handleGetCurrentLocation} disabled={loading}>
                                    <MapPin className="mr-2 h-4 w-4" />
                                    Use Current Location
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lat" className="text-right">Latitude</Label>
                            <Input id="lat" type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} className="col-span-3" placeholder="-33.9249" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="lng" className="text-right">Longitude</Label>
                            <Input id="lng" type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} className="col-span-3" placeholder="18.4241" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {site ? "Update Site" : "Create Site"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
