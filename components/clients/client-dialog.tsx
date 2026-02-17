"use client"

import { useState } from "react"
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
import { createClientAction } from "@/lib/actions/clients"
import { Loader2, Plus, Users, MapPin } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Textarea } from "@/components/ui/textarea"

interface ClientDialogProps {
    orgId: string;
}

export function ClientDialog({ orgId }: ClientDialogProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")

    // GPS State
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [locationLoading, setLocationLoading] = useState(false)

    const handleGetLocation = () => {
        setLocationLoading(true)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                setLatitude(position.coords.latitude.toString())
                setLongitude(position.coords.longitude.toString())
                setLocationLoading(false)
                toast({
                    title: "Location Fetched",
                    description: "Coordinates updated successfully.",
                })
            }, (error) => {
                toast({
                    variant: "destructive",
                    title: "Error fetching location",
                    description: error.message
                })
                setLocationLoading(false)
            })
        } else {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Geolocation is not supported by this browser."
            })
            setLocationLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await createClientAction(orgId, {
                name,
                email,
                phone,
                address,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined
            })

            toast({
                title: "Success",
                description: "Client added successfully",
            })

            setOpen(false)
            setName("")
            setEmail("")
            setPhone("")
            setAddress("")
            setLatitude("")
            setLongitude("")
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Client
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Add Client</DialogTitle>
                        <DialogDescription>
                            Add a new client to your CRM.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name *
                            </Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="phone" className="text-right">
                                Phone
                            </Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="address" className="text-right">
                                Address
                            </Label>
                            <Textarea
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="col-span-3"
                            />
                        </div>

                        {/* Location Fields */}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Location</Label>
                            <div className="col-span-3 flex space-x-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={handleGetLocation}
                                    disabled={locationLoading}
                                    className="w-full"
                                >
                                    {locationLoading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : <MapPin className="mr-2 h-3 w-3" />}
                                    Get Current GPS
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="latitude" className="text-right">
                                Lat/Lng
                            </Label>
                            <div className="col-span-3 flex space-x-2">
                                <Input
                                    id="latitude"
                                    placeholder="Latitude"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    type="number"
                                    step="any"
                                />
                                <Input
                                    id="longitude"
                                    placeholder="Longitude"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    type="number"
                                    step="any"
                                />
                            </div>
                        </div>

                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Client
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
