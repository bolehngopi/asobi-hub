import Image from "next/image";
import Link from "next/link";

export function GameCard({
  game
}: {
  title: string;
  description: string;
  imageUrl: string;
  href: string;
}) {
  return (
    <Link
      key={game.id}
      href={`/marketplace/games/${game.slug}`}
      className="group relative overflow-hidden rounded-lg transition-all hover:shadow-xl"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
        <Image
          src={game.image}
          alt={game.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-60" />
        {game.discount && (
          <div className="absolute right-2 top-2 rounded-full bg-destructive px-2 py-1 text-xs font-medium">
            {game.discount}% OFF
          </div>
        )}
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="font-semibold text-white">{game.title}</h3>
        <div className="mt-1 flex items-center gap-2">
          {game.discountPrice ? (
            <>
              <span className="font-medium text-white">${game.discountPrice}</span>
              <span className="text-sm text-white/70 line-through">${game.price}</span>
            </>
          ) : (
            <span className="font-medium text-white">${game.price}</span>
          )}
        </div>
      </div>
    </Link>
  );
}