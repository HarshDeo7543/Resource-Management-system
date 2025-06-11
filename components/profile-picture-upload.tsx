"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Upload, X, User } from "lucide-react"

interface ProfilePictureUploadProps {
  value?: string
  onChange: (file: File | null) => void
  userName?: string
}

export default function ProfilePictureUpload({ value, onChange, userName }: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(value || null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPEG, PNG, etc.)")
      return
    }

    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      setError("File size must be less than 2MB")
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    onChange(file)
  }

  const handleRemove = () => {
    setPreview(null)
    setError(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          {preview ? (
            <AvatarImage src={preview || "/placeholder.svg"} alt="Profile picture" />
          ) : (
            <AvatarFallback className="text-lg">
              {userName ? userName.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
            </AvatarFallback>
          )}
        </Avatar>

        <div className="space-y-2">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleUploadClick} className="text-sm">
              <Upload className="h-4 w-4 mr-2" />
              {preview ? "Change Picture" : "Upload Picture"}
            </Button>
            {preview && (
              <Button type="button" variant="outline" onClick={handleRemove} className="text-sm text-red-600">
                <X className="h-4 w-4 mr-2" />
                Remove
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">JPEG or PNG, max 2MB</p>
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
    </div>
  )
}
