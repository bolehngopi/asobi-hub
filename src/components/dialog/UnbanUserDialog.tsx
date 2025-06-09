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
import { Button } from "@/components/ui/button";
import { authClient } from '@/lib/auth-client';

interface UnbanUserDialogProps {
  user: any;
}

export function UnbanUserDialog({ user }: UnbanUserDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleUnban() {
    startTransition(async () => {
      try {
        await authClient.admin.unbanUser({
          userId: user.id,
        });
        toast.success('User unbanned successfully');
        router.refresh();
      } catch (err) {
        console.error(err);
        toast.error('Failed to unban user. Please try again.');
      }
    });
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">Unban</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unban User</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Are you sure you want to unban this user?
        </DialogDescription>
        <DialogFooter className="space-x-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleUnban} variant="secondary" disabled={isPending}>
            {isPending ? 'Unbanning...' : 'Confirm Unban'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
