import { Loader2, Zap } from 'lucide-react'
import type React from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface AnticipateAlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  isLoading: boolean
  title: string
  description: React.ReactNode
  onConfirm: () => void
}

export function AnticipateAlertDialog({
  open,
  onOpenChange,
  isLoading,
  title,
  description,
  onConfirm,
}: AnticipateAlertDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={open => {
        if (!isLoading) onOpenChange(open)
      }}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
            <Zap />
          </AlertDialogMedia>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <Button
            variant="default"
            className="bg-amber-600 hover:bg-amber-700 text-white"
            disabled={isLoading}
            onClick={onConfirm}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            Antecipar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
