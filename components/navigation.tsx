"use client"

import { useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LayoutDashboard,
  Server,
  Users,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  Plus,
  List,
  ChevronDown,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import GlobalSearch from "@/components/global-search"
import { logout } from "@/app/actions/auth"

interface NavigationProps {
  userRole: string | null
  userName: string | null
}

export default function Navigation({ userRole, userName }: NavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [resourcesExpanded, setResourcesExpanded] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!userRole || pathname === "/login") {
    return null
  }

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: ["admin", "poweruser", "user"],
    },
    {
      label: "Resources",
      icon: Server,
      roles: ["admin", "poweruser", "user"],
      submenu: [
        {
          label: "List All Resources",
          icon: List,
          href: "/resources",
          roles: ["admin", "poweruser", "user"],
        },
        {
          label: "Register New Resource",
          icon: Plus,
          href: "/resources/register",
          roles: ["admin", "poweruser"],
        },
      ],
    },
    {
      label: "Users & Roles",
      icon: Users,
      href: "/users",
      roles: ["admin", "poweruser"],
    },
    {
      label: "Search",
      icon: Search,
      href: "/search",
      roles: ["admin", "poweruser", "user"],
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      roles: ["admin", "poweruser", "user"],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(userRole))

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3498DB] rounded-lg flex items-center justify-center">
            <Server className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="text-white font-bold text-lg">संसाधन पोर्टल</h1>
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">{userName?.charAt(0) || "U"}</span>
          </div>
          {!isCollapsed && (
            <div>
              <p className="text-white font-medium text-sm">{userName}</p>
              <Badge variant="secondary" className="text-xs">
                {userRole === "admin" ? "Admin" : userRole === "poweruser" ? "Power User" : "User"}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Global Search - Desktop */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-700">
          <GlobalSearch className="w-full" placeholder="Search..." />
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredMenuItems.map((item) => {
          if (item.submenu) {
            return (
              <div key={item.label}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700",
                    isCollapsed ? "px-2" : "px-3",
                  )}
                  onClick={() => setResourcesExpanded(!resourcesExpanded)}
                >
                  <item.icon className="h-5 w-5" />
                  {!isCollapsed && (
                    <>
                      <span className="ml-3">{item.label}</span>
                      <div className="ml-auto">
                        {resourcesExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </div>
                    </>
                  )}
                </Button>
                {resourcesExpanded && !isCollapsed && (
                  <div className="ml-6 mt-2 space-y-1">
                    {item.submenu
                      .filter((subItem) => subItem.roles.includes(userRole))
                      .map((subItem) => (
                        <Link key={subItem.href} href={subItem.href}>
                          <Button
                            variant="ghost"
                            className={cn(
                              "w-full justify-start text-gray-400 hover:text-white hover:bg-gray-700 text-sm",
                              pathname === subItem.href && "bg-gray-700 text-white",
                            )}
                          >
                            <subItem.icon className="h-4 w-4" />
                            <span className="ml-3">{subItem.label}</span>
                          </Button>
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            )
          }

          return (
            <Link key={item.href} href={item.href!}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700",
                  pathname === item.href && "bg-gray-700 text-white",
                  isCollapsed ? "px-2" : "px-3",
                )}
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && <span className="ml-3">{item.label}</span>}
              </Button>
            </Link>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-700">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-gray-300 hover:text-white hover:bg-gray-700",
            isCollapsed ? "px-2" : "px-3",
          )}
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogOut className="h-5 w-5" />}
          {!isCollapsed && <span className="ml-3">{isLoggingOut ? "Logging out..." : "Logout"}</span>}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-[#2C3E50] text-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3498DB] rounded-lg flex items-center justify-center">
              <Server className="w-5 h-5 text-white" />
            </div>
            <h1 className="font-bold text-lg">ResourcePortal</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="text-white hover:bg-gray-700"
          >
            {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        {/* Global Search - Mobile */}
        <GlobalSearch className="w-full" placeholder="Search..." />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="w-64 h-full bg-[#2C3E50]">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden lg:flex flex-col bg-[#2C3E50] transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#3498DB] rounded-lg flex items-center justify-center">
                <Server className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-white font-bold text-lg">ResourcePortal</h1>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-gray-700"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        <SidebarContent />
      </div>
    </>
  )
}
