"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, Search } from "lucide-react"

export default function ResourcesFilter({
  searchTerm = "",
  typeFilter = "all",
  statusFilter = "all",
}: {
  searchTerm?: string
  typeFilter?: string
  statusFilter?: string
}) {
  const [search, setSearch] = useState(searchTerm)
  const [type, setType] = useState(typeFilter)
  const [status, setStatus] = useState(statusFilter)

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

    if (type !== "all") {
      params.set("type", type)
    } else {
      params.delete("type")
    }

    if (status !== "all") {
      params.set("status", status)
    } else {
      params.delete("status")
    }

    router.push(`${pathname}?${params.toString()}`)
  }

  // Reset filters
  const resetFilters = () => {
    setSearch("")
    setType("all")
    setStatus("all")
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
        <CardDescription>Search and filter resources</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Registration number, user, type..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Resource Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="PC">PC</SelectItem>
                  <SelectItem value="Laptop">Laptop</SelectItem>
                  <SelectItem value="Server">Server</SelectItem>
                  <SelectItem value="Printer">Printer</SelectItem>
                  <SelectItem value="Switch">Switch</SelectItem>
                  <SelectItem value="Router">Router</SelectItem>
                  <SelectItem value="Display">Display</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Retired">Retired</SelectItem>
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
