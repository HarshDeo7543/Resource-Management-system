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
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { createUser, updateUser } from "@/app/actions/users"
import { useToast } from "@/components/ui/use-toast"
import type { User } from "@/lib/models/user"
import PasswordStrengthMeter from "./password-strength-meter"
import PhoneInput from "./phone-input"
import ProfilePictureUpload from "./profile-picture-upload"

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

  // New fields
  const [phoneNumber, setPhoneNumber] = useState("")
  const [countryCode, setCountryCode] = useState("IN")
  const [profilePicture, setProfilePicture] = useState<File | null>(null)
  const [emergencyContactName, setEmergencyContactName] = useState("")
  const [emergencyContactRelation, setEmergencyContactRelation] = useState("")
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("")
  const [emergencyCountryCode, setEmergencyCountryCode] = useState("IN")
  const [employeeId, setEmployeeId] = useState("")
  const [officeLocation, setOfficeLocation] = useState("")
  const [floor, setFloor] = useState("")
  const [deskNumber, setDeskNumber] = useState("")
  const [officePhone, setOfficePhone] = useState("")

  // Validation states
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPasswordValid, setIsPasswordValid] = useState(false)

  // Date picker state for better UX
  const [dobDay, setDobDay] = useState(dob ? dob.getDate().toString() : "")
  const [dobMonth, setDobMonth] = useState(dob ? (dob.getMonth() + 1).toString() : "")
  const [dobYear, setDobYear] = useState(dob ? dob.getFullYear().toString() : "")

  const router = useRouter()
  const { toast } = useToast()

  // Generate years from 1950 to current year
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1949 }, (_, i) => currentYear - i)

  // Generate days 1-31
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  // Months
  const months = [
    { value: "1", label: "January" },
    { value: "2", label: "February" },
    { value: "3", label: "March" },
    { value: "4", label: "April" },
    { value: "5", label: "May" },
    { value: "6", label: "June" },
    { value: "7", label: "July" },
    { value: "8", label: "August" },
    { value: "9", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ]

  // Relations for emergency contact
  const relations = ["Parent", "Spouse", "Sibling", "Child", "Friend", "Colleague", "Other"]

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateAadhar = (aadhar: string) => {
    return /^\d{12}$/.test(aadhar)
  }

  const validatePAN = (pan: string) => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)
  }

  // Real-time validation
  const handleFieldBlur = (field: string, value: string) => {
    const newErrors = { ...errors }

    switch (field) {
      case "email":
        if (value && !validateEmail(value)) {
          newErrors.email = "Please enter a valid email address"
        } else {
          delete newErrors.email
        }
        break
      case "aadhar":
        if (value && !validateAadhar(value)) {
          newErrors.aadhar = "Aadhar number must be exactly 12 digits"
        } else {
          delete newErrors.aadhar
        }
        break
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

  // Update DOB when individual components change
  const updateDobFromComponents = (day: string, month: string, year: string) => {
    if (day && month && year) {
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
      if (!isNaN(date.getTime())) {
        setDob(date)
      }
    } else {
      setDob(undefined)
    }
  }

  const handleDayChange = (value: string) => {
    setDobDay(value)
    updateDobFromComponents(value, dobMonth, dobYear)
  }

  const handleMonthChange = (value: string) => {
    setDobMonth(value)
    updateDobFromComponents(dobDay, value, dobYear)
  }

  const handleYearChange = (value: string) => {
    setDobYear(value)
    updateDobFromComponents(dobDay, dobMonth, value)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    // Required fields
    if (!name.trim()) newErrors.name = "Name is required"
    if (!email.trim()) newErrors.email = "Email is required"
    if (!designation.trim()) newErrors.designation = "Designation is required"
    if (!aadharNumber.trim()) newErrors.aadhar = "Aadhar number is required"

    // Email validation
    if (email && !validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Aadhar validation
    if (aadharNumber && !validateAadhar(aadharNumber)) {
      newErrors.aadhar = "Aadhar number must be exactly 12 digits"
    }

    // PAN validation (optional)
    if (panNumber && !validatePAN(panNumber)) {
      newErrors.pan = "PAN must be in format: ABCDE1234F"
    }

    // Password validation for new users or when changing password
    if (!isEdit || password) {
      if (!password) {
        newErrors.password = "Password is required"
      } else if (!isPasswordValid) {
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
      const userDob = user.dob ? new Date(user.dob) : undefined
      setDob(userDob)
      setDobDay(userDob ? userDob.getDate().toString() : "")
      setDobMonth(userDob ? (userDob.getMonth() + 1).toString() : "")
      setDobYear(userDob ? userDob.getFullYear().toString() : "")
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
      setDobDay("")
      setDobMonth("")
      setDobYear("")
      setAadharNumber("")
      setPanNumber("")
      setRoomNumber("")
    }

    // Reset new fields
    setPhoneNumber("")
    setCountryCode("IN")
    setProfilePicture(null)
    setEmergencyContactName("")
    setEmergencyContactRelation("")
    setEmergencyContactPhone("")
    setEmergencyCountryCode("IN")
    setEmployeeId("")
    setOfficeLocation("")
    setFloor("")
    setDeskNumber("")
    setOfficePhone("")
    setErrors({})
  }

  return (
    <div className="space-y-6">
      {/* Form Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>User account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Profile Picture */}
            <div className="space-y-2">
              <Label>Profile Picture (Optional)</Label>
              <ProfilePictureUpload value="" onChange={setProfilePicture} userName={name} />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={(e) => handleFieldBlur("name", e.target.value)}
                placeholder="Enter full name"
                className={errors.name ? "border-red-500" : ""}
                required
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={(e) => handleFieldBlur("email", e.target.value)}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : email && validateEmail(email) ? "border-green-500" : ""}
                required
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{isEdit ? "New Password" : "Password *"}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? "Leave blank to keep current password" : "Enter password"}
                className={errors.password ? "border-red-500" : ""}
                required={!isEdit}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
              {password && <PasswordStrengthMeter password={password} onStrengthChange={setIsPasswordValid} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{isEdit ? "Confirm New Password" : "Confirm Password *"}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={isEdit ? "Leave blank to keep current password" : "Confirm password"}
                className={
                  errors.confirmPassword
                    ? "border-red-500"
                    : password && confirmPassword && password === confirmPassword
                      ? "border-green-500"
                      : ""
                }
                required={!isEdit}
              />
              {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword}</p>}
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
                className={errors.designation ? "border-red-500" : ""}
                required
              />
              {errors.designation && <p className="text-sm text-red-500">{errors.designation}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID (Optional)</Label>
              <Input
                id="employeeId"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Enter employee ID"
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Personal and contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Day</Label>
                  <Select value={dobDay} onValueChange={handleDayChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Month</Label>
                  <Select value={dobMonth} onValueChange={handleMonthChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-gray-500">Year</Label>
                  <Select value={dobYear} onValueChange={handleYearChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {dob && <p className="text-sm text-gray-600 mt-2">Selected: {format(dob, "MMMM d, yyyy")}</p>}
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

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="aadharNumber">Aadhar Number *</Label>
              <Input
                id="aadharNumber"
                value={aadharNumber}
                onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                onBlur={(e) => handleFieldBlur("aadhar", e.target.value)}
                placeholder="Enter 12-digit Aadhar number"
                className={
                  errors.aadhar
                    ? "border-red-500"
                    : aadharNumber && validateAadhar(aadharNumber)
                      ? "border-green-500"
                      : ""
                }
                maxLength={12}
                required
              />
              {errors.aadhar && <p className="text-sm text-red-500">{errors.aadhar}</p>}
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
          </CardContent>
        </Card>

        {/* Office Information */}
        <Card>
          <CardHeader>
            <CardTitle>Office Information</CardTitle>
            <CardDescription>Workplace details and location</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="officeLocation">Office Location (Optional)</Label>
              <Input
                id="officeLocation"
                value={officeLocation}
                onChange={(e) => setOfficeLocation(e.target.value)}
                placeholder="Building name or campus (e.g. ISSA)"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="floor">Floor (Optional)</Label>
                <Select value={floor} onValueChange={setFloor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select floor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Not specified</SelectItem>
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
                <Label htmlFor="deskNumber">Desk/Seat (Optional)</Label>
                <Input
                  id="deskNumber"
                  value={deskNumber}
                  onChange={(e) => setDeskNumber(e.target.value)}
                  placeholder="e.g. 3B-24"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number (Optional)</Label>
              <Input
                id="roomNumber"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="Enter room or office number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="officePhone">Extension / Office Phone (Optional)</Label>
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
            <CardTitle>Emergency Contact (Optional)</CardTitle>
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

      {/* Fixed Action Buttons */}
      <div className="sticky bottom-0 bg-white border-t p-4 flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="button" variant="outline" onClick={resetForm}>
          Reset Form
        </Button>
        <Button onClick={handleSubmit} className="bg-[#3498DB] hover:bg-[#2980B9]" disabled={isSubmitting}>
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
    </div>
  )
}
