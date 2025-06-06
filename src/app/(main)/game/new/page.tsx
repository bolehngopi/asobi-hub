"use client";

import { useState, useEffect, ChangeEvent } from "react";
import { redirect } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function CreateGamePage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [genres, setGenres] = useState<Array<{ id: string; name: string }>>([]);
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([]);
  const [genreId, setGenreId] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);

  const [price, setPrice] = useState<number>(0);
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED" | "ARCHIVED">("DRAFT");

  // Image upload
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  // Game upload (optional)
  const [version, setVersion] = useState("");
  const [versionDescription, setVersionDescription] = useState("");
  const [gameFile, setGameFile] = useState<File | null>(null);

  const { data: session } = authClient.useSession();

  // If not logged in, redirect to login
  if (!session) {
    toast.error("You must be logged in to create a game.");
    redirect("/login?redirect=/game/new");
  }

  // Fetch genres & tags
  useEffect(() => {
    fetch("/api/genre")
      .then((res) => res.json())
      .then((data) => setGenres(data))
      .catch(() => toast.error("Failed to load genres"));

    fetch("/api/tag")
      .then((res) => res.json())
      .then((data) => setTags(data))
      .catch(() => toast.error("Failed to load tags"));
  }, []);

  const handleTagToggle = (id: string) => {
    setTagIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // When the user picks a cover image
  const onImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);

    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview("");
    }
  };

  // When the user picks a game build file
  const onGameFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setGameFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Game title is required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price.toString());
      formData.append("status", status);
      if (genreId) formData.append("genreId", genreId);
      if (tagIds.length) formData.append("tagIds", JSON.stringify(tagIds));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (version && gameFile) {
        formData.append("version", version);
        formData.append("versionDescription", versionDescription);
        formData.append("gameFile", gameFile);
      }

      const res = await fetch("/api/game/new", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || "Failed to create game");
      }

      toast.success("Game created successfully!");
      setTitle("");
      setDescription("");
      setImageFile(null);
      setImagePreview("");
      setPrice(0);
      setGenreId("");
      setTagIds([]);
      setStatus("DRAFT");
      setVersion("");
      setVersionDescription("");
      setGameFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create game.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center container py-10 mx-auto">
      <div className="flex flex-col items-center gap-4 w-full max-w-lg">
        <h1 className="text-3xl font-bold">Create a New Game</h1>
        <Card className="w-full p-6">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            {/* Title */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="game-title">Game Title</Label>
              <Input
                id="game-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What’s your game called?"
                required
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="game-description">Description</Label>
              <Textarea
                id="game-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a short blurb about your game (optional)."
                rows={4}
                disabled={loading}
              />
            </div>

            {/* Upload Cover Image */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="game-image">Cover Image</Label>
              <Input
                type="file"
                id="game-image"
                onChange={onImageChange}
                disabled={loading}
                accept="image/*"
              />
              {imagePreview && (
                <div className="mt-2">
                  <Image
                    src={imagePreview}
                    alt="Cover Preview"
                    width={240}
                    height={135}
                    className="rounded border"
                  />
                </div>
              )}
              <p className="text-sm text-gray-500">
                JPG, PNG, GIF. Max 5MB.
              </p>
            </div>

            {/* Price */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="game-price">Price (USD)</Label>
              <Input
                id="game-price"
                type="number"
                min={0}
                step={1}
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                placeholder="0"
                disabled={loading}
              />
              <p className="text-sm text-gray-500">
                Set to 0 if you want it to be free.
              </p>
            </div>

            {/* Genre */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="game-genre">Genre</Label>
              <Select
                value={genreId}
                onValueChange={setGenreId}
                disabled={loading}
              >
                <SelectTrigger id="game-genre" className="w-full">
                  <SelectValue placeholder="Pick a genre (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {genres.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags */}
            <div className="flex flex-col gap-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-1 text-sm"
                  >
                    <Checkbox
                      checked={tagIds.includes(tag.id)}
                      onCheckedChange={() => handleTagToggle(tag.id)}
                      disabled={loading}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                Choose tags that best describe your game.
              </p>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="game-status">Status</Label>
              <Select
                value={status}
                onValueChange={(val) =>
                  setStatus(val as "DRAFT" | "PUBLISHED" | "ARCHIVED")
                }
                disabled={loading}
              >
                <SelectTrigger id="game-status" className="w-full">
                  <SelectValue placeholder="Choose status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Optional: Upload Game Version */}
            <div className="flex flex-col gap-2 pt-4 border-t">
              <h2 className="text-lg font-medium">Upload Game (Optional)</h2>

              {/* Version */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="game-version">Version</Label>
                <Input
                  id="game-version"
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="e.g. 1.0.0"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">
                  Tag this build (e.g. “1.0.0” or “Alpha-v0.1”). If blank, no
                  version will be attached.
                </p>
              </div>

              {/* Version Description */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="version-description">Version Description</Label>
                <Textarea
                  id="version-description"
                  value={versionDescription}
                  onChange={(e) => setVersionDescription(e.target.value)}
                  placeholder="What’s new in this release? (optional)"
                  rows={3}
                  disabled={loading}
                />
              </div>

              {/* Game File */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="game-file">Game File</Label>
                <Input
                  type="file"
                  id="game-file"
                  onChange={onGameFileChange}
                  disabled={loading}
                  accept=".zip,.rar,.7z"
                />
                <p className="text-sm text-gray-500">
                  ZIP or executable (Windows/Mac/Linux). Max 200MB.
                </p>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            {/* Submit */}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Uploading…" : "Create & Publish"}
            </Button>
          </form>
        </Card>

        <p className="text-gray-600">
          You can always return to add more versions or update metadata later!
        </p>
      </div>
    </div>
  );
}
