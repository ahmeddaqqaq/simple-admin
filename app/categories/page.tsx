"use client";

import React, { useEffect, useState } from "react";
import { CreateCategoryDto, UpdateCategoryDto } from "@/lib/api";
import { Category } from "@/lib/types/entities/category";
import { categoriesService } from "@/lib/services";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import CategoryForm from "@/components/CategoryForm";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus } from "lucide-react";
import { PageTransition } from "@/components/page-transition";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.findAll();
      setCategories(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSave = async (
    category: CreateCategoryDto | UpdateCategoryDto
  ) => {
    try {
      if (selectedCategory) {
        await categoriesService.update(
          selectedCategory.id,
          category as UpdateCategoryDto
        );
        showSuccess("Category updated successfully");
      } else {
        await categoriesService.create(category as CreateCategoryDto);
        showSuccess("Category created successfully");
      }

      fetchCategories();
      setIsModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;

    try {
      await categoriesService.remove(id);
      showSuccess("Category deleted successfully");
      fetchCategories();
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    {
      key: 'name',
      header: 'Name',
      render: (category: Category) => (
        <span className="font-medium">{category.name}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (category: Category) => category.type,
    },
    {
      key: 'status',
      header: 'Status',
      render: (category: Category) =>
        category.isActive ? (
          <Badge variant="default">Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      align: 'right' as const,
      render: (category: Category) => (
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedCategory(category);
              setIsModalOpen(true);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(category.id)}
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
            <h1 className="page-title">Categories</h1>
            <p className="page-description">
              Manage product or content categories
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedCategory(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Category
          </Button>
        </div>

        <DataTable
          title="All Categories"
          data={categories}
          columns={columns}
          loading={loading}
          emptyMessage="No categories found"
          emptyDescription="Create your first category to get started"
          getRowKey={(category) => category.id}
        />

        {isModalOpen && (
          <CategoryForm
            category={selectedCategory}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedCategory(null);
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default CategoriesPage;
