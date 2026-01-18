"use client";

import React, { useEffect, useState } from "react";
import { Ingredient } from "@/lib/types/entities/ingredient";
import { Category } from "@/lib/types/entities/category";
import { ingredientsService, categoriesService } from "@/lib/services";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import IngredientForm from "@/components/IngredientForm";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Filter } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const IngredientsPage = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] =
    useState<Ingredient | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filterCategoryId, setFilterCategoryId] = useState<string>("all");
  const [includeInactive, setIncludeInactive] = useState(true);

  const fetchCategories = async () => {
    try {
      const data = await categoriesService.findAll(undefined, true);
      setCategories(data);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientsService.findAll(
        filterCategoryId === "all" ? undefined : filterCategoryId,
        includeInactive
      );
      setIngredients(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchIngredients();
  }, [filterCategoryId, includeInactive]);

  const handleSave = async (formData: FormData) => {
    try {
      if (selectedIngredient) {
        await ingredientsService.update(selectedIngredient.id, formData);
        showSuccess("Ingredient updated successfully");
      } else {
        await ingredientsService.create(formData);
        showSuccess("Ingredient created successfully");
      }

      fetchIngredients();
      setIsModalOpen(false);
      setSelectedIngredient(null);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ingredient?"))
      return;

    try {
      await ingredientsService.remove(id);
      showSuccess("Ingredient deleted successfully");
      fetchIngredients();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title">Ingredients</h1>
            <p className="page-description">
              Manage available ingredients and their categories
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedIngredient(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Ingredient
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-base">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Category:</span>
                <Select
                  value={filterCategoryId}
                  onValueChange={setFilterCategoryId}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Show Inactive:</span>
                <Switch
                  checked={includeInactive}
                  onCheckedChange={setIncludeInactive}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Ingredients</CardTitle>
            <CardDescription>
              A list of all ingredients in your inventory
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : ingredients.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg font-medium text-muted-foreground">
                  No ingredients found
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first ingredient to get started
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingredients.map((ingredient) => (
                    <TableRow key={ingredient.id}>
                      <TableCell>
                        {ingredient.imageUrl ? (
                          <img
                            src={ingredient.imageUrl}
                            alt={ingredient.name}
                            className="w-14 h-14 rounded-lg object-cover border"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center border">
                            <span className="text-xs text-muted-foreground">
                              No image
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{ingredient.name}</span>
                      </TableCell>
                      <TableCell>{ingredient.category?.name ?? "—"}</TableCell>
                      <TableCell>
                        {ingredient.isActive ? (
                          <Badge>Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedIngredient(ingredient);
                              setIsModalOpen(true);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(ingredient.id)}
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
          <IngredientForm
            ingredient={selectedIngredient}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedIngredient(null);
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default IngredientsPage;
