"use client";

import React, { useEffect, useState } from "react";
import { ReadyItem } from "@/lib/types/entities/ready-item";
import { readyItemsService } from "@/lib/services";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import ReadyItemForm from "@/components/ReadyItemForm";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { PageTransition } from "@/components/page-transition";

const ReadyItemsPage = () => {
  const [readyItems, setReadyItems] = useState<ReadyItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReadyItem, setSelectedReadyItem] = useState<ReadyItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const fetchReadyItems = async () => {
    try {
      setLoading(true);
      const data = await readyItemsService.findAll(undefined, true);
      setReadyItems(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyItems();
  }, []);

  const handleSave = async (formData: FormData) => {
    try {
      if (selectedReadyItem) {
        await readyItemsService.update(selectedReadyItem.id, formData);
        showSuccess("Ready item updated successfully");
      } else {
        await readyItemsService.create(formData);
        showSuccess("Ready item created successfully");
      }

      fetchReadyItems();
      setIsModalOpen(false);
      setSelectedReadyItem(null);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this ready item?"))
      return;

    try {
      await readyItemsService.remove(id);
      showSuccess("Ready item deleted successfully");
      fetchReadyItems();
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    {
      key: "image",
      header: "Image",
      render: (item: ReadyItem) => (
        <img
          src={item.image}
          alt={item.name}
          className="w-14 h-14 rounded-lg object-cover border"
        />
      ),
    },
    {
      key: "name",
      header: "Name",
      render: (item: ReadyItem) => (
        <span className="font-medium">{item.name}</span>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (item: ReadyItem) => item.type,
    },
    {
      key: "price",
      header: "Price",
      render: (item: ReadyItem) => `$${(item.price || 0).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (item: ReadyItem) =>
        item.isActive ? (
          <Badge>Active</Badge>
        ) : (
          <Badge variant="secondary">Inactive</Badge>
        ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (item: ReadyItem) => (
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedReadyItem(item);
              setIsModalOpen(true);
            }}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(item.id)}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageTransition>
      <div>
        <div className="page-header">
          <div>
            <h1 className="page-title">Ready Items</h1>
            <p className="page-description">Manage ready-to-serve items</p>
          </div>
          <Button
            onClick={() => {
              setSelectedReadyItem(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Ready Item
          </Button>
        </div>

        <DataTable
          title="All Ready Items"
          data={readyItems}
          columns={columns}
          loading={loading}
          emptyMessage="No ready items found"
          emptyDescription="Create your first ready item to get started"
          getRowKey={(item) => item.id}
        />

        {isModalOpen && (
          <ReadyItemForm
            readyItem={selectedReadyItem}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedReadyItem(null);
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default ReadyItemsPage;
