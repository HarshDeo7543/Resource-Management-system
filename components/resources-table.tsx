import { getResources } from "@/app/actions/resources"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Edit } from "lucide-react"
import Link from "next/link"
import DeleteResourceButton from "./delete-resource-button"

export default async function ResourcesTable({
  searchTerm = "",
  typeFilter = "all",
  statusFilter = "all",
  canEdit = false,
  canDelete = false,
}: {
  searchTerm?: string
  typeFilter?: string
  statusFilter?: string
  canEdit?: boolean
  canDelete?: boolean
}) {
  const { resources } = await getResources()

  // Filter resources based on search and filters
  const filteredResources = resources.filter((resource) => {
    const matchesSearch =
      !searchTerm ||
      resource.reg_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.assigned_user_name && resource.assigned_user_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      resource.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (resource.location && resource.location.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = typeFilter === "all" || resource.resource_type === typeFilter
    const matchesStatus = statusFilter === "all" || resource.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  if (filteredResources.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No resources found matching your criteria.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Registration Number</TableHead>
            <TableHead>Resource Type</TableHead>
            <TableHead>Assigned User</TableHead>
            <TableHead>User Role</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredResources.map((resource) => (
            <TableRow key={resource.id}>
              <TableCell className="font-medium">
                <Link href={`/resources/${resource.id}`} className="text-blue-600 hover:underline">
                  {resource.reg_number}
                </Link>
              </TableCell>
              <TableCell>{resource.resource_type}</TableCell>
              <TableCell>{resource.assigned_user_name || "Unassigned"}</TableCell>
              <TableCell>
                {resource.assigned_user_role && (
                  <Badge
                    variant={
                      resource.assigned_user_role === "admin"
                        ? "default"
                        : resource.assigned_user_role === "poweruser"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {resource.assigned_user_role === "admin"
                      ? "Admin"
                      : resource.assigned_user_role === "poweruser"
                        ? "Power User"
                        : "User"}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{resource.location || "N/A"}</TableCell>
              <TableCell>
                <Badge variant={resource.status === "Active" ? "default" : "secondary"}>{resource.status}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Link href={`/resources/${resource.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  {canEdit && (
                    <Link href={`/resources/${resource.id}/edit`}>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {canDelete && <DeleteResourceButton id={resource.id} regNumber={resource.reg_number} />}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
