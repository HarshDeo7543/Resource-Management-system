"use client"

import { useToast } from "./use-toast"
import { X } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm">
      {toasts.map((toast, index) => (
        <div
          key={index}
          className={`p-4 rounded-md shadow-md flex items-start justify-between ${
            toast.variant === "destructive" ? "bg-red-600 text-white" : "bg-white"
          }`}
        >
          <div>
            {toast.title && <h3 className="font-medium">{toast.title}</h3>}
            {toast.description && <p className="text-sm mt-1">{toast.description}</p>}
          </div>
          <button className="text-gray-500 hover:text-gray-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
