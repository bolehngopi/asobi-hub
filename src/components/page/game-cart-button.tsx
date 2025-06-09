"use client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCart } from "@/store/cart-store";
import { useMemo } from "react";
import { formatter } from "@/lib/format";

export default function GameCartButton({ game, session }: { game: any; session: any }) {
  const { items: cartItems, add } = useCart();
  const alreadyInCart = useMemo(() => cartItems.some((item) => item.game.id === game.id), [cartItems, game.id]);

  function handleAddToCart() {
    add({
      id: `${game.id}`,
      game: {
        id: game.id,
        slug: game.slug,
        title: game.title,
        price: game.price,
        image: game.image,
        genre: game.genre ? { name: game.genre.name } : undefined,
        author: game.author ? { username: game.author.username, displayUsername: game.author.displayUsername } : undefined,
      },
    });
  }

  if (!session?.user) {
    return (
      <Button asChild className="font-bold">
        <Link href={`/login?callbackUrl=/game/${encodeURIComponent(game.slug)}`}>
          Login to Add to Cart
        </Link>
      </Button>
    );
  }

  return (
    <Button
      className="font-bold"
      disabled={alreadyInCart}
      onClick={handleAddToCart}
    >
      {alreadyInCart ? "In Cart" : "Add to Cart"}
    </Button>
  );
}
