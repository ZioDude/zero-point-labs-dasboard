"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  FileText, 
  Settings, 
  Users,
  LogOut
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const sidebarItems = [
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
  {
    title: 'Forms',
    href: '/dashboard/forms',
    icon: FileText,
  },
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r">
      <div className="flex h-16 items-center px-6 border-b">
        <h1 className="text-xl font-semibold">Analytics Pro</h1>
      </div>
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => console.log('Sign out')}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
} 