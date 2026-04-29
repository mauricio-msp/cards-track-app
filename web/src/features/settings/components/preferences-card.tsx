import { Eye, EyeClosed, Settings2 } from 'lucide-react'
import { ModeToggle } from '@/components/mode-toggle'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from '@/components/ui/field'
import { Switch } from '@/components/ui/switch'
import { useHideValuesStore } from '@/hooks/store/use-hide-values-store'

export function PreferencesCard() {
  const { hideValues, toggleHideValues } = useHideValuesStore()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="size-4" />
          Preferências
        </CardTitle>
        <CardDescription>Personalize sua experiência no app.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <FieldLabel htmlFor="switch-hide-values">
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle className="flex items-center gap-2">
                  {hideValues ? <EyeClosed className="size-4" /> : <Eye className="size-4" />}
                  Ocultar valores
                </FieldTitle>
                <FieldDescription>
                  Esconde todos os valores monetários do app. Útil em ambientes públicos.
                </FieldDescription>
              </FieldContent>
              <Switch
                id="switch-hide-values"
                checked={hideValues}
                onCheckedChange={toggleHideValues}
              />
            </Field>
          </FieldLabel>

          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle>Tema</FieldTitle>
              <FieldDescription>
                Escolha entre tema claro, escuro ou seguir o sistema operacional.
              </FieldDescription>
            </FieldContent>
            <ModeToggle />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}
