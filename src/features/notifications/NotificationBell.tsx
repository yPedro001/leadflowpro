'use client';

import { Bell, Check, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useCadence } from '@/components/providers/CadenceProvider';
import { getNotifications, markAsRead, markAllAsRead } from '@/actions/notifications';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Link from 'next/link';

type NotificationMetadata = {
  ticketId?: string;
  targetUrl?: string;
};

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  type: string;
  leadId: string | null;
  metadata: NotificationMetadata | null;
  createdAt: Date | string;
};

function getNotificationTarget(notification: NotificationItem) {
  const metadata = notification.metadata ?? {};
  const type = notification.type?.toUpperCase();

  if (metadata.targetUrl?.startsWith('/')) return metadata.targetUrl;

  if (type === 'TICKET_UPDATE' || type === 'SUPPORT_TICKET' || type === 'SUPPORT_REPLY') {
    return metadata.ticketId ? `/suporte/${metadata.ticketId}` : '/suporte';
  }

  if (type === 'CADENCE_OVERDUE' || type === 'AGENDA' || type === 'MANUAL_ACTION') {
    return '/agenda';
  }

  return '/analytics';
}

function getNotificationCta(notification: NotificationItem) {
  const type = notification.type?.toUpperCase();

  if (type === 'TICKET_UPDATE' || type === 'SUPPORT_TICKET' || type === 'SUPPORT_REPLY') {
    return 'Ver chamado';
  }

  if (type === 'CADENCE_OVERDUE' || type === 'AGENDA' || type === 'MANUAL_ACTION') {
    return 'Ver agenda';
  }

  return 'Abrir';
}

export function NotificationBell() {
  const { unreadCount, stateHash, refresh } = useCadence();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Busca detalhes quando o hash de estado muda ou quando abre o menu
  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data.map((item) => ({
        ...item,
        metadata: typeof item.metadata === 'object' && item.metadata !== null && !Array.isArray(item.metadata)
          ? item.metadata as NotificationMetadata
          : null,
      })));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) void loadNotifications();
  }, [stateHash, isOpen]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await markAsRead(id);
      await refresh(); // Atualiza contador global
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      await refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) void loadNotifications();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button className="relative p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-gold-400 dark:hover:border-gold-600 transition-all group active:scale-95">
          <Bell className={cn(
            "w-5 h-5 transition-colors",
            unreadCount > 0 ? "text-rose-500 animate-[bell-swing_2s_infinite]" : "text-slate-400 group-hover:text-gold-600 shadow-gold-100"
          )} />
          
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white shadow-lg bg-rose-500"
              >
                {unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0 rounded-[2rem] border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden bg-white dark:bg-slate-950">
        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-800 dark:text-slate-100 tracking-tight">Notificações</h3>
            {unreadCount > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg font-bold uppercase tracking-widest hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Ler Todas
              </button>
            )}
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {isLoading && notifications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 italic text-sm">Carregando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6 text-slate-300" />
              </div>
              <p className="text-sm font-medium text-slate-500">Nenhuma notificação.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {notifications.map((notif) => (
                <DropdownMenuItem key={notif.id} asChild className="p-4 cursor-pointer focus:bg-gold-50 dark:focus:bg-gold-950 transition-colors">
                  <div className="relative group/item">
                    <Link
                      href={getNotificationTarget(notif)}
                      onClick={() => {
                        if (!notif.isRead) void markAsRead(notif.id).then(refresh);
                      }}
                      className="flex items-start gap-3 pr-8"
                    >
                      <div className={cn(
                        "mt-1.5 w-2 h-2 rounded-full flex-shrink-0 shadow-sm",
                        notif.isRead ? "bg-slate-200 dark:bg-slate-800" : "bg-rose-500 animate-pulse"
                      )} />
                      <div className="space-y-0.5">
                        <p className={cn(
                          "text-sm leading-tight",
                          notif.isRead ? "text-slate-400 font-medium" : "text-slate-800 dark:text-slate-200 font-bold"
                        )}>
                          {notif.title}
                        </p>
                        <p className="text-[11px] text-slate-500 font-medium tracking-tight line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ptBR })}
                        </p>
                        <p className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-gold-600 dark:text-gold-400">
                          {getNotificationCta(notif)}
                          <ChevronRight className="w-3 h-3" />
                        </p>
                      </div>
                    </Link>
                    {!notif.isRead && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notif.id, e)}
                        className="absolute right-4 top-4 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-gold-600 dark:hover:text-gold-400 opacity-0 group-hover/item:opacity-100 transition-all"
                        title="Marcar como lida"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>

        <DropdownMenuSeparator className="bg-slate-100 dark:border-slate-800" />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

