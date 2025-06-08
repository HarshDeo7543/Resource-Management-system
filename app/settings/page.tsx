import { requireAuth, getUserRole } from "@/app/actions/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"

export default async function SettingsPage() {
  const user = await requireAuth()
  const userRole = await getUserRole()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3E50]">Settings</h1>
          <p className="text-gray-600">Manage your account and application settings</p>
        </div>

        <Tabs defaultValue="account">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account Settings</TabsTrigger>
            <TabsTrigger value="app">Application Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>View your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">User Profile</h3>
                    <p className="text-sm text-gray-600">Your personal information</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{user.name}</span>
                      <Badge
                        variant={
                          user.role === "admin" ? "default" : user.role === "poweruser" ? "secondary" : "outline"
                        }
                      >
                        {user.role === "admin" ? "Admin" : user.role === "poweruser" ? "Power User" : "User"}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Account Status</h3>
                    <p className="text-sm text-gray-600">Your account status and creation date</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      Active
                    </Badge>
                    <span className="text-sm text-gray-600">
                      Created {formatDistanceToNow(new Date(user.date_created), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Designation</h3>
                    <p className="text-sm text-gray-600">Your job title or role</p>
                  </div>
                  <div>
                    <span className="font-medium">{user.designation}</span>
                  </div>
                </div>

                {user.room_number && (
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Room / Office</h3>
                      <p className="text-sm text-gray-600">Your assigned location</p>
                    </div>
                    <div>
                      <span className="font-medium">{user.room_number}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="app">
            <Card>
              <CardHeader>
                <CardTitle>Application Settings</CardTitle>
                <CardDescription>Configure application preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Application Version</h3>
                    <p className="text-sm text-gray-600">Current version of the application</p>
                  </div>
                  <div>
                    <Badge variant="outline">v1.0.0</Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">Database</h3>
                    <p className="text-sm text-gray-600">Database connection status</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                      Connected
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">User Permissions</h3>
                    <p className="text-sm text-gray-600">Your access level in the system</p>
                  </div>
                  <div>
                    <Badge
                      variant={userRole === "admin" ? "default" : userRole === "poweruser" ? "secondary" : "outline"}
                    >
                      {userRole === "admin"
                        ? "Full Access"
                        : userRole === "poweruser"
                          ? "Extended Access"
                          : "Standard Access"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
