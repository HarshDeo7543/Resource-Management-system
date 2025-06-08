"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, Eye, Edit, Trash2, X, Clock, User, Server } from "lucide-react"
import Link from "next/link"

// Mock data for search
const mockResources = [
  {
    id: 1,
    regNumber: "PC-REG-2025-001",
    type: "PC",
    assignedUser: "Harsh Deo",
    userRole: "Admin",
    dateAssigned: "2025-01-01",
    location: "Room 305",
    status: "Active",
    manufacturer: "Dell",
    model: "OptiPlex 7090",
    serialNumber: "DL001234",
  },
  {
    id: 2,
    regNumber: "LAPTOP-REG-2024-089",
    type: "Laptop",
    assignedUser: "Rahul Sharma",
    userRole: "User",
    dateAssigned: "2024-12-15",
    location: "Room 412",
    status: "Active",
    manufacturer: "HP",
    model: "EliteBook 840",
    serialNumber: "HP567890",
  },
  {
    id: 3,
    regNumber: "SERVER-REG-2025-002",
    type: "Server",
    assignedUser: "Power User",
    userRole: "Power User",
    dateAssigned: "2025-01-04",
    location: "Server Room",
    status: "Active",
    manufacturer: "HPE",
    model: "ProLiant DL380",
    serialNumber: "HPE123456",
  },
  {
    id: 4,
    regNumber: "PRINTER-REG-2024-156",
    type: "Printer",
    assignedUser: "Office Admin",
    userRole: "User",
    dateAssigned: "2024-11-20",
    location: "Room 201",
    status: "Retired",
    manufacturer: "Canon",
    model: "ImageRunner 2530i",
    serialNumber: "CN789012",
  },
]

const mockUsers = [
  {
    id: 1,
    name: "Harsh Deo",
    email: "harshdeo7543@gmail.com",
    role: "Admin",
    designation: "System Administrator",
    dateCreated: "2024-01-01",
    roomNumber: "Room 305",
  },
  {
    id: 2,
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    role: "User",
    designation: "Software Developer",
    dateCreated: "2024-06-15",
    roomNumber: "Room 412",
  },
  {
    id: 3,
    name: "Power User",
    email: "poweruser@example.com",
    role: "Power User",
    designation: "Team Lead",
    dateCreated: "2024-03-10",
    roomNumber: "Room 301",
  },
  {
    id: 4,
    name: "Office Admin",
    email: "admin@example.com",
    role: "User",
    designation: "Administrative Assistant",
    dateCreated: "2024-08-20",
    roomNumber: "Room 201",
  },
]

// Recent searches storage
const getRecentSearches = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("recentSearches")
    return stored ? JSON.parse(stored) : []
  }
  return []
}

const saveRecentSearch = (query: string) => {
  if (typeof window !== "undefined" && query.trim()) {
    const recent = getRecentSearches()
    const updated = [query, ...recent.filter((s: string) => s !== query)].slice(0, 5)
    localStorage.setItem("recentSearches", JSON.stringify(updated))
  }
}

export default function SearchPage() {
  const [userRole, setUserRole] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [resourceTypeFilter, setResourceTypeFilter] = useState("all")
  const [resourceStatusFilter, setResourceStatusFilter] = useState("all")
  const [userRoleFilter, setUserRoleFilter] = useState("all")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const role = localStorage.getItem("userRole")
    // if (!role) {
    //   router.push("/login")
    //   return
    // }
    setUserRole(role)
    setRecentSearches(getRecentSearches())

    // Handle URL search params
    const urlQuery = searchParams.get("q")
    if (urlQuery) {
      setQuery(urlQuery)
      handleSearch(urlQuery)
    }
  }, [router, searchParams])

  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery)
      setRecentSearches(getRecentSearches())
      setShowSuggestions(false)

      // Update URL
      const url = new URL(window.location.href)
      url.searchParams.set("q", searchQuery)
      window.history.pushState({}, "", url.toString())
    }
  }

  const clearRecentSearches = () => {
    localStorage.removeItem("recentSearches")
    setRecentSearches([])
  }

  // Search suggestions based on current input
  const suggestions = useMemo(() => {
    if (!query.trim()) return []

    const resourceSuggestions = mockResources
      .filter(
        (resource) =>
          resource.regNumber.toLowerCase().includes(query.toLowerCase()) ||
          resource.assignedUser.toLowerCase().includes(query.toLowerCase()) ||
          resource.type.toLowerCase().includes(query.toLowerCase()) ||
          resource.manufacturer.toLowerCase().includes(query.toLowerCase()) ||
          resource.model.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 3)
      .map((resource) => ({
        type: "resource",
        text: resource.regNumber,
        subtitle: `${resource.type} - ${resource.assignedUser}`,
        icon: Server,
      }))

    const userSuggestions = mockUsers
      .filter(
        (user) =>
          user.name.toLowerCase().includes(query.toLowerCase()) ||
          user.email.toLowerCase().includes(query.toLowerCase()) ||
          user.designation.toLowerCase().includes(query.toLowerCase()),
      )
      .slice(0, 3)
      .map((user) => ({
        type: "user",
        text: user.name,
        subtitle: `${user.designation} - ${user.role}`,
        icon: User,
      }))

    return [...resourceSuggestions, ...userSuggestions]
  }, [query])

  // Filtered search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return { resources: [], users: [] }

    const filteredResources = mockResources.filter((resource) => {
      const matchesQuery =
        resource.regNumber.toLowerCase().includes(query.toLowerCase()) ||
        resource.assignedUser.toLowerCase().includes(query.toLowerCase()) ||
        resource.type.toLowerCase().includes(query.toLowerCase()) ||
        resource.manufacturer.toLowerCase().includes(query.toLowerCase()) ||
        resource.model.toLowerCase().includes(query.toLowerCase()) ||
        resource.location.toLowerCase().includes(query.toLowerCase())

      const matchesType = resourceTypeFilter === "all" || resource.type === resourceTypeFilter
      const matchesStatus = resourceStatusFilter === "all" || resource.status === resourceStatusFilter

      // For regular users, only show their assigned resources
      if (userRole === "user") {
        return matchesQuery && matchesType && matchesStatus && resource.assignedUser === "Regular User"
      }

      return matchesQuery && matchesType && matchesStatus
    })

    const filteredUsers = mockUsers.filter((user) => {
      const matchesQuery =
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.designation.toLowerCase().includes(query.toLowerCase()) ||
        user.roomNumber.toLowerCase().includes(query.toLowerCase())

      const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter

      return matchesQuery && matchesRole
    })

    return { resources: filteredResources, users: filteredUsers }
  }, [query, resourceTypeFilter, resourceStatusFilter, userRoleFilter, userRole])

  const totalResults = searchResults.resources.length + searchResults.users.length

  // if (!userRole) {
  //   return <div>Loading...</div>
  // }

  const canEdit = userRole === "admin" || userRole === "poweruser"
  const canDelete = userRole === "admin"

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3E50]">Search</h1>
          <p className="text-gray-600">Search resources and users across the system</p>
        </div>

        {/* Search Input */}
        <Card>
          <CardContent className="p-6">
            <div className="relative">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search resources or users..."
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                    if (e.key === "Escape") {
                      setShowSuggestions(false)
                    }
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="pl-10 pr-12 h-12 text-lg"
                />
                <Button
                  onClick={() => handleSearch()}
                  className="absolute right-2 top-2 h-8 bg-[#3498DB] hover:bg-[#2980B9]"
                >
                  Search
                </Button>
              </div>

              {/* Search Suggestions Dropdown */}
              {showSuggestions && (query.trim() || recentSearches.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {/* Recent Searches */}
                  {!query.trim() && recentSearches.length > 0 && (
                    <div className="p-3 border-b">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Recent Searches</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearRecentSearches}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Clear
                        </Button>
                      </div>
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(search)
                            handleSearch(search)
                          }}
                          className="flex items-center gap-2 w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{search}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Live Suggestions */}
                  {query.trim() && suggestions.length > 0 && (
                    <div className="p-3">
                      <span className="text-sm font-medium text-gray-700 mb-2 block">Suggestions</span>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(suggestion.text)
                            handleSearch(suggestion.text)
                          }}
                          className="flex items-center gap-3 w-full p-2 text-left hover:bg-gray-50 rounded"
                        >
                          <suggestion.icon className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium">{suggestion.text}</div>
                            <div className="text-xs text-gray-500">{suggestion.subtitle}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {query.trim() && suggestions.length === 0 && (
                    <div className="p-4 text-center text-gray-500 text-sm">No suggestions found</div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {query.trim() && (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Search Results</h2>
                <p className="text-gray-600">
                  {totalResults} result{totalResults !== 1 ? "s" : ""} for "{query}"
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setQuery("")
                  setShowSuggestions(false)
                  const url = new URL(window.location.href)
                  url.searchParams.delete("q")
                  window.history.pushState({}, "", url.toString())
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Search
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Results ({totalResults})</TabsTrigger>
                <TabsTrigger value="resources">Resources ({searchResults.resources.length})</TabsTrigger>
                <TabsTrigger value="users">Users ({searchResults.users.length})</TabsTrigger>
              </TabsList>

              {/* Filters */}
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Filter className="h-5 w-5" />
                    Filters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(activeTab === "all" || activeTab === "resources") && (
                      <>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Resource Type</label>
                          <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
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
                          <label className="text-sm font-medium">Resource Status</label>
                          <Select value={resourceStatusFilter} onValueChange={setResourceStatusFilter}>
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
                      </>
                    )}

                    {(activeTab === "all" || activeTab === "users") && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">User Role</label>
                        <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                          <SelectTrigger>
                            <SelectValue placeholder="All roles" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Power User">Power User</SelectItem>
                            <SelectItem value="User">User</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="mt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setResourceTypeFilter("all")
                        setResourceStatusFilter("all")
                        setUserRoleFilter("all")
                      }}
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <TabsContent value="all" className="space-y-6">
                {searchResults.resources.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Resources ({searchResults.resources.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResourceTable resources={searchResults.resources} canEdit={canEdit} canDelete={canDelete} />
                    </CardContent>
                  </Card>
                )}

                {searchResults.users.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Users ({searchResults.users.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <UserTable users={searchResults.users} canEdit={canEdit} canDelete={canDelete} />
                    </CardContent>
                  </Card>
                )}

                {totalResults === 0 && (
                  <Card>
                    <CardContent className="text-center py-12">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                      <p className="text-gray-600">
                        Try adjusting your search terms or filters to find what you're looking for.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="resources">
                <Card>
                  <CardHeader>
                    <CardTitle>Resources ({searchResults.resources.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {searchResults.resources.length > 0 ? (
                      <ResourceTable resources={searchResults.resources} canEdit={canEdit} canDelete={canDelete} />
                    ) : (
                      <div className="text-center py-12">
                        <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                        <p className="text-gray-600">No resources match your search criteria.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>Users ({searchResults.users.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {searchResults.users.length > 0 ? (
                      <UserTable users={searchResults.users} canEdit={canEdit} canDelete={canDelete} />
                    ) : (
                      <div className="text-center py-12">
                        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                        <p className="text-gray-600">No users match your search criteria.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}

        {/* Empty State */}
        {!query.trim() && (
          <Card>
            <CardContent className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Search Resources and Users</h3>
              <p className="text-gray-600 mb-6">
                Enter a search term to find resources, users, or any related information across the system.
              </p>
              <div className="text-sm text-gray-500">
                <p className="mb-2">You can search for:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Resource registration numbers (e.g., PC-REG-2025-001)</li>
                  <li>User names and email addresses</li>
                  <li>Resource types and manufacturers</li>
                  <li>Room numbers and locations</li>
                  <li>Designations and roles</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Resource Table Component
function ResourceTable({
  resources,
  canEdit,
  canDelete,
}: {
  resources: any[]
  canEdit: boolean
  canDelete: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Registration Number</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Assigned User</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {resources.map((resource) => (
            <TableRow key={resource.id}>
              <TableCell className="font-medium">
                <Link
                  href={`/resources/${resource.id}`}
                  className="text-blue-600 hover:underline"
                >
                  {resource.regNumber}
                </Link>
              </TableCell>
              <TableCell>{resource.type}</TableCell>
              <TableCell>{resource.assignedUser}</TableCell>
              <TableCell>{resource.location}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    resource.status === "Active" ? "default" : "secondary"
                  }
                >
                  {resource.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/resources/${resource.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {canEdit && (
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// User Table Component
function UserTable({
  users,
  canEdit,
  canDelete,
}: {
  users: any[]
  canEdit: boolean
  canDelete: boolean
}) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <Link href={`/users/${user.id}`} className="text-blue-600 hover:underline">
                  {user.name}
                </Link>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={user.role === "Admin" ? "default" : user.role === "Power User" ? "secondary" : "outline"}
                >
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>{user.designation}</TableCell>
              <TableCell>{user.roomNumber}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  {canEdit && (
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete && user.role !== "Admin" && (
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
