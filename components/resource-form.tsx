"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createResource, updateResource } from "@/app/actions/resources"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/lib/models/user"
import type { Resource } from "@/lib/models/resource"

interface ResourceFormProps {
  users: User[]
  resource?: Resource
  isEdit?: boolean
}

export default function ResourceForm({ users, resource, isEdit = false }: ResourceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationNumber, setRegistrationNumber] = useState(resource?.reg_number || "")
  const [resourceType, setResourceType] = useState(resource?.resource_type || "PC")
  const [manufacturer, setManufacturer] = useState(resource?.manufacturer || "")
  const [model, setModel] = useState(resource?.model || "")
  const [serialNumber, setSerialNumber] = useState(resource?.serial_number || "")
  const [processor, setProcessor] = useState(resource?.processor || "")
  const [ram, setRam] = useState(resource?.ram || "")
  const [storage, setStorage] = useState(resource?.storage || "")
  const [operatingSystem, setOperatingSystem] = useState(resource?.operating_system || "")
  const [purchaseDate, setPurchaseDate] = useState<Date | undefined>(
    resource?.purchase_date ? new Date(resource.purchase_date) : undefined,
  )
  const [warrantyExpiry, setWarrantyExpiry] = useState<Date | undefined>(
    resource?.warranty_expiry ? new Date(resource.warranty_expiry) : undefined,
  )
  const [location, setLocation] = useState(resource?.location || "")
  const [assignedUser, setAssignedUser] = useState(resource?.assigned_user_id?.toString() || "")
  const [warrantyProvider, setWarrantyProvider] = useState(resource?.warranty_provider || "")
  const [supportContact, setSupportContact] = useState(resource?.support_contact || "")
  const [comments, setComments] = useState(resource?.comments || "")
  const [status, setStatus] = useState(resource?.status || "Active")

  const router = useRouter()
  const { toast } = useToast()

  // Generate registration number when resource type changes (only for new resources)
  const handleResourceTypeChange = (value: string) => {
    setResourceType(value)

    if (!isEdit) {
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "")
      const randomNum = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")
      setRegistrationNumber(`${value.toUpperCase()}-REG-${timestamp}-${randomNum}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("resourceType", resourceType)
      formData.append("manufacturer", manufacturer)
      formData.append("model", model)
      formData.append("serialNumber", serialNumber)
      formData.append("processor", processor)
      formData.append("ram", ram)
      formData.append("storage", storage)
      formData.append("operatingSystem", operatingSystem)
      formData.append("purchaseDate", purchaseDate ? purchaseDate.toISOString() : "")
      formData.append("warrantyExpiry", warrantyExpiry ? warrantyExpiry.toISOString() : "")
      formData.append("location", location)
      formData.append("assignedUser", assignedUser)
      formData.append("warrantyProvider", warrantyProvider)
      formData.append("supportContact", supportContact)
      formData.append("comments", comments)

      if (isEdit && resource) {
        formData.append("status", status)
        const result = await updateResource(resource.id, formData)

        if (result.success) {
          toast({
            title: "Resource updated",
            description: `Resource ${registrationNumber} has been updated successfully.`,
          })
          router.push(`/resources/${resource.id}`)
          router.refresh()
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message || "Failed to update resource",
          })
        }
      } else {
        const result = await createResource(formData)

        if (result.success) {
          toast({
            title: "Resource registered",
            description: `Resource ${registrationNumber} has been registered successfully.`,
          })
          router.push(`/resources/${result.resourceId}`)
          router.refresh()
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message || "Failed to register resource",
          })
        }
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    if (isEdit && resource) {
      setResourceType(resource.resource_type)
      setManufacturer(resource.manufacturer || "")
      setModel(resource.model || "")
      setSerialNumber(resource.serial_number)
      setProcessor(resource.processor || "")
      setRam(resource.ram || "")
      setStorage(resource.storage || "")
      setOperatingSystem(resource.operating_system || "")
      setPurchaseDate(resource.purchase_date ? new Date(resource.purchase_date) : undefined)
      setWarrantyExpiry(resource.warranty_expiry ? new Date(resource.warranty_expiry) : undefined)
      setLocation(resource.location || "")
      setAssignedUser(resource.assigned_user_id?.toString() || "")
      setWarrantyProvider(resource.warranty_provider || "")
      setSupportContact(resource.support_contact || "")
      setComments(resource.comments || "")
      setStatus(resource.status)
    } else {
      setResourceType("PC")
      setManufacturer("")
      setModel("")
      setSerialNumber("")
      setProcessor("")
      setRam("")
      setStorage("")
      setOperatingSystem("")
      setPurchaseDate(undefined)
      setWarrantyExpiry(undefined)
      setLocation("")
      setAssignedUser("")
      setWarrantyProvider("")
      setSupportContact("")
      setComments("")
      setRegistrationNumber("")
    }
  }

  const showTechnicalSpecs = ["PC", "Laptop", "Server", "Workstation"].includes(resourceType)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resource Details */}
        <Card>
          <CardHeader>
            <CardTitle>Resource Details</CardTitle>
            <CardDescription>Basic information about the resource</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resourceType">Resource Type *</Label>
              <Select value={resourceType} onValueChange={handleResourceTypeChange} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PC">PC</SelectItem>
                  <SelectItem value="Server">Server</SelectItem>
                  <SelectItem value="Workstation">Workstation</SelectItem>
                  <SelectItem value="Printer">Printer</SelectItem>
                  <SelectItem value="Switch">Switch</SelectItem>
                  <SelectItem value="Router">Router</SelectItem>
                  <SelectItem value="Hub">Hub</SelectItem>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Display">Display</SelectItem>
                  <SelectItem value="VC Equipment">VC Equipment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                value={registrationNumber}
                readOnly
                className="bg-gray-50"
                placeholder="Auto-generated"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  placeholder="e.g., Dell, HP, Cisco"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Model number" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serial Number *</Label>
              <Input
                id="serialNumber"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Serial number"
                required
              />
            </div>

            {showTechnicalSpecs && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Technical Specifications</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="processor">Processor</Label>
                      <Input
                        id="processor"
                        value={processor}
                        onChange={(e) => setProcessor(e.target.value)}
                        placeholder="e.g., Intel i7-12700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ram">RAM</Label>
                      <Input
                        id="ram"
                        value={ram}
                        onChange={(e) => setRam(e.target.value)}
                        placeholder="e.g., 16GB DDR4"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="storage">Storage</Label>
                      <Input
                        id="storage"
                        value={storage}
                        onChange={(e) => setStorage(e.target.value)}
                        placeholder="e.g., 512GB SSD"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="operatingSystem">Operating System</Label>
                      <Input
                        id="operatingSystem"
                        value={operatingSystem}
                        onChange={(e) => setOperatingSystem(e.target.value)}
                        placeholder="e.g., Windows 11 Pro"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Purchase Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !purchaseDate && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {purchaseDate ? format(purchaseDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={purchaseDate} onSelect={setPurchaseDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Warranty Expiry</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !warrantyExpiry && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {warrantyExpiry ? format(warrantyExpiry, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={warrantyExpiry} onSelect={setWarrantyExpiry} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location / Room Number</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Room 305, Server Room"
              />
            </div>

            {isEdit && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned User Details */}
        <Card>
          <CardHeader>
            <CardTitle>Assigned User Details</CardTitle>
            <CardDescription>User assignment information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="assignedUser">Assigned To</Label>
              <Select value={assignedUser} onValueChange={setAssignedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.role === "admin" ? "Admin" : user.role === "poweruser" ? "Power User" : "User"}
                      )
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-medium">Additional Details</h4>
              <div className="space-y-2">
                <Label htmlFor="warrantyProvider">Warranty Provider</Label>
                <Input
                  id="warrantyProvider"
                  value={warrantyProvider}
                  onChange={(e) => setWarrantyProvider(e.target.value)}
                  placeholder="Warranty provider name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportContact">Support Contact</Label>
                <Input
                  id="supportContact"
                  value={supportContact}
                  onChange={(e) => setSupportContact(e.target.value)}
                  placeholder="Support phone/email"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comments">Comments / Notes</Label>
                <Textarea
                  id="comments"
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Additional notes or comments"
                  rows={4}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="button" variant="outline" onClick={resetForm}>
          Reset Form
        </Button>
        <Button type="submit" className="bg-[#3498DB] hover:bg-[#2980B9]" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Registering..."}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Save & Register"
          )}
        </Button>
      </div>
    </form>
  )
}
