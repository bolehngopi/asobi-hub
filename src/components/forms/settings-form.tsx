"use client";

import { useState, ChangeEvent, useTransition } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MDEditor from "@uiw/react-md-editor";
import rehypeSanitize from "rehype-sanitize";
import { updateUserSettings } from "@/lib/action/updateUserSettings";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function SettingsForm({ initialData }: { initialData: any }) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    username: initialData.username || "",
    displayUsername: initialData.displayUsername || "",
    website: initialData.website || "",
    twitter: initialData.twitter || "",
    profile: initialData.profile || "",
  });
  const [bioTab, setBioTab] = useState<"write" | "preview">("write");
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (formData: FormData) => {
    startTransition(async () => {
      try {
        await updateUserSettings(formData);
        toast.success("Settings updated!");
      } catch (err: any) {
        toast.error(err.message || "Failed to update settings");
      }
    });
  };

  return (
    <form className="flex flex-col gap-6 px-0 py-0 w-full max-w-2xl mx-auto" action={handleSubmit}>
      <div className="flex flex-col items-center gap-2">
        <Avatar className="h-24 w-24 border-2 border-primary/30 shadow">
          {initialData.image ? (
            <AvatarImage src={initialData.image} alt={form.name || form.username} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-primary">
              {form.name?.[0] || form.username?.[0] || "?"}
            </AvatarFallback>
          )}
        </Avatar>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            required
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            required
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="displayUsername">Display Username</Label>
          <Input
            id="displayUsername"
            name="displayUsername"
            value={form.displayUsername}
            onChange={handleChange}
            placeholder="Display Username (optional)"
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            value={form.website}
            onChange={handleChange}
            placeholder="https://yourwebsite.com"
            disabled={isPending}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="twitter">Twitter</Label>
          <Input
            id="twitter"
            name="twitter"
            value={form.twitter}
            onChange={handleChange}
            placeholder="@yourhandle"
            disabled={isPending}
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="profile">Profile Bio <span className="text-xs text-muted-foreground">(Markdown supported)</span></Label>
        <MDEditor
          id="profile"
          value={form.profile}
          onChange={(v) => setForm((prev) => ({ ...prev, profile: v ?? "" }))}
          preview={bioTab === 'preview' ? 'preview' : 'edit'}
          previewOptions={{ rehypePlugins: [[rehypeSanitize]] }}
          textareaProps={{
            name: "profile",
            placeholder: "Write something about yourself...",
            rows: 6,
            disabled: isPending,
          }}
          height={180}
        />
        <div className="flex gap-2 mt-1">
          <Button type="button" size="sm" variant={bioTab === "write" ? "default" : "outline"} onClick={() => setBioTab("write")}>Write</Button>
          <Button type="button" size="sm" variant={bioTab === "preview" ? "default" : "outline"} onClick={() => setBioTab("preview")}>Preview</Button>
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
