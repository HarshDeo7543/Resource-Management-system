"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Check, X } from "lucide-react"

interface PasswordStrengthMeterProps {
  password: string
  onStrengthChange?: (isValid: boolean) => void
}

interface PasswordRule {
  label: string
  test: (password: string) => boolean
}

const passwordRules: PasswordRule[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "Contains uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "Contains lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "Contains number", test: (p) => /\d/.test(p) },
  { label: "Contains special character", test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
]

export default function PasswordStrengthMeter({ password, onStrengthChange }: PasswordStrengthMeterProps) {
  const [strength, setStrength] = useState(0)
  const [strengthLabel, setStrengthLabel] = useState("")

  useEffect(() => {
    const passedRules = passwordRules.filter((rule) => rule.test(password))
    const strengthScore = passedRules.length
    setStrength(strengthScore)

    let label = ""
    let isValid = false

    if (password.length === 0) {
      label = ""
    } else if (strengthScore <= 2) {
      label = "Weak"
    } else if (strengthScore <= 3) {
      label = "Medium"
    } else if (strengthScore <= 4) {
      label = "Strong"
    } else {
      label = "Very Strong"
      isValid = true
    }

    setStrengthLabel(label)
    onStrengthChange?.(isValid && password.length >= 8)
  }, [password, onStrengthChange])

  if (!password) return null

  const progressValue = (strength / passwordRules.length) * 100

  const getStrengthColor = () => {
    if (strength <= 2) return "bg-red-500"
    if (strength <= 3) return "bg-yellow-500"
    if (strength <= 4) return "bg-blue-500"
    return "bg-green-500"
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Progress value={progressValue} className="h-2" />
        </div>
        <span className={`text-sm font-medium ${getStrengthColor().replace("bg-", "text-")}`}>{strengthLabel}</span>
      </div>

      <div className="space-y-1">
        {passwordRules.map((rule, index) => {
          const passed = rule.test(password)
          return (
            <div
              key={index}
              className={`flex items-center gap-2 text-xs ${passed ? "text-green-600" : "text-gray-500"}`}
            >
              {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
              <span>{rule.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
