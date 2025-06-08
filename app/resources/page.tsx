import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"
import { getUserRole, requireAuth } from "@/app/actions/auth"
import ResourcesTable from "@/components/resources-table"
import ResourcesFilter from "@/components/resources-filter"
import { Skeleton } from "@/components/ui/skeleton"

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  await requireAuth()
  const userRole = await getUserRole()

  const searchTerm = typeof searchParams.search === "string" ? searchParams.search : ""
  const typeFilter = typeof searchParams.type === "string" ? searchParams.type : "all"
  const statusFilter = typeof searchParams.status === "string" ? searchParams.status : "all"

  const canEdit = userRole === "admin" || userRole === "poweruser"
  const canDelete = userRole === "admin"

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-[#2C3E50]">All Resources</h1>
            <p className="text-gray-600">Manage and view resource assignments</p>
          </div>
          {canEdit && (
            <Link href="/resources/register">
              <Button className="bg-[#3498DB] hover:bg-[#2980B9]">
                <Plus className="mr-2 h-4 w-4" />
                Register New Resource
              </Button>
            </Link>
          )}
        </div>

        <Suspense fallback={<FilterSkeleton />}>
          <ResourcesFilter searchTerm={searchTerm} typeFilter={typeFilter} statusFilter={statusFilter} />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<TableSkeleton />}>
              <ResourcesTable
                searchTerm={searchTerm}
                typeFilter={typeFilter}
                statusFilter={statusFilter}
                canEdit={canEdit}
                canDelete={canDelete}
              />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function FilterSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex items-end">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-9 w-24" />
      </div>
      <div className="border rounded-md">
        <div className="h-12 px-4 border-b flex items-center bg-muted/50">
          <Skeleton className="h-4 w-full" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 px-4 flex items-center border-b last:border-0">
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
