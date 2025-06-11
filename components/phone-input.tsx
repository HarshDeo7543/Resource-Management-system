"use client"

import type React from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"

interface Country {
  code: string
  name: string
  dialCode: string
  flag: string
}

const countries: Country[] = [
  { code: "IN", name: "India", dialCode: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dialCode: "+1", flag: "🇨🇦" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "DE", name: "Germany", dialCode: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dialCode: "+33", flag: "🇫🇷" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "CN", name: "China", dialCode: "+86", flag: "🇨🇳" },
  { code: "BR", name: "Brazil", dialCode: "+55", flag: "🇧🇷" },
]

interface PhoneInputProps {
  value: string
  onChange: (value: string) => void
  countryCode: string
  onCountryChange: (code: string) => void
  placeholder?: string
  error?: string
}

export default function PhoneInput({
  value,
  onChange,
  countryCode,
  onCountryChange,
  placeholder = "Enter phone number",
  error,
}: PhoneInputProps) {
  const selectedCountry = countries.find((c) => c.code === countryCode) || countries[0]

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneValue = e.target.value.replace(/\D/g, "") // Only allow digits
    onChange(phoneValue)
  }

  const isValidLength = () => {
    if (countryCode === "IN") return value.length === 10
    if (countryCode === "US" || countryCode === "CA") return value.length === 10
    if (countryCode === "GB") return value.length >= 10 && value.length <= 11
    return value.length >= 8 && value.length <= 15
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Select value={countryCode} onValueChange={onCountryChange}>
          <SelectTrigger className="w-32">
            <SelectValue>
              <div className="flex items-center gap-2">
                <span>{selectedCountry.flag}</span>
                <span className="text-sm">{selectedCountry.dialCode}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {countries.map((country) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{country.dialCode}</span>
                  <span className="text-sm text-gray-600">{country.name}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="tel"
          value={value}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          className={`flex-1 ${error ? "border-red-500" : ""} ${value && isValidLength() ? "border-green-500" : ""}`}
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {value && !isValidLength() && (
        <p className="text-sm text-yellow-600">
          {countryCode === "IN" ? "Phone number should be 10 digits" : "Please enter a valid phone number"}
        </p>
      )}
    </div>
  )
}
