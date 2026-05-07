import { Loader } from 'lucide-react'
import type React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

type AlertDialogIntent = 'destructive' | 'warning' | 'success' | 'info'

const alertIntentConfig = {
  destructive: {
    media: 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive',
    actionVariant: 'destructive',
  },
  warning: {
    media: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
    actionVariant: 'outline',
  },
  success: {
    media: 'bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400',
    actionVariant: 'outline',
  },
  info: {
    media: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    actionVariant: 'outline',
  },
} satisfies Record<AlertDialogIntent, { media: string; actionVariant: string }>

interface ActionAlertDialogProps {
  icon: React.ReactNode
  open: boolean
  title: string
  intent?: AlertDialogIntent
  content?: React.ReactNode
  isLoading: boolean
  actionLabel: string
  cancelLabel?: string
  mediaClassName?: string
  onConfirm: () => void
  onOpenChange: (open: boolean) => void
}

export function ActionAlertDialog({
  open,
  icon,
  title,
  intent = 'info',
  content,
  isLoading,
  actionLabel,
  cancelLabel = 'Cancelar',
  mediaClassName,
  onConfirm,
  onOpenChange,
}: ActionAlertDialogProps) {
  const { media, actionVariant } = alertIntentConfig[intent]

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className={cn(media, mediaClassName)}>{icon}</AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>{content}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline">{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            variant={actionVariant === 'destructive' ? 'destructive' : 'default'}
            disabled={isLoading}
            onClick={e => {
              e.preventDefault()
              onConfirm()
            }}
          >
            {isLoading ? (
              <>
                <Loader className="animate-spin" />
                {actionLabel}
              </>
            ) : (
              actionLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
