'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ShoppingCart, Package, BarChart3, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: ShoppingCart, label: 'Point of Sale', href: '/pdv' },
  { icon: Package, label: 'Inventory', href: '/products' },
  { icon: BarChart3, label: 'Reports', href: '/reports' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-20 lg:w-64 bg-slate-900 h-full flex flex-col transition-all duration-300 shrink-0">
      <div className="p-6 flex items-center justify-center lg:justify-start gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
        <span className="text-white font-bold text-xl hidden lg:block">NexusERP</span>
      </div>
      
      <nav className="flex-1 px-4 mt-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl transition-all",
              pathname === item.href 
                ? "bg-blue-600 text-white" 
                : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="font-medium hidden lg:block">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2">
          <Image
            alt="User Avatar"
            width={40}
            height={40}
            className="rounded-full"
            src="https://picsum.photos/seed/user/100"
            referrerPolicy="no-referrer"
          />
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-white">John Doe</p>
            <p className="text-xs text-slate-400">Cashier #01</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
