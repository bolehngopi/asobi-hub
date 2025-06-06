import Image from "next/image";
import Link from "next/link";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from "@/components/ui/hover-card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { formatter } from "@/lib/format";
import { Prisma } from "@/generated/prisma";

export interface GameCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  rating: number;
  author: Prisma.UserGetPayload<{
    select: {
      username: true;
      image: true;
      createdAt: true;
    };
  }>;
  coverImage: string;
  categories: string[];
  releaseDate: string;
}

export function GameCard({
  slug,
  title,
  description,
  price,
  discountPrice,
  rating,
  coverImage,
  categories,
  author,
}: GameCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="aspect-[16/9] w-full relative">
        <Image src={coverImage} alt={title} fill className="object-cover" />
      </div>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-start justify-between">
          <div>
            <Link
              href={`/game/${slug}`}
              className="hover:underline"
            >
              <h3 className="font-semibold">{title}</h3>
            </Link>
            <div className="mt-1 flex items-center gap-1">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="text-sm font-medium">{rating}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            {discountPrice ? (
              <>
                <span className="font-medium">{discountPrice}</span>
                <span className="text-sm text-muted-foreground line-through">
                  {price}
                </span>
              </>
            ) : (
              <span className="font-medium">{formatter.format(price)}</span>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {categories.map((category) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="text-xs text-muted-foreground">
          <HoverCard>
            <HoverCardTrigger asChild>
              <Button variant="link" asChild>
                <Link href={`/profile/${author.username}`}>
                  @{author.username}
                </Link>
              </Button>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <div className="flex justify-between gap-4">
                <Avatar>
                  <AvatarImage src={author.image ?? undefined} alt={author.username} />
                  <AvatarFallback>{author.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold hover:underline">
                    <Link href={`/profile/${author.username}`}>
                      @{author.username}
                    </Link>
                  </h4>
                  <div className="text-muted-foreground text-xs">
                    Joined {new Date(author.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>
        </div>
      </CardFooter>
    </Card>
  );
}