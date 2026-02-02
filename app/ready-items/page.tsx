"use client";

import React, { useEffect, useState } from "react";
import { ReadyItem } from "@/lib/types/entities/ready-item";
import { readyItemsService } from "@/lib/services";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import ReadyItemForm from "@/components/ReadyItemForm";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Filter } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

type ReadyItemType = "SALAD" | "SOUP" | "DETOX";

const ReadyItemsPage = () => {
  const [readyItems, setReadyItems] = useState<ReadyItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReadyItem, setSelectedReadyItem] = useState<ReadyItem | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filterType, setFilterType] = useState<ReadyItemType | "all">("all");
  const [includeInactive, setIncludeInactive] = useState(true);

  const fetchReadyItems = async () => {
    try {
      setLoading(true);
      const data = await readyItemsService.findAll(
        filterType === "all" ? undefined : filterType,
        includeInactive
      );
      setReadyItems(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadyItems();
  }, [filterType, includeInactive]);

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
      key: "imageUrl",
      header: "Image",
      render: (item: ReadyItem) => (
        item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-14 h-14 rounded-lg object-cover border"
          />
        ) : (
          <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center border">
            <span className="text-xs text-muted-foreground">
              No image
            </span>
          </div>
        )
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
      render: (item: ReadyItem) => `JOD ${(item.price || 0).toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (item: ReadyItem) => (
        <div className="flex gap-1 flex-wrap">
          {item.isActive ? (
            <Badge>Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
          {item.type === "SALAD" && (item as any).allowAddOns && (
            <Badge variant="outline">Add-Ons</Badge>
          )}
        </div>
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
      <div className="space-y-6">
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

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-base">Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Type:</span>
                <Select
                  value={filterType}
                  onValueChange={(value) => setFilterType(value as ReadyItemType | "all")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="SALAD">Salad</SelectItem>
                    <SelectItem value="SOUP">Soup</SelectItem>
                    <SelectItem value="DETOX">Detox</SelectItem>
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
