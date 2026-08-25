import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/shared/ui/button'
import { FormField } from '@/shared/ui/form-field'
import { Input } from '@/shared/ui/input'
import { PasswordInput } from '@/shared/ui/password-input'
import { Spinner } from '@/shared/ui/spinner'
import { useRegister } from '../api/auth-queries'
import { registerSchema, type RegisterValues } from '../model/schemas'

export function RegisterForm() {
  const signUp = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullname: '', email: '', password: '' },
  })

  return (
    <form onSubmit={handleSubmit((values) => signUp.mutate(values))} className="space-y-5">
      <FormField id="fullname" label="F.I.Sh." error={errors.fullname?.message}>
        <Input
          id="fullname"
          autoComplete="name"
          placeholder="Ism Familiya"
          aria-invalid={Boolean(errors.fullname)}
          {...register('fullname')}
        />
      </FormField>

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

      <FormField
        id="password"
        label="Parol"
        error={errors.password?.message}
        hint="Kamida 8 belgi, harf va raqam bo`lsin"
      >
        <PasswordInput
          id="password"
          autoComplete="new-password"
          placeholder="Parol yarating"
          aria-invalid={Boolean(errors.password)}
          {...register('password')}
        />
      </FormField>

      <Button type="submit" className="w-full" size="lg" disabled={signUp.isPending}>
        {signUp.isPending && <Spinner />}
        Ro'yxatdan o'tish
      </Button>
    </form>
  )
}
