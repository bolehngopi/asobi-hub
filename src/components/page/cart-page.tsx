"use client";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { formatter } from "@/lib/format";
import { useCart } from "@/store/cart-store";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartClient({ session }) {
  const { items: cartItems, selected, toggleSelect, remove, clear } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSelect = (itemId: string) => toggleSelect(itemId);
  const handleRemove = (itemId: string) => remove(itemId);
  const selectedItems = cartItems.filter((item) => selected.includes(item.id));
  const total = selectedItems.reduce((sum, item) => sum + item.game.price, 0);

  // Checkout handler
  const handleCheckout = async () => {
    if (!session) {
      router.push("/login?redirect=/checkout");
      return;
    }
    if (selectedItems.length === 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: selectedItems.map((item) => ({ id: item.game.id })) }),
      });
      if (!res.ok) throw new Error("Failed to create invoice");
      const data = await res.json();
      clear();
      router.push(data.invoiceUrl || "/dashboard/transactions");
    } catch (err) {
      // Optionally show a toast/notification
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Cart</CardTitle>
      </CardHeader>
      <CardContent>
        {cartItems.length === 0 ? (
          <div className="text-muted-foreground text-center py-12">Your cart is empty.</div>
        ) : (
          <div className="grid gap-6">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-center gap-6 rounded-xl border bg-card p-4 shadow-md hover:shadow-lg transition-shadow"
              >
                <Checkbox
                  checked={selected.includes(item.id)}
                  onCheckedChange={() => handleSelect(item.id)}
                  className="mr-2 self-start"
                />
                <div className="w-full sm:w-32 flex-shrink-0 flex items-center justify-center">
                  <Avatar className="relative w-24 h-24 rounded-lg overflow-hidden border bg-muted">
                    {item.game.image ? (
                      <AvatarImage
                        src={item.game.image}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <AvatarFallback className="w-full h-full text-3xl flex items-center justify-center">
                        {item.game.title[0]}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </div>
                <div className="flex-1 w-full flex flex-col gap-1">
                  <Link
                    href={`/game/${item.game.slug}`}
                    className="font-semibold text-lg hover:underline"
                  >
                    {item.game.title}
                  </Link>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    by {item.game.author?.displayUsername || item.game.author?.username}
                  </div>
                  {item.game.genre?.name && (
                    <span className="inline-block bg-primary/10 text-primary px-2 py-0.5 rounded text-xs mt-1">
                      {item.game.genre.name}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1 min-w-[90px]">
                  <span className="text-lg font-bold">
                    {formatter.format(item.game.price)}
                  </span>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRemove(item.id)}
                  className="self-start"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      {cartItems.length > 0 && (
        <CardFooter className="flex flex-col gap-4 items-end border-t pt-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center w-full justify-between">
            <div className="text-lg font-semibold">Total</div>
            <div className="text-2xl font-bold">{formatter.format(total)}</div>
          </div>
          <div className="flex gap-2 justify-end w-full">
            <Button asChild variant="outline">
              <Link href="/marketplace">Continue Shopping</Link>
            </Button>
            <Button
              disabled={selected.length === 0 || loading}
              onClick={handleCheckout}
            >
              {loading ? "Processing..." : "Checkout"}
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
