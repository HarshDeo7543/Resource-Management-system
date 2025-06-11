"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Loader2, Lock } from "lucide-react"
import { updateUser } from "@/app/actions/users"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/lib/models/user"
import PasswordStrengthMeter from "./password-strength-meter"
import PhoneInput from "./phone-input"
import ProfilePictureUpload from "./profile-picture-upload"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserProfileSettingsProps {
  user: User
}

export default function UserProfileSettings({ user }: UserProfileSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [panNumber, setPanNumber] = useState(user?.pan_number || "")
  const [roomNumber, setRoomNumber] = useState(user?.room_number || "")
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "")
  const [countryCode, setCountryCode] = useState(user?.country_code || "IN")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [emergencyContactName, setEmergencyContactName] = useState(user?.emergency_contact_name || "")
  const [emergencyContactRelation, setEmergencyContactRelation] = useState(user?.emergency_contact_relation || "")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(user?.emergency_contact_phone || "")
  const [emergencyCountryCode, setEmergencyCountryCode] = useState(user?.emergency_country_code || "IN")
  const [employeeId, setEmployeeId] = useState(user?.employee_id || "")
  const [officeLocation, setOfficeLocation] = useState(user?.office_location || "")
  const [floor, setFloor] = useState(user?.floor || "Not specified")
  const [deskNumber, setDeskNumber] = useState(user?.desk_number || "")
  const [officePhone, setOfficePhone] = useState(user?.office_phone || "")

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPasswordValid, setIsPasswordValid] = useState(false)

  const { toast } = useToast()

  // Relations for emergency contact
  const relations = ["Parent", "Spouse", "Sibling", "Child", "Friend", "Colleague", "Other"]

  // Validation functions
  const validatePAN = (pan: string) => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)
  }

  // Real-time validation
  const handleFieldBlur = (field: string, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case "pan":
        if (value && !validatePAN(value)) {
          newErrors.pan = "PAN must be in format: ABCDE1234F"
        } else {
          delete newErrors.pan
        }
        break
    }

    setErrors(newErrors)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // PAN validation (optional)
    if (panNumber && !validatePAN(panNumber)) {
      newErrors.pan = "PAN must be in format: ABCDE1234F"
    }

    // Password validation when changing password
    if (password) {
      if (!isPasswordValid) {
        newErrors.password = "Password does not meet security requirements"
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()

      // Only include fields that users are allowed to update
      if (password) {
        formData.append("password", password)
      }
      formData.append("panNumber", panNumber)
      formData.append("roomNumber", roomNumber)
      formData.append("phoneNumber", phoneNumber)
      formData.append("countryCode", countryCode)
      formData.append("emergencyContactName", emergencyContactName)
      formData.append("emergencyContactRelation", emergencyContactRelation)
      formData.append("emergencyContactPhone", emergencyContactPhone)
      formData.append("emergencyCountryCode", emergencyCountryCode)
      formData.append("employeeId", employeeId)
      formData.append("officeLocation", officeLocation)
      formData.append("floor", floor)
      formData.append("deskNumber", deskNumber)
      formData.append("officePhone", officePhone)

      if (profilePicture) {
        formData.append("profilePicture", profilePicture)
      }

      const result = await updateUser(user.id, formData)

      if (result.success) {
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        })

        // Reset password fields after successful update
        setPassword("")
        setConfirmPassword("")

        // Refresh the page to show updated data
        window.location.reload()
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message || "Failed to update profile",
        })
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Picture */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <ProfilePictureUpload
                value={user.profile_picture || ""}
                onChange={setProfilePicture}
                userName={user.name}
              />
            </div>

            <Separator />

            {/* Read-only fields */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="flex items-center">
                <Input id="name" value={user.name} readOnly className="bg-gray-50" />
                <Lock className="ml-2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">Contact admin to update your name</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center">
                <Input id="email" value={user.email} readOnly className="bg-gray-50" />
                <Lock className="ml-2 h-4 w-4 text-gray-400" />
              </div>
              <p className="text-xs text-gray-500">Contact admin to update your email</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">User Role</Label>
              <div className="flex items-center">
                <Input
                  id="role"
                  value={user.role === "admin" ? "Admin" : user.role === "poweruser" ? "Power User" : "User"}
                  readOnly
                  className="bg-gray-50"
                />
                <Lock className="ml-2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="designation">Designation</Label>
              <div className="flex items-center">
                <Input id="designation" value={user.designation} readOnly className="bg-gray-50" />
                <Lock className="ml-2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            <Separator />

            {/* Editable fields */}
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter employee ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number (Optional)</Label>
              <Input
                id="panNumber"
                value={panNumber}
                onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                onBlur={(e) => handleFieldBlur("pan", e.target.value)}
                placeholder="ABCDE1234F"
                className={
                  errors.pan ? "border-red-500" : panNumber && validatePAN(panNumber) ? "border-green-500" : ""
                }
                maxLength={10}
              />
              {errors.pan && <p className="text-sm text-red-500">{errors.pan}</p>}
              <p className="text-xs text-gray-500">Format: 5 letters + 4 digits + 1 letter</p>
            </div>

            <div className="space-y-2">
              <Label>Mobile Phone Number</Label>
              <PhoneInput
                value={phoneNumber}
                onChange={setPhoneNumber}
                countryCode={countryCode}
                onCountryChange={setCountryCode}
                placeholder="Enter mobile number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Update your password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              {password && <PasswordStrengthMeter password={password} onStrengthChange={setIsPasswordValid} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Leave blank to keep current password"
                className={
                  errors.confirmPassword
                    ? "border-red-500"
                    : password && confirmPassword && password === confirmPassword
                      ? "border-green-500"
                      : ""
                }
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Office Information */}
        <Card>
          <CardHeader>
            <CardTitle>Office Information</CardTitle>
            <CardDescription>Your workplace details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="officeLocation">Office Location</Label>
              <Input
                id="officeLocation"
                value={officeLocation}
                onChange={(e) => setOfficeLocation(e.target.value)}
                placeholder="Building name or campus (e.g. Headquarters – Tower B)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor">Floor</Label>
                <Select value={floor} onValueChange={setFloor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 20 }, (_, i) => (
                      <SelectItem key={i} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                    <SelectItem value="B">Basement</SelectItem>
                    <SelectItem value="G">Ground</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deskNumber">Desk/Seat</Label>
                <Input
                  id="deskNumber"
                  value={deskNumber}
                  onChange={(e) => setDeskNumber(e.target.value)}
                  placeholder="e.g. 3B-24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <Input
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Enter room or office number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="officePhone">Extension / Office Phone</Label>
              <Input
                id="officePhone"
                value={officePhone}
                onChange={(e) => setOfficePhone(e.target.value)}
                placeholder="Enter office extension or VoIP number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card>
          <CardHeader>
            <CardTitle>Emergency Contact</CardTitle>
            <CardDescription>Contact person in case of emergency</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Contact Name</Label>
              <Input
                id="emergencyContactName"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
                placeholder="Enter contact name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelation">Relationship</Label>
              <Select value={emergencyContactRelation} onValueChange={setEmergencyContactRelation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {relations.map((relation) => (
                    <SelectItem key={relation} value={relation}>
                      {relation}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Contact Phone</Label>
              <PhoneInput
                value={emergencyContactPhone}
                onChange={setEmergencyContactPhone}
                countryCode={emergencyCountryCode}
                onCountryChange={setEmergencyCountryCode}
                placeholder="Enter contact number"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button type="reset" variant="outline">
          Reset Changes
        </Button>
        <Button type="submit" className="bg-[#3498DB] hover:bg-[#2980B9]" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating Profile...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  )
}
