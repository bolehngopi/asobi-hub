import { Xendit } from 'xendit-node';

const SECRET_KEY = process.env.XENDIT_API_KEY as string;

export const xenditClient = new Xendit({
  secretKey: SECRET_KEY,
})

export const { Invoice } = xenditClient;