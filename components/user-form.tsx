"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CalendarIcon, Loader2 } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { createUser, updateUser } from "@/app/actions/users"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/lib/models/user"

interface UserFormProps {
  user?: User
  isEdit?: boolean
}

export default function UserForm({ user, isEdit = false }: UserFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState(user?.role || "user")
  const [designation, setDesignation] = useState(user?.designation || "")
  const [dob, setDob] = useState<Date | undefined>(user?.dob ? new Date(user.dob) : undefined)
  const [aadharNumber, setAadharNumber] = useState(user?.aadhar_number || "")
  const [panNumber, setPanNumber] = useState(user?.pan_number || "")
  const [roomNumber, setRoomNumber] = useState(user?.room_number || "")
  const [passwordError, setPasswordError] = useState("")

  const router = useRouter()
  const { toast } = useToast()

  const validateForm = () => {
    // Reset error
    setPasswordError("")

    // Check if passwords match for new users or when changing password
    if (!isEdit || password) {
      if (password !== confirmPassword) {
        setPasswordError("Passwords do not match")
        return false
      }

      if (password.length < 8) {
        setPasswordError("Password must be at least 8 characters long")
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      if (password) {
        formData.append("password", password)
      }
      formData.append("role", role)
      formData.append("designation", designation)
      formData.append("dob", dob ? dob.toISOString() : "")
      formData.append("aadharNumber", aadharNumber)
      formData.append("panNumber", panNumber)
      formData.append("roomNumber", roomNumber)

      if (isEdit && user) {
        const result = await updateUser(user.id, formData)

        if (result.success) {
          toast({
            title: "User updated",
            description: `User ${name} has been updated successfully.`,
          })
          router.push(`/users/${user.id}`)
          router.refresh()
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message || "Failed to update user",
          })
        }
      } else {
        const result = await createUser(formData)

        if (result.success) {
          toast({
            title: "User created",
            description: `User ${name} has been created successfully.`,
          })
          router.push(`/users/${result.userId}`)
          router.refresh()
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: result.message || "Failed to create user",
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
    if (isEdit && user) {
      setName(user.name)
      setEmail(user.email)
      setPassword("")
      setConfirmPassword("")
      setRole(user.role)
      setDesignation(user.designation)
      setDob(user.dob ? new Date(user.dob) : undefined)
      setAadharNumber(user.aadhar_number || "")
      setPanNumber(user.pan_number || "")
      setRoomNumber(user.room_number || "")
    } else {
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setRole("user")
      setDesignation("")
      setDob(undefined)
      setAadharNumber("")
      setPanNumber("")
      setRoomNumber("")
    }
    setPasswordError("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>User account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isEdit ? "New Password" : "Password *"}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
                required={!isEdit}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{isEdit ? "Confirm New Password" : "Confirm Password *"}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isEdit ? "Leave blank to keep current password" : "Confirm password"}
                required={!isEdit}
              />
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">User Role *</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select user role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="poweruser">Power User</SelectItem>
                  <SelectItem value="user">Regular User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation *</Label>
              <Input
                id="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Enter job title or designation"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !dob && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dob ? format(dob, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={dob} onSelect={setDob} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="aadharNumber">Aadhar Number</Label>
              <Input
                id="aadharNumber"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value)}
                placeholder="Enter Aadhar number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input
                id="panNumber"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value)}
                placeholder="Enter PAN number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room / Office Number</Label>
              <Input
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Enter room or office number"
              />
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
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Create User"
          )}
        </Button>
      </div>
    </form>
  )
}
