"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search } from "lucide-react"

export default function UsersFilter({
  searchTerm = "",
  roleFilter = "all",
}: {
  searchTerm?: string
  roleFilter?: string
}) {
  const [search, setSearch] = useState(searchTerm)
  const [role, setRole] = useState(roleFilter)

  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Update the URL when filters change
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams)

    if (search) {
      params.set("search", search)
    } else {
      params.delete("search")
    }

    if (role !== "all") {
      params.set("role", role)
    } else {
      params.delete("role")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  // Reset filters
  const resetFilters = () => {
    setSearch("")
    setRole("all")
    router.push(pathname)
  }

  // Apply filters when form is submitted
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters & Search
        </CardTitle>
        <CardDescription>Search and filter users</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Name, email, designation..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger>
                  <SelectValue placeholder="All roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="poweruser">Power User</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1">
                Apply Filters
              </Button>
              <Button type="button" variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
