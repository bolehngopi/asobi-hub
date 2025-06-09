// Turn eslint off for this file
/* eslint-disable @typescript-eslint/no-unused-vars */

import { Xendit, Invoice as InvoiceClient } from 'xendit-node';

const SECRET_KEY = process.env.XENDIT_API_KEY as string;

const xenditClient = new Xendit({
  secretKey: SECRET_KEY,
})

// const { Invoice } = xenditClient;

export const xenditInvoice = new InvoiceClient({
  secretKey: SECRET_KEY
});