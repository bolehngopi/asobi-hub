import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { CheckoutSchema } from "@/lib/validators/invoice-schema";
import { CreateInvoiceRequest } from "xendit-node/invoice/models";
import { nanoid } from "nanoid";
import { xenditInvoice } from "@/lib/xendit";
import { z } from "zod";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    const { items } = CheckoutSchema.parse(body);

    const products = await prisma.game.findMany({
      where: {
        id: {
          in: items.map((item) => item.id),
        },
      },
      select: {
        id: true,
        slug: true,
        title: true,
        price: true,
      },
    })

    const totalAmount = products.reduce((total, product) => {
      return total + product.price;
    }, 0);

    const orderId = `XTR-${nanoid(10)}-${nanoid(5)}-${session.user.id}`;

    const invoiceData: CreateInvoiceRequest = {
      externalId: orderId,
      amount: totalAmount,
      customer: {
        givenNames: session.user.name,
        email: session.user.email,
      },
      currency: 'IDR',
      description: `Order for ${session.user.name}`,
      items: products.map((product) => ({
        id: product.id,
        name: product.title,
        price: product.price,
        quantity: 1,
      })),
      successRedirectUrl: `${process.env.BETTER_AUTH_URL}/dashboard/transactions`,
      failureRedirectUrl: `${process.env.BETTER_AUTH_URL}/dashboard/transactions`,
    };

    const invoice = await xenditInvoice.createInvoice({
      data: invoiceData,
    });

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        totalAmount,
        status: 'PENDING',
        notes: invoiceData.description,
        items: {
          create: products.map((product) => ({
            gameId: product.id,
            price: product.price,
          })),
        },
      },
      include: { items: true },
    });

    const createdInvoice = await prisma.invoice.create({
      data: {
        transactionId: transaction.id,
        invoiceId: invoice.id ?? "",
        externalId: orderId,
        amount: totalAmount,
        status: 'PENDING',
        invoiceUrl: invoice.invoiceUrl,
        expiryDate: new Date(invoice.expiryDate),
        paymentMethod: invoice.paymentMethod ?? "",
        notes: invoice.description,
      },
    });

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { invoiceId: createdInvoice.id },
    });

    return Response.json(
      {
        invoice: invoice,
        transactionId: transaction.id,
        invoiceUrl: invoice.invoiceUrl,
      },
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid request data', {
        status: 422,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.error("Error fetching session:", error);

    return new Response('Could not checkout, please try again later.', {
      status: 500,
    })
  }
}