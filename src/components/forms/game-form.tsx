"use client";

import { useState, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";
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
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";

export default function GameForm({ onSuccess, initialData }: { onSuccess?: () => void, initialData?: any }) {
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
  const [gameFile, setGameFile] = useState<File | null>(null);

  // Add support for gameType (DOWNLOADABLE/HTML) from schema
  const [gameType, setGameType] = useState<"DOWNLOADABLE" | "HTML">("DOWNLOADABLE");

  const [showPreview, setShowPreview] = useState(false);

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

  // If initialData is provided (for edit), initialize state from it
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setDescription(initialData.description || "");
      setGenreId(initialData.genreId || "");
      setTagIds(initialData.tags?.map((t: any) => t.tagId) || []);
      setPrice(initialData.price || 0);
      setStatus(initialData.status || "DRAFT");
      setGameType(initialData.gameType || "DOWNLOADABLE");
      setImagePreview(initialData.image || "");
    }
  }, [initialData]);

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
      formData.append("gameType", gameType);
      if (genreId) formData.append("genreId", genreId);
      if (tagIds.length) formData.append("tagIds", JSON.stringify(tagIds));
      if (imageFile) formData.append("image", imageFile);
      // If editing, POST to /api/game/[slug]/edit, else POST to /api/game/new
      let endpoint = "/api/game/new";
      if (initialData && initialData.slug) endpoint = `/api/game/${initialData.slug}/edit`;
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message || (initialData ? "Failed to update game" : "Failed to create game"));
      }
      toast.success(initialData ? "Game updated successfully!" : "Game created successfully!");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || (initialData ? "Failed to update game." : "Failed to create game."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full p-6">
      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        {/* Title */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="game-title">Title</Label>
          <Input
            id="game-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What’s your game called?"
            required
            disabled={loading}
            className="bg-background border-muted focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
          />
        </div>
        {/* Description */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="game-description">Description <span className="text-xs text-muted-foreground">(Markdown supported)</span></Label>
          <div className="flex flex-col gap-1">
            <MDEditor
              id="game-description"
              value={description}
              onChange={(value) => setDescription(value ?? "")}
              textareaProps={{
                placeholder: 'Write a detailed description of your game. Markdown is supported.',
              }}
              previewOptions={{
                rehypePlugins: [[rehypeSanitize]],
              }}
            />
          </div>
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
            <div className="mt-2 flex justify-center">
              <Image
                src={imagePreview}
                alt="Cover Preview"
                width={240}
                height={135}
                className="rounded border shadow-md"
              />
            </div>
          )}
          <p className="text-xs text-muted-foreground">JPG, PNG, GIF. Max 5MB. Recommended: 630x500px</p>
        </div>
        {/* Price */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="game-price">Price (IDR)</Label>
          <Input
            id="game-price"
            type="number"
            min={0}
            step={1000}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            placeholder="0"
            disabled={loading}
            className="bg-background border-muted focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
          />
          <p className="text-xs text-muted-foreground">Set to 0 if you want it to be free. Price is in Indonesian Rupiah (IDR).</p>
        </div>
        {/* Genre */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="game-genre">Genre</Label>
          <Select
            value={genreId}
            onValueChange={setGenreId}
            disabled={loading}
          >
            <SelectTrigger id="game-genre" className="w-full bg-background border-muted focus:border-primary focus:ring-2 focus:ring-primary/30 transition">
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
          <Label>Tags <span className="text-xs text-muted-foreground">(Choose up to 10)</span></Label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label
                key={tag.id}
                className={`flex items-center gap-1 px-2 py-1 rounded border text-xs cursor-pointer transition ${tagIds.includes(tag.id) ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-muted-foreground hover:border-primary'}`}
              >
                <Checkbox
                  checked={tagIds.includes(tag.id)}
                  onCheckedChange={() => handleTagToggle(tag.id)}
                  disabled={loading || tagIds.length >= 10 && !tagIds.includes(tag.id)}
                  className="accent-primary"
                />
                {tag.name}
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Any other keywords someone might search to find your game. Max of 10.</p>
        </div>
        {/* Status */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="game-status">Status</Label>
          <Select
            value={status}
            onValueChange={(val) => setStatus(val as "DRAFT" | "PUBLISHED" | "ARCHIVED")}
            disabled={loading}
          >
            <SelectTrigger id="game-status" className="w-full bg-background border-muted focus:border-primary focus:ring-2 focus:ring-primary/30 transition">
              <SelectValue placeholder="Choose status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Game Type */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="game-type">Game Type</Label>
          <Select
            value={gameType}
            onValueChange={(val) => setGameType(val as "DOWNLOADABLE" | "HTML")}
            disabled={loading}
          >
            <SelectTrigger id="game-type" className="w-full bg-background border-muted focus:border-primary focus:ring-2 focus:ring-primary/30 transition">
              <SelectValue placeholder="Choose game type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DOWNLOADABLE">Downloadable</SelectItem>
              <SelectItem value="HTML">HTML/Web</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Optional: Upload Game Version */}
        <div className="flex flex-col gap-2 pt-4 border-t border-muted">
          <h2 className="text-lg font-medium">Upload Game (Optional)</h2>
          {/* Game File */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="game-file">Game File</Label>
            <Input
              type="file"
              id="game-file"
              onChange={onGameFileChange}
              disabled={loading}
              accept={gameType === "HTML" ? ".zip" : undefined}
            />
            <p className="text-xs text-muted-foreground">
              {gameType === "HTML"
                ? "ZIP file containing your web game (index.html, assets, etc). Max 200MB."
                : "ZIP or executable (Windows/Mac/Linux). Max 200MB."}
            </p>
          </div>
        </div>
        {error && <p className="text-sm text-destructive font-medium">{error}</p>}
        {/* Submit */}
        <Button type="submit" disabled={loading} className="w-full text-base font-semibold">
          {loading ? "Uploading…" : "Create & Publish"}
        </Button>
      </form>
    </Card>
  );
}
