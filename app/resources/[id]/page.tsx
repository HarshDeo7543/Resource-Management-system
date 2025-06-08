import { getResourceById } from "@/app/actions/resources"
import { getActivitiesByEntity } from "@/app/actions/activities"
import { requireAuth, getUserRole } from "@/app/actions/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, ArrowLeft, Server, Calendar, MapPin, PenToolIcon as Tool, User } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { notFound } from "next/navigation"

export default async function ResourceDetailPage({ params }: { params: { id: string } }) {
  await requireAuth()
  const userRole = await getUserRole()

  const resourceId = Number.parseInt(params.id)
  const { resource } = await getResourceById(resourceId)
  const { activities } = await getActivitiesByEntity("resource", resourceId)

  if (!resource) {
    notFound()
  }

  const canEdit = userRole === "admin" || userRole === "poweruser"

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Link href="/resources">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-[#2C3E50]">{resource.reg_number}</h1>
            <Badge variant={resource.status === "Active" ? "default" : "secondary"}>{resource.status}</Badge>
          </div>
          {canEdit && (
            <Link href={`/resources/${resource.id}/edit`}>
              <Button className="bg-[#3498DB] hover:bg-[#2980B9]">
                <Edit className="mr-2 h-4 w-4" />
                Edit Resource
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Resource Information</CardTitle>
              <CardDescription>Basic details and specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                  <Server className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold">{resource.resource_type}</h3>
                <p className="text-gray-500">
                  {resource.manufacturer} {resource.model}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-md">
                    <Server className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Serial Number</p>
                    <p className="text-sm text-gray-600">{resource.serial_number}</p>
                  </div>
                </div>

                {resource.assigned_user_name && (
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-md">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Assigned To</p>
                      <p className="text-sm text-gray-600">{resource.assigned_user_name}</p>
                    </div>
                  </div>
                )}

                {resource.location && (
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-md">
                      <MapPin className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-gray-600">{resource.location}</p>
                    </div>
                  </div>
                )}

                {resource.purchase_date && (
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Purchase Date</p>
                      <p className="text-sm text-gray-600">{new Date(resource.purchase_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {resource.warranty_expiry && (
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-md">
                      <Calendar className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Warranty Expiry</p>
                      <p className="text-sm text-gray-600">{new Date(resource.warranty_expiry).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}

                {resource.warranty_provider && (
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded-md">
                      <Tool className="h-4 w-4 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Warranty Provider</p>
                      <p className="text-sm text-gray-600">{resource.warranty_provider}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="bg-gray-100 p-2 rounded-md">
                    <Calendar className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Registration Date</p>
                    <p className="text-sm text-gray-600">
                      {formatDistanceToNow(new Date(resource.date_created), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <Tabs defaultValue="specs">
                <TabsList>
                  <TabsTrigger value="specs">Technical Specifications</TabsTrigger>
                  <TabsTrigger value="activities">Activity History ({activities.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="specs">
                <TabsContent value="specs" className="mt-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Technical Specifications */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Hardware Details</h3>
                      <div className="space-y-2">
                        {resource.processor && (
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Processor</span>
                            <span>{resource.processor}</span>
                          </div>
                        )}
                        {resource.ram && (
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">RAM</span>
                            <span>{resource.ram}</span>
                          </div>
                        )}
                        {resource.storage && (
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Storage</span>
                            <span>{resource.storage}</span>
                          </div>
                        )}
                        {resource.operating_system && (
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Operating System</span>
                            <span>{resource.operating_system}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Support Information */}
                    <div className="space-y-4">
                      <h3 className="font-medium">Support Information</h3>
                      <div className="space-y-2">
                        {resource.support_contact && (
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-600">Support Contact</span>
                            <span>{resource.support_contact}</span>
                          </div>
                        )}
                        {resource.comments && (
                          <div className="space-y-2 pt-2">
                            <span className="text-gray-600">Comments</span>
                            <p className="text-sm">{resource.comments}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
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
                            <p className="text-sm text-gray-600">by {activity.user_name}</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(activity.date_performed), { addSuffix: true })}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No activity history available.</p>
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
