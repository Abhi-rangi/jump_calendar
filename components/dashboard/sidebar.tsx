"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, Clock, Home, LinkIcon, Settings, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export default function DashboardSidebar() {
  const pathname = usePathname()

  const navItems = [
    {
      href: "/dashboard",
      icon: Home,
      label: "Dashboard",
    },
    {
      href: "/dashboard/calendars",
      icon: Calendar,
      label: "Calendars",
    },
    {
      href: "/dashboard/scheduling",
      icon: Clock,
      label: "Scheduling",
    },
    {
      href: "/dashboard/links",
      icon: LinkIcon,
      label: "Links",
    },
    {
      href: "/dashboard/meetings",
      icon: Users,
      label: "Meetings",
    },
    {
      href: "/dashboard/settings",
      icon: Settings,
      label: "Settings",
    },
  ]

  return (
    <div className="hidden border-r bg-gray-50 md:flex md:w-60 md:flex-col">
      <nav className="flex-1 overflow-auto p-2">
        <ul className="space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "w-full justify-start",
                  pathname === href && "bg-secondary text-secondary-foreground",
                )}
              >
                <Icon className="mr-2 h-5 w-5" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
