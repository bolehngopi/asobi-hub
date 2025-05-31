import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronRight, Gamepad2, ShoppingCart, Users } from "lucide-react";
import { GameCard } from "@/components/game-card";

export default function Home() {
  return (
    <div className="flex flex-col mx-auto">
      {/* Hero Section */}
      <section className="relative">
        <div className="relative h-[60vh] w-full overflow-hidden">
          <Image
            src="https://images.pexels.com/photos/3945683/pexels-photo-3945683.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
            alt="Gaming Hero"
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />
        </div>

        <div className="container mx-auto absolute inset-0 flex flex-col justify-center space-y-5">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Your Ultimate Gaming Experience
          </h1>
          <p className="max-w-xl text-muted-foreground md:text-xl">
            Discover, buy, and play games all in one place. Join thousands of gamers on the platform
            built for true gaming enthusiasts.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/marketplace">
                Browse Games
                <ShoppingCart className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/gaming">
                Start Playing
                <Gamepad2 className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="container py-20 mx-auto">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Featured Games</h2>
          <p className="text-muted-foreground">
            Check out our latest and most popular games
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredGames.map((game) => <GameCard key={game.id} game={game} />)}
        </div>

        <div className="mt-10 flex justify-center">
          <Button variant="outline" size="lg" asChild>
            <Link href="/marketplace">
              View All Games
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted py-20">
        <div className="container mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight">Why Choose AsobiHub?</h2>
            <p className="mt-4 text-muted-foreground">
              Everything you need for a complete gaming experience
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center rounded-lg bg-card p-6 text-center shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-4 text-xl font-medium">{feature.title}</h3>
                <p className="mt-2 text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20 mx-auto">
        <div className="rounded-xl bg-gradient-to-r from-primary/20 via-primary/10 to-background p-8 md:p-10">
          <div className="flex flex-col items-center text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to Start Your Gaming Journey?
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground md:text-lg">
              Join thousands of gamers today and discover a new world of gaming possibilities.
              Create your account for free and start playing!
            </p>
            <Button size="lg" className="mt-8">
              <Link href="/auth/register">
                Create an Account
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

const featuredGames = [
  {
    id: "1",
    title: "Cyber Adventure 2077",
    price: 59.99,
    discountPrice: 39.99,
    discount: 33,
    image: "https://images.pexels.com/photos/7915264/pexels-photo-7915264.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "2",
    title: "Fantasy Quest IV",
    price: 49.99,
    discountPrice: null,
    discount: null,
    image: "https://images.pexels.com/photos/7915255/pexels-photo-7915255.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "3",
    title: "Space Explorer: Odyssey",
    price: 39.99,
    discountPrice: 29.99,
    discount: 25,
    image: "https://images.pexels.com/photos/1670977/pexels-photo-1670977.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
  {
    id: "4",
    title: "Racing Evolution 2025",
    price: 54.99,
    discountPrice: null,
    discount: null,
    image: "https://images.pexels.com/photos/163696/playstation-controller-sony-controller-joystick-163696.jpeg?auto=compress&cs=tinysrgb&w=600",
  },
];

const features = [
  {
    title: "Massive Game Selection",
    description: "Thousands of games from indie gems to AAA titles, all in one place.",
    icon: ShoppingCart,
  },
  {
    title: "Instant Play",
    description: "No downloads required. Play your favorite games directly in your browser.",
    icon: Gamepad2,
  },
  {
    title: "Active Community",
    description: "Connect with fellow gamers, compete in tournaments, and climb the leaderboards.",
    icon: Users,
  },
];