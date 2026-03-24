"use client";

import React, { useEffect, useState } from "react";
import { carouselService, CarouselSlide } from "@/lib/services/carousel.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Images } from "lucide-react";

interface SlideFormState {
  image: File | null;
  imagePreview: string; // existing URL for edit mode, or object URL for new file
  route: string;
  displayOrder: number;
  isActive: boolean;
}

const CAROUSEL_ROUTES: { label: string; value: string }[] = [
  { label: "Build Meal", value: "/build-meal/0" },
  { label: "Freshies", value: "/build-meal/1" },
  { label: "Salads", value: "/build-meal/2" },
  { label: "Sandwiches", value: "/build-meal/3" },
  { label: "Popular Items", value: "/popular-items" },
  { label: "Coins", value: "/coins" },
  { label: "Subscriptions", value: "/subscriptions" },
  { label: "Loyalty", value: "/loyalty" },
  { label: "Favorites", value: "/favorites" },
];

const defaultForm: SlideFormState = {
  image: null,
  imagePreview: "",
  route: "",
  displayOrder: 0,
  isActive: true,
};

const CarouselPage = () => {
  const [slides, setSlides] = useState<CarouselSlide[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlide, setSelectedSlide] = useState<CarouselSlide | null>(null);
  const [form, setForm] = useState<SlideFormState>(defaultForm);
  const [saving, setSaving] = useState(false);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const data = await carouselService.findAll();
      setSlides(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const openCreateModal = () => {
    setSelectedSlide(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  };

  const openEditModal = (slide: CarouselSlide) => {
    setSelectedSlide(slide);
    setForm({
      image: null,
      imagePreview: slide.imageUrl,
      route: slide.route,
      displayOrder: slide.displayOrder,
      isActive: slide.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSlide(null);
    setForm(defaultForm);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setForm((prev) => ({ ...prev, image: file, imagePreview: preview }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlide && !form.image) {
      handleError(new Error("Please select a WEBP image to upload"));
      return;
    }
    setSaving(true);
    try {
      if (selectedSlide) {
        await carouselService.update(selectedSlide.id, {
          ...(form.image && { image: form.image }),
          route: form.route,
          displayOrder: form.displayOrder,
          isActive: form.isActive,
        });
        showSuccess("Carousel slide updated successfully");
      } else {
        await carouselService.create({
          image: form.image!,
          route: form.route,
          displayOrder: form.displayOrder,
        });
        showSuccess("Carousel slide created successfully");
      }
      fetchSlides();
      closeModal();
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this carousel slide?")) return;
    try {
      await carouselService.remove(id);
      showSuccess("Carousel slide deleted successfully");
      fetchSlides();
    } catch (error) {
      handleError(error);
    }
  };

  const handleToggleActive = async (slide: CarouselSlide) => {
    try {
      await carouselService.update(slide.id, { isActive: !slide.isActive });
      showSuccess(`Slide ${!slide.isActive ? "activated" : "deactivated"} successfully`);
      fetchSlides();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Carousel</h1>
            <p className="page-description">Manage app carousel slides</p>
          </div>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            New Slide
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Slides</CardTitle>
            <CardDescription>Carousel slides displayed in the app, ordered by display order</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : slides.length === 0 ? (
              <div className="text-center py-12">
                <Images className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-lg font-medium text-muted-foreground">No slides found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first carousel slide to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Preview</TableHead>
                    <TableHead>Route</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-px whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slides.map((slide) => (
                    <TableRow key={slide.id}>
                      <TableCell>
                        {slide.imageUrl ? (
                          <img
                            src={slide.imageUrl}
                            alt="Slide"
                            className="w-24 h-14 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-24 h-14 rounded-lg bg-muted flex items-center justify-center border">
                            <span className="text-xs text-muted-foreground">No image</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {CAROUSEL_ROUTES.find((r) => r.value === slide.route)?.label ?? (slide.route || "—")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{slide.displayOrder}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={slide.isActive}
                            onCheckedChange={() => handleToggleActive(slide)}
                          />
                          <span className="text-sm text-muted-foreground">
                            {slide.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="w-px whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditModal(slide)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(slide.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {isModalOpen && (
          <Modal
            open={isModalOpen}
            onClose={closeModal}
            title={selectedSlide ? "Edit Carousel Slide" : "Create Carousel Slide"}
            size="md"
          >
            <form onSubmit={handleSave} className="space-y-4">
              <FormField label={selectedSlide ? "Replace Image" : "Image"} required={!selectedSlide}>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  required={!selectedSlide}
                />
              </FormField>

              {form.imagePreview && (
                <div className="rounded-lg overflow-hidden border aspect-video bg-muted">
                  <img
                    src={form.imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              <FormField label="Route (deep link)" required>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={form.route}
                  onChange={(e) => setForm({ ...form, route: e.target.value })}
                  required
                >
                  <option value="" disabled>Select a destination</option>
                  {CAROUSEL_ROUTES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </FormField>

              <FormField label="Display Order">
                <Input
                  type="number"
                  placeholder="0"
                  value={form.displayOrder}
                  onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })}
                />
              </FormField>

              {selectedSlide && (
                <FormField label="Status">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={(val) => setForm({ ...form, isActive: val })}
                    />
                    <span className="text-sm">{form.isActive ? "Active" : "Inactive"}</span>
                  </div>
                </FormField>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="secondary" type="button" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </PageTransition>
  );
};

export default CarouselPage;
