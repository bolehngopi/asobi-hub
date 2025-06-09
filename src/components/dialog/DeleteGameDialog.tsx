"use client";

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import React from "react";
import { deleteGameAction } from "@/lib/action/deleteGameAction";

interface DeleteGameDialogProps {
  gameId: string;
  gameTitle: string;
}

export function DeleteGameDialog({ gameId, gameTitle }: DeleteGameDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">Delete</Button>
      </DialogTrigger>
      <DialogContent>
        <form action={deleteGameAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Delete Game</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete “{gameTitle}”?
            </DialogDescription>
          </DialogHeader>
          <input type="hidden" name="gameId" value={gameId} />
          <DialogFooter className="space-x-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="destructive">Confirm Delete</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
