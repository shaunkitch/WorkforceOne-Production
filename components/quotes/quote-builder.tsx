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
import { createQuote } from "@/lib/actions/quotes"
import { getClients } from "@/lib/actions/clients"
import { Loader2, Plus, FileText, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface QuoteBuilderProps {
  orgId: string;
}

export function QuoteBuilder({ orgId }: QuoteBuilderProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<any[]>([])
  
  const [clientId, setClientId] = useState("")
  const [title, setTitle] = useState("")
  const [items, setItems] = useState<{description: string, quantity: number, unitPrice: number}[]>([{ description: "", quantity: 1, unitPrice: 0 }])

  useEffect(() => {
    if (open) {
        getClients(orgId).then(setClients).catch(console.error);
    }
  }, [open, orgId]);

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0 }])
  }

  const removeItem = (index: number) => {
    const newItems = [...items]
    newItems.splice(index, 1)
    setItems(newItems)
  }

  const updateItem = (index: number, field: string, value: any) => {
    const newItems = [...items]
    // @ts-ignore
    newItems[index][field] = value
    setItems(newItems)
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createQuote(orgId, {
        clientId,
        title,
        items
      })

      toast({
        title: "Success",
        description: "Quote created successfully",
      })
      
      setOpen(false)
      setTitle("")
      setClientId("")
      setItems([{ description: "", quantity: 1, unitPrice: 0 }])
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
          Create Quote
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Quote</DialogTitle>
            <DialogDescription>
              Draft a new quote for a client.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="client" className="mb-2 block">Client *</Label>
                    <Select value={clientId} onValueChange={setClientId} required>
                        <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                        </SelectTrigger>
                        <SelectContent>
                        {clients.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                     <Label htmlFor="title" className="mb-2 block">Quote Title *</Label>
                     <Input 
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Website Redesign"
                        required
                     />
                </div>
            </div>

            <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                    <Label>Line Items</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addItem}>Add Item</Button>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex gap-2 items-start">
                            <Input 
                                className="flex-[2]" 
                                placeholder="Description" 
                                value={item.description}
                                onChange={(e) => updateItem(index, 'description', e.target.value)}
                                required
                            />
                            <Input 
                                className="w-20" 
                                type="number" 
                                placeholder="Qty" 
                                value={item.quantity}
                                onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value))}
                                min="1"
                                required
                            />
                            <Input 
                                className="w-24" 
                                type="number" 
                                placeholder="Price" 
                                value={item.unitPrice}
                                onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value))}
                                min="0"
                                step="0.01"
                                required
                            />
                            <div className="w-24 py-2 text-right font-medium text-sm">
                                ${(item.quantity * item.unitPrice).toFixed(2)}
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={items.length === 1}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                </div>
                
                <div className="flex justify-end mt-4 pt-2 border-t">
                    <div className="text-lg font-bold">
                        Total: ${calculateTotal().toFixed(2)}
                    </div>
                </div>

            </div>

          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Quote
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
