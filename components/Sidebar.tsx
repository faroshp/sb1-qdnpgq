"use client"

   import Link from 'next/link'
   import { usePathname } from 'next/navigation'
   import { cn } from "@/lib/utils"
   import { Button } from "@/components/ui/button"
   import { LayoutDashboard, Users, Settings, FileText, BarChart2, LogOut } from 'lucide-react'

   const navItems = [
     { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
     { href: '/log-entry', label: 'Log Entry', icon: FileText },
     { href: '/all-employees', label: 'All Employees', icon: Users },
     { href: '/ai-studio', label: 'AI Studio', icon: BarChart2 },
     { href: '/settings', label: 'Settings', icon: Settings },
   ]

   export default function Sidebar() {
     const pathname = usePathname()

     return (
       <div className="flex flex-col w-64 bg-white border-r">
         <div className="flex items-center justify-center h-16 border-b">
           <span className="text-2xl font-semibold">NexLog</span>
         </div>
         <nav className="flex-1 overflow-y-auto">
           <ul className="p-4 space-y-2">
             {navItems.map((item) => (
               <li key={item.href}>
                 <Link href={item.href} passHref>
                   <Button
                     variant="ghost"
                     className={cn(
                       "w-full justify-start",
                       pathname === item.href && "bg-gray-100"
                     )}
                   >
                     <item.icon className="mr-2 h-4 w-4" />
                     {item.label}
                   </Button>
                 </Link>
               </li>
             ))}
           </ul>
         </nav>
         <div className="p-4 border-t">
           <Button variant="ghost" className="w-full justify-start text-red-500">
             <LogOut className="mr-2 h-4 w-4" />
             Logout
           </Button>
         </div>
       </div>
     )
   }