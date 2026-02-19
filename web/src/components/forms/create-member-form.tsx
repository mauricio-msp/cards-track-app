import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Loader, UserPlus } from 'lucide-react'
import type { ReactNode } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { createMember } from '@/api/create-member'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { InputGroup, InputGroupInput } from '@/components/ui/input-group'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RELATIONSHIPS } from '@/helpers/relationships'

const CreateMemberFormSchema = z.object({
  name: z.string().nonempty('Member name cannot be empty'),
  relationship: z.string().nonempty('Member relation cannot be empty'),
})

type CreateMemberForm = z.infer<typeof CreateMemberFormSchema>

const defaultValues = {
  name: '',
  relationship: '',
}

export function CreateMemberForm({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const {
    reset,
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<CreateMemberForm>({
    resolver: zodResolver(CreateMemberFormSchema),
    defaultValues,
  })

  const { mutateAsync: createMemberFn } = useMutation({
    mutationFn: createMember,
  })

  async function handleCreateMember({ name, relationship }: CreateMemberForm) {
    try {
      await createMemberFn({
        name,
        relationship,
      })

      queryClient.invalidateQueries({ queryKey: ['members'] })
    } catch (error) {
      console.log('🚀 ~ handleCreateMember ~ error:', error)
    }

    reset(defaultValues)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent className="sm:max-w-sm" onCloseAutoFocus={() => reset(defaultValues)}>
        <form
          onSubmit={handleSubmit(handleCreateMember)}
          className="flex flex-col justify-end flex-1 gap-4"
        >
          <DialogHeader>
            <DialogTitle>Add member</DialogTitle>
            <DialogDescription>
              Create a new member to associate expenses, limits, and shared purchases.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Field data-invalid={!!errors.name} className="gap-1">
              <FieldLabel>Member name</FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="name"
                  disabled={isSubmitting}
                  aria-invalid={!!errors.name}
                  placeholder="John Doe"
                  {...register('name')}
                />
              </InputGroup>
              {errors.name && <FieldError>{errors.name.message}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.relationship} className="gap-1">
              <FieldLabel>Relationship</FieldLabel>
              <Controller
                name="relationship"
                control={control}
                render={({ field }) => (
                  <Select
                    disabled={isSubmitting}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger aria-invalid={!!errors.relationship}>
                      <SelectValue placeholder="Select a relationship" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {RELATIONSHIPS.map(relation => (
                          <SelectItem key={relation} value={relation.toLowerCase()}>
                            {relation}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.relationship && <FieldError>{errors.relationship.message}</FieldError>}
            </Field>
          </FieldGroup>

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={isSubmitting} variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" className="cursor-pointer" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader className="size-4 animate-spin" />
              ) : (
                <UserPlus className="size-4" />
              )}
              {isSubmitting ? 'Registering member...' : 'Register member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
