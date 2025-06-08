import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Server, Plus, Eye, UserPlus, Search } from "lucide-react"
import Link from "next/link"
import { getUserRole, getUserName, requireAuth } from "@/app/actions/auth"
import { getDashboardStats } from "@/app/actions/resources"
import { getUserStats } from "@/app/actions/users"
import { getRecentActivities } from "@/app/actions/activities"
import { formatDistanceToNow } from "date-fns"
import { getResourcesByUserId } from "@/app/actions/resources" // Import getResourcesByUserId

export default async function DashboardPage() {
  const user = await requireAuth()
  const userRole = await getUserRole()
  const userName = await getUserName()

  const { stats: resourceStats } = await getDashboardStats()
  const { stats: userStats } = await getUserStats()
  const { activities } = await getRecentActivities(4)

  const AdminDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2C3E50]">Admin Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userName}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resourceStats.totalResources}</div>
            <p className="text-xs text-muted-foreground">
              {resourceStats.resourcesByStatus.Active} active, {resourceStats.resourcesByStatus.Retired} retired
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalUsers}</div>
            <div className="flex gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">
                {userStats.userCounts.admin} Admin
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {userStats.userCounts.poweruser} Power
              </Badge>
              <Badge variant="secondary" className="text-xs">
                {userStats.userCounts.user} User
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resource Types</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(resourceStats.resourcesByType).length}</div>
            <p className="text-xs text-muted-foreground">Different types of resources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Resources</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resourceStats.recentResources.length}</div>
            <p className="text-xs text-muted-foreground">Added in the last 7 days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest resource and user activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
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
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/resources/register">
              <Button className="w-full justify-start bg-[#3498DB] hover:bg-[#2980B9]">
                <Plus className="mr-2 h-4 w-4" />
                Register New Resource
              </Button>
            </Link>
            <Link href="/users/create">
              <Button variant="outline" className="w-full justify-start">
                <UserPlus className="mr-2 h-4 w-4" />
                Create New User
              </Button>
            </Link>
            <Link href="/resources">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                View All Resources
              </Button>
            </Link>
            <Link href="/users">
              <Button variant="outline" className="w-full justify-start">
                <Users className="mr-2 h-4 w-4" />
                View All Users
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const PowerUserDashboard = () => (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#2C3E50]">Power User Dashboard</h1>
        <p className="text-gray-600">Welcome back, {userName}!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Resources Assigned to My Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resourceStats.totalResources}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Users Under Supervision</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.userCounts.user}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activities.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Resources by Type</h3>
              <div className="mt-2 space-y-2">
                {Object.entries(resourceStats.resourcesByType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span>{type}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Recent Resources</h3>
              <p className="text-2xl font-bold text-green-600">{resourceStats.recentResources.length}</p>
              <Link href="/resources?filter=recent" className="text-sm text-blue-600 hover:underline">
                Review now →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/resources/register">
              <Button className="w-full justify-start bg-[#3498DB] hover:bg-[#2980B9]">
                <Plus className="mr-2 h-4 w-4" />
                Register New Resource
              </Button>
            </Link>
            <Link href="/resources">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="mr-2 h-4 w-4" />
                Edit Assigned Resources
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" className="w-full justify-start">
                <Search className="mr-2 h-4 w-4" />
                Search Resources by User
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const UserDashboard = async () => {
    const { resources } = await getResourcesByUserId(user.id)

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#2C3E50]">User Dashboard</h1>
          <p className="text-gray-600">Welcome back, {userName}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Resources Assigned to Me</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resources.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activities.filter((a) => a.performed_by === user.id).length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Resources</CardTitle>
            <CardDescription>Resources currently assigned to you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {resources.length > 0 ? (
                resources.map((resource) => (
                  <div key={resource.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{resource.reg_number}</p>
                      <p className="text-sm text-gray-600">
                        {resource.resource_type} • Assigned: {new Date(resource.date_created).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={resource.status === "Active" ? "default" : "secondary"}>{resource.status}</Badge>
                      <Link href={`/resources/${resource.id}`}>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No resources assigned to you</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {userRole === "admin" && <AdminDashboard />}
        {userRole === "poweruser" && <PowerUserDashboard />}
        {userRole === "user" && <UserDashboard />}
      </div>
    </div>
  )
}
