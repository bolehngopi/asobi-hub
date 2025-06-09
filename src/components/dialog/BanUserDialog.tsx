'use client';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authClient } from '@/lib/auth-client';

interface BanUserDialogProps {
  user: any;
}

export function BanUserDialog({ user }: BanUserDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        const res = await authClient.admin.banUser({
          userId: user.id,
          // Optional (if not provided, the default ban reason will be used - No reason)
          banExpiresIn: formData.get('banExpiresIn')
            ? 60 * 60 * 24 * Number(formData.get('banExpiresIn'))
            : undefined,
        });

        toast.success('User banned successfully', {
          description: `User ${user.id} has been banned${formData.get('banReason') ? ` for: ${formData.get('banReason')}` : ''
            }${formData.get('banExpiresIn') ? ` for ${formData.get('banExpiresIn')} day(s)` : ' permanently'
            }`,
        });
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error('Failed to ban user. Please try again.', {
          description: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive" disabled={user.banned}>
          {user.banned ? 'Banned' : 'Ban'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Provide a reason and duration for the ban.
            </DialogDescription>
          </DialogHeader>
          <input type="hidden" name="userId" value={user.id} />
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <Input name="banReason" placeholder="Optional reason" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Duration (days, leave blank for permanent)</label>
            <Input name="banExpiresIn" type="number" min="0" placeholder="7" />
          </div>
          <DialogFooter className="space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Banning...' : 'Confirm Ban'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
