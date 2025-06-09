import { RegisterForm } from "@/components/forms/register-form";


export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  return (
    <RegisterForm callbackUrl={(await searchParams).callbackUrl || undefined} />
  )
}

export async function generateMetadata() {
  return {
    title: "Register",
    description: "Create your AsobiHub account to join the gaming community, track achievements, and connect with other players.",
    openGraph: {
      title: "Register",
      description: "Create your AsobiHub account to join the gaming community, track achievements, and connect with other players.",
      url: "https://asobi-hub.vercel.app/register",
      type: "website",
      siteName: "AsobiHub",
      images: [
        {
          url: "/file.svg",
          width: 600,
          height: 400,
          alt: "AsobiHub registration",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title: "Register",
      description: "Create your AsobiHub account to join the gaming community, track achievements, and connect with other players.",
      site: "@asobihub",
      creator: "@asobihub",
      images: ["/file.svg"],
    },
    alternates: {
      canonical: "/register",
    },
  };
}
