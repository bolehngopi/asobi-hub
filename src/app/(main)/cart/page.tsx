import CartClient from "@/components/page/cart-page";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function CartPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  return (
    <div className="container py-10 mx-auto max-w-3xl">
      <CartClient session={session}/>
    </div>
  );
}
