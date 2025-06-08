import { getUserById } from "@/app/actions/users"
import { getActivitiesByUser } from "@/app/actions/activities"
import { getResourcesByUserId } from "@/app/actions/resources"
import { requireRole, getUserRole } from "@/app/actions/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, ArrowLeft, User, Calendar, MapPin, CreditCard, FileText } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { notFound } from "next/navigation"

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  // Only admin and power users can view user details
  await requireRole(["admin", "poweruser"])
  const userRole = await getUserRole()

  const userId = Number.parseInt(params.id)
  const { user } = await getUserById(userId)
  const { activities } = await getActivitiesByUser(userId)
  const { resources } = await getResourcesByUserId(userId)

  if (!user) {
    notFound()
  }

  const canEdit = userRole === "admin"

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/users">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-[#2C3E50]">{user.name}</h1>
            <Badge variant={user.role === "admin" ? "default" : user.role === "poweruser" ? "secondary" : "outline"}>
              {user.role === "admin" ? "Admin" : user.role === "poweruser" ? "Power User" : "User"}
            </Badge>
          </div>
          {canEdit && (
            <Link href={`/users/${user.id}/edit`}>
              <Button className="bg-[#3498DB] hover:bg-[#2980B9]">
                <Edit className="mr-2 h-4 w-4" />
                Edit User
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>User Information</CardTitle>
              <CardDescription>Personal and account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-gray-500">{user.designation}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-md">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                </div>

                {user.dob && (
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Date of Birth</p>
                      <p className="text-sm text-gray-600">{new Date(user.dob).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {user.room_number && (
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-md">
                      <MapPin className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Room / Office</p>
                      <p className="text-sm text-gray-600">{user.room_number}</p>
                    </div>
                  </div>
                )}

                {user.aadhar_number && (
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-md">
                      <CreditCard className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Aadhar Number</p>
                      <p className="text-sm text-gray-600">{user.aadhar_number}</p>
                    </div>
                  </div>
                )}

                {user.pan_number && (
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-md">
                      <FileText className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">PAN Number</p>
                      <p className="text-sm text-gray-600">{user.pan_number}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Account Created</p>
                    <p className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(user.date_created), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <Tabs defaultValue="resources">
                <TabsList>
                  <TabsTrigger value="resources">Assigned Resources ({resources.length})</TabsTrigger>
                  <TabsTrigger value="activities">Recent Activities ({activities.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="resources">
                <TabsContent value="resources" className="mt-0">
                  {resources.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4">Registration Number</th>
                            <th className="text-left py-3 px-4">Type</th>
                            <th className="text-left py-3 px-4">Status</th>
                            <th className="text-left py-3 px-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resources.map((resource) => (
                            <tr key={resource.id} className="border-b">
                              <td className="py-3 px-4">
                                <Link href={`/resources/${resource.id}`} className="text-blue-600 hover:underline">
                                  {resource.reg_number}
                                </Link>
                              </td>
                              <td className="py-3 px-4">{resource.resource_type}</td>
                              <td className="py-3 px-4">
                                <Badge variant={resource.status === "Active" ? "default" : "secondary"}>
                                  {resource.status}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Link href={`/resources/${resource.id}`}>
                                  <Button size="sm" variant="outline">
                                    View Details
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No resources assigned to this user.</p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="activities" className="mt-0">
                  {activities.length > 0 ? (
                    <div className="space-y-4">
                      {activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                        >
                          <div>
                            <p className="font-medium">
                              {activity.action} {activity.entity_type} {activity.details ? `(${activity.details})` : ""}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(activity.date_performed), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No recent activities for this user.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
