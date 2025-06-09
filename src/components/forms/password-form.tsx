"use client";
import { useState, useTransition, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateUserPassword } from "@/lib/action/updateUserPassword";
import { hasUserPassword, verifyUserPassword } from "@/lib/action/userPasswordHelpers";

export function PasswordForm() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [requireCurrent, setRequireCurrent] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      const hasPassword = await hasUserPassword();
      setRequireCurrent(hasPassword);
    })();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        if (newPassword !== confirmPassword) {
          toast.error("Passwords do not match");
          return;
        }
        if (requireCurrent) {
          const ok = await verifyUserPassword(currentPassword);
          if (!ok) {
            toast.error("Current password is incorrect");
            return;
          }
        }
        await updateUserPassword(formData);
        setNewPassword("");
        setConfirmPassword("");
        setCurrentPassword("");
        toast.success("Password updated!");
      } catch (err: any) {
        toast.error(err.message || "Failed to update password");
      }
    });
  };

  return (
    <form className="flex flex-col gap-6 px-0 py-0 w-full max-w-2xl " action={handleSubmit}>
      {requireCurrent && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="currentPassword">Current Password</Label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            minLength={8}
            required
            disabled={isPending}
          />
        </div>
      )}
      <div className="flex flex-col gap-2">
        <Label htmlFor="newPassword">New Password</Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          minLength={8}
          required
          disabled={isPending}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          minLength={8}
          required
          disabled={isPending}
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving..." : "Change Password"}
      </Button>
    </form>
  );
}
