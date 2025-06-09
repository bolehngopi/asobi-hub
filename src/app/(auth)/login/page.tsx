import { LoginForm } from "@/components/forms/login-form";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  return (
    <LoginForm callbackUrl={(await searchParams).callbackUrl || undefined} />
  )
}

export async function generateMetadata() {
  return {
    title: "Login",
    description: "Log in to your AsobiHub account to join the gaming community, track achievements, and connect with other players.",
    openGraph: {
      title: "Login",
      description: "Log in to your AsobiHub account to join the gaming community, track achievements, and connect with other players.",
      url: "https://asobi-hub.vercel.app/login",
      type: "website",
      siteName: "AsobiHub",
      images: [
        {
          url: "/file.svg",
          width: 600,
          height: 400,
          alt: "AsobiHub login",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: "Login",
      description: "Log in to your AsobiHub account to join the gaming community, track achievements, and connect with other players.",
      site: "@asobihub",
      creator: "@asobihub",
      images: ["/file.svg"],
    },
    alternates: {
      canonical: "/login",
    },
  };
}