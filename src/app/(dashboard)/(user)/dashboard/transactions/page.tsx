import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import prisma from "@/lib/prisma";

export default async function TransactionsDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return redirect(`/login?redirect=/dashboard/transactions`);
  }

  // Fetch transactions for the current user, including items and games
  const transactions = await prisma.transaction.findMany({
    where: { userId: session.user.id },
    include: {
      items: {
        include: { game: true },
      },
      invoice: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-2">My Transactions</h1>
      <p className="text-muted-foreground mb-6">View your purchase and payment history.</p>
      <Table>
        <TableCaption>Your recent transactions</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Games</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Invoice</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                No transactions found.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <ul className="list-disc ml-4">
                    {tx.items.map((item) => (
                      <li key={item.id}>{item.game.title}</li>
                    ))}
                  </ul>
                </TableCell>
                <TableCell>Rp {tx.totalAmount.toLocaleString("id-ID")}</TableCell>
                <TableCell>
                  <Badge variant={
                    tx.status === "PAID"
                      ? "default"
                      : tx.status === "PENDING"
                      ? "secondary"
                      : tx.status === "EXPIRED"
                      ? "destructive"
                      : "outline"
                  }>
                    {tx.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {tx.invoice?.invoiceUrl ? (
                    <a
                      href={tx.invoice.invoiceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 hover:text-blue-800"
                    >
                      View Invoice
                    </a>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}