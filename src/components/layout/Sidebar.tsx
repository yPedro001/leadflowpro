'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, FileText, BadgeCheck, Upload, Settings, CalendarDays, Lock, LifeBuoy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useProfile } from '@/components/providers/ProfileProvider';

export function Sidebar() {
  const pathname = usePathname();
  const { planConfig } = useProfile();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/analytics', locked: !planConfig.canUseAnalytics },
    { icon: CalendarDays, label: 'Agenda', href: '/agenda', locked: !planConfig.canUseAgenda },
    { icon: Users, label: 'Leads', href: '/leads', locked: false },
    { icon: FileText, label: 'Templates', href: '/templates', locked: false },
    { icon: Upload, label: 'Importar', href: '/import', locked: false },
    { icon: LifeBuoy, label: 'Suporte', href: '/suporte', locked: false },
    { icon: Settings, label: 'Configurações', href: '/settings', locked: false },
  ];

  return (
    <div className="flex flex-col h-screen w-64 bg-slate-950 text-slate-200 border-r border-slate-800 fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-800">
        <div className="bg-gold-600 p-2 rounded-lg shadow-lg shadow-gold-500/20">
          <BadgeCheck className="w-6 h-6 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-white">LeadFlowPro</span>
      </div>

      {/* Navegação */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
        {menuItems.map((item) => {
          if (item.locked) return null; // Não exibe itens bloqueados pelo plano no menu

          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group relative',
                isActive
                  ? 'bg-gold-600/10 text-gold-400 font-medium'
                  : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
              )}
            >
              {isActive && (
                <div className="absolute left-0 w-1 h-6 bg-gold-600 rounded-r-full" />
              )}
              <item.icon
                className={cn(
                  'w-5 h-5 transition-colors',
                  isActive ? 'text-gold-500' : 'group-hover:text-slate-200'
                )}
              />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Rodapé */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900/50 rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">LeadFlowPro v2</p>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', planConfig.badgeColor)}>
              {planConfig.label}
            </span>
          </div>
          <p className="text-[10px] text-slate-600">Gestão inteligente de leads</p>
        </div>
      </div>
    </div>
  );
}
