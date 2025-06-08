"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Clock, User, Server, X } from "lucide-react"
import { cn } from "@/lib/utils"

// Mock data for search suggestions
const mockResources = [
  { id: 1, regNumber: "PC-REG-2025-001", type: "PC", assignedUser: "Harsh Deo", manufacturer: "Dell", model: "OptiPlex 7090" },
  { id: 2, regNumber: "LAPTOP-REG-2024-089", type: "Laptop", assignedUser: "Rahul Sharma", manufacturer: "HP", model: "EliteBook 840" },
  { id: 3, regNumber: "SERVER-REG-2025-002", type: "Server", assignedUser: "Power User", manufacturer: "HPE", model: "ProLiant DL380" },
]

const mockUsers = [
  { id: 1, name: "Harsh Deo", email: "harshdeo7543@gmail.com", role: "Admin", designation: "System Administrator" },
  { id: 2, name: "Rahul Sharma", email: "rahul.sharma@example.com", role: "User", designation: "Software Developer" },
  { id: 3, name: "Power User", email: "poweruser@example.com", role: "Power User", designation: "Team Lead" },
]

type Suggestion = {
  id: number
  type: "resource" | "user"
  text: string
  subtitle: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export default function GlobalSearch({ className, placeholder = "Search..." }: { className?: string; placeholder?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("recentSearches") || "[]"
      setRecentSearches(JSON.parse(stored))
    }
  }, [])

  const saveRecent = (q: string) => {
    const updated = [q, ...recentSearches.filter((r) => r !== q)].slice(0, 5)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
    setRecentSearches(updated)
  }

  const handleSearch = (q: string) => {
    if (!q.trim()) return
    saveRecent(q)
    setShowSuggestions(false)
    setQuery("")
    router.push(`/search?q=${encodeURIComponent(q)}`)
  }

  const suggestions: Suggestion[] = useMemo(() => {
    if (!query.trim()) return []
    const lower = query.toLowerCase()
    const res = mockResources
      .filter((r) => r.regNumber.toLowerCase().includes(lower))
      .slice(0, 3)
      .map((r) => ({ id: r.id, type: "resource" as const, text: r.regNumber, subtitle: r.type, icon: Server }))
    const usr = mockUsers
      .filter((u) => u.name.toLowerCase().includes(lower))
      .slice(0, 3)
      .map((u) => ({ id: u.id, type: "user" as const, text: u.name, subtitle: u.role, icon: User }))
    return [...res, ...usr]
  }, [query, recentSearches])

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true) }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch(query)
            if (e.key === "Escape") setShowSuggestions(false)
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pl-10 pr-4"
        />
      </div>

      {(showSuggestions && (query.trim() || recentSearches.length > 0)) && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 w-full overflow-auto rounded border bg-white shadow-lg">
          {/* Recent Searches */}
          {!query.trim() && recentSearches.map((r, i) => (
            <button
              key={i}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSearch(r)}
              className="flex w-full items-center gap-2 p-2 hover:bg-gray-100 text-sm"
            >
              <Clock className="h-4 w-4 text-gray-400" />
              {r}
            </button>
          ))}

          {/* Live Suggestions */}
          {query.trim() && suggestions.map((s) => (
            <button
              key={`${s.type}-${s.id}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSearch(s.text)}
              className="flex w-full items-center gap-2 p-2 hover:bg-gray-100 rounded text-sm"
            >
              <s.icon className="h-4 w-4 text-gray-400" />
              <div>
                <div className="font-medium">{s.text}</div>
                <div className="text-xs text-gray-500">{s.subtitle}</div>
              </div>
            </button>
          ))}

          {/* No Results */}
          {query.trim() && suggestions.length === 0 && (
            <div className="p-2 text-center text-sm text-gray-500">No matches for “{query}”</div>
          )}
        </div>
      )}
    </div>
  )
}
