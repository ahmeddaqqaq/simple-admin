"use client";

import React, { useEffect, useState } from "react";
import { Ingredient } from "@/lib/types/entities/ingredient";
import { ingredientsService } from "@/lib/services";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import IngredientForm from "@/components/IngredientForm";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageTransition } from "@/components/page-transition";

const IngredientsPage = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const fetchIngredients = async () => {
    try {
      setLoading(true);
      const data = await ingredientsService.findAll();
      setIngredients(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

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

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (ingredient: Ingredient) => (
        ingredient.imageUrl ? (
          <img
            src={ingredient.imageUrl}
            alt={ingredient.name}
            className="w-14 h-14 rounded-lg object-cover border"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center border">
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        )
      ),
    },
    {
      key: 'name',
      header: 'Name',
      render: (ingredient: Ingredient) => (
        <span className="font-medium">{ingredient.name}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (ingredient: Ingredient) => ingredient.category?.name ?? "—",
    },
    {
      key: 'status',
      header: 'Status',
      render: (ingredient: Ingredient) =>
        ingredient.isActive ? (
          <Badge>Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (ingredient: Ingredient) => (
        <div className="space-x-2">
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
      ),
    },
  ];

  return (
    <PageTransition>
      <div className="page-container">
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

        <DataTable
          title="All Ingredients"
          data={ingredients}
          columns={columns}
          loading={loading}
          emptyMessage="No ingredients found"
          emptyDescription="Create your first ingredient to get started"
          getRowKey={(ingredient) => ingredient.id}
        />

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
