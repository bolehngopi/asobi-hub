"use client";

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"
import Link from 'next/link'
import { toast } from "sonner";

type LoginFormProps = React.ComponentProps<"form"> & {
  callbackUrl?: string | undefined;
}

export function RegisterForm({
  className,
  callbackUrl,
  ...props
}: LoginFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    image: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (loading) return
    setLoading(true)

    const { error } = await authClient.signUp.email({
      name: formData.name,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      image: formData.image,
      callbackURL: callbackUrl ?? '/',
    })

    if (error) {
      toast.error(error.message || "An error occurred while logging in.", {
        description: "Please check your email and password and try again.",
      })
      setLoading(false)
      return
    }

    setLoading(false)
  }

  const handleSocialLogin = async (provider: "github" | "google") => {
    setLoading(true)

    const { error } = await authClient.signIn.social({
      provider,
    })

    if (error) {
      toast.error(error.message || "An error occurred while logging in.", {
        description: "Please try again later.",
      })
      setLoading(false)
      return
    }
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Register to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to login to your account
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            name="name"
            placeholder="Your name"
            required
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            type="text"
            name="username"
            placeholder="username"
            required
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            name="email"
            placeholder="m@email.com"
            required
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="grid gap-3">
          <Label htmlFor="image">Profile Image</Label>
          <Input
            id="image"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Registering...' : 'Register'}
        </Button>
        <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
          <span className="bg-background text-muted-foreground relative z-10 px-2">
            Or continue with
          </span>
        </div>
        <Button variant="outline" className="w-full" disabled={loading} onClick={() => handleSocialLogin("github")}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden>
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
              fill="currentColor"
            />
          </svg>
          Register with GitHub
        </Button>
      </div>
      <div className="text-center text-sm">
        Already have an account?{' '}
        <Link href="/login" className="underline underline-offset-4">
          Log in
        </Link>
      </div>
    </form>
  )
}
