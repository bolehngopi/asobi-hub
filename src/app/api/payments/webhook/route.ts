import { TransactionStatus } from "@/generated/prisma";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate the webhook header
    const signature = request.headers.get("X-Callback-Token");

    if (!process.env.XENDIT_WEBHOOK_SECRET) {
      console.error("XENDIT_WEBHOOK_SECRET is not set in environment variables");
      return new Response("Internal Server Error", { status: 500 });
    }

    if (!signature || signature !== process.env.XENDIT_WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Find the invoice and its transaction
    const invoice = await prisma.invoice.findUnique({
      where: { externalId: body.external_id, AND: { status: "PENDING", amount: body.paid_amount } },
      include: {
        transaction: {
          include: { user: true },
        },
      },
    });

    if (!invoice) {
      console.error("Invoice not found for external ID:", body.external_id);
      return new Response("Invoice not found", { status: 404 });
    }

    // Update invoice fields
    await prisma.invoice.update({
      data: {
        paymentMethod: body.payment_method,
        status: body.status,
        expiryDate: body.expiry_date ? new Date(body.expiry_date) : invoice.expiryDate,
        notes: body.notes || invoice.notes,
      },
      where: { externalId: body.external_id },
    });

    // Map Xendit status to TransactionStatus enum
    let newStatus: TransactionStatus | undefined;
    switch (body.status) {
      case "PAID":
        newStatus = TransactionStatus.PAID;
        break;
      case "EXPIRED":
      case "FAILED":
        newStatus = TransactionStatus.EXPIRED;
        break;
      case "SETTLED":
        newStatus = TransactionStatus.SETTLED;
        break;
      default:
        newStatus = undefined;
    }

    if (newStatus) {
      await prisma.transaction.update({
        where: { id: invoice.transaction.id },
        data: { status: newStatus },
      });
    }

    return new Response("Webhook received", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}