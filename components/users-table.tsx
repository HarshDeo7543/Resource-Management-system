import { getUsers } from "@/app/actions/users"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import Link from "next/link"
import DeleteUserButton from "./delete-user-button"
import { formatDistanceToNow } from "date-fns"

export default async function UsersTable({
  searchTerm = "",
  roleFilter = "all",
  canEdit = false,
  canDelete = false,
}: {
  searchTerm?: string
  roleFilter?: string
  canEdit?: boolean
  canDelete?: boolean
}) {
  const { users } = await getUsers()

  // Filter users based on search and filters
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.designation.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  if (filteredUsers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Designation</TableHead>
            <TableHead>Date Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredUsers.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <Link href={`/users/${user.id}`} className="text-blue-600 hover:underline">
                  {user.name}
                </Link>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge
                  variant={user.role === "admin" ? "default" : user.role === "poweruser" ? "secondary" : "outline"}
                >
                  {user.role === "admin" ? "Admin" : user.role === "poweruser" ? "Power User" : "User"}
                </Badge>
              </TableCell>
              <TableCell>{user.designation}</TableCell>
              <TableCell>{formatDistanceToNow(new Date(user.date_created), { addSuffix: true })}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/users/${user.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {canEdit && (
                    <Link href={`/users/${user.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {canDelete && <DeleteUserButton id={user.id} name={user.name} />}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
