import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/shared/ui/button'
import { Checkbox } from '@/shared/ui/checkbox'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { PasswordInput } from '@/shared/ui/password-input'
import { Spinner } from '@/shared/ui/spinner'
import { useLogin } from '../api/auth-queries'
import { loginSchema, type LoginValues } from '../model/schemas'

export function LoginForm() {
  const login = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  return (
    <form onSubmit={handleSubmit((values) => login.mutate(values))} className="space-y-5">
      <FormField id="email" label="Email" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="email@example.com"
          aria-invalid={Boolean(errors.email)}
          {...register('email')}
        />
      </FormField>

      <FormField id="password" label="Parol" error={errors.password?.message}>
        <PasswordInput
          id="password"
          autoComplete="current-password"
          placeholder="Parolni kiriting"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
      </FormField>

      <div className="flex items-center gap-2">
        <Checkbox id="remember" defaultChecked />
        <Label htmlFor="remember" className="font-normal text-muted-foreground">
          Eslab qolish
        </Label>
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
        {login.isPending && <Spinner />}
        Kirish
      </Button>
    </form>
  )
}
