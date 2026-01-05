"use client";

import React, { useEffect, useState } from "react";
import {
  PromoCode,
  CreatePromoCodeDto,
  UpdatePromoCodeDto,
  promoCodesService,
} from "@/lib/services/promo-codes.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import PromoCodeForm from "@/components/PromoCodeForm";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Calendar, Users, Percent, Banknote } from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import { format } from "date-fns";

const PromoCodesPage = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const data = await promoCodesService.findAll();
      setPromoCodes(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleSave = async (promoCode: CreatePromoCodeDto | UpdatePromoCodeDto) => {
    try {
      if (selectedPromoCode) {
        await promoCodesService.update(
          selectedPromoCode.id,
          promoCode as UpdatePromoCodeDto
        );
        showSuccess("Promo code updated successfully");
      } else {
        await promoCodesService.create(promoCode as CreatePromoCodeDto);
        showSuccess("Promo code created successfully");
      }

      fetchPromoCodes();
      setIsModalOpen(false);
      setSelectedPromoCode(null);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this promo code?"))
      return;

    try {
      await promoCodesService.remove(id);
      showSuccess("Promo code deleted successfully");
      fetchPromoCodes();
    } catch (error) {
      handleError(error);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await promoCodesService.toggleActive(id);
      showSuccess("Promo code status updated");
      fetchPromoCodes();
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    {
      key: "code",
      header: "Code",
      render: (promoCode: PromoCode) => (
        <span className="font-mono font-semibold">{promoCode.code}</span>
      ),
    },
    {
      key: "description",
      header: "Description",
      render: (promoCode: PromoCode) => (
        <span className="text-sm text-gray-600">
          {promoCode.description || "-"}
        </span>
      ),
    },
    {
      key: "discount",
      header: "Discount",
      render: (promoCode: PromoCode) => (
        <div className="flex items-center gap-1">
          {promoCode.discountType === "PERCENTAGE" ? (
            <>
              <Percent className="w-4 h-4 text-blue-600" />
              <span className="font-medium">{promoCode.discountValue}%</span>
            </>
          ) : (
            <>
              <Banknote className="w-4 h-4 text-green-600" />
              <span className="font-medium">JOD {promoCode.discountValue.toFixed(2)}</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: "usage",
      header: "Usage",
      render: (promoCode: PromoCode) => (
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            {promoCode.currentUsage}
            {promoCode.maxTotalUsage ? ` / ${promoCode.maxTotalUsage}` : " / ∞"}
          </span>
        </div>
      ),
    },
    {
      key: "expires",
      header: "Expires",
      render: (promoCode: PromoCode) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            {promoCode.expiresAt
              ? format(new Date(promoCode.expiresAt), "MMM d, yyyy")
              : "Never"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (promoCode: PromoCode) => (
        <div className="flex items-center gap-2">
          {promoCode.isActive ? (
            <Badge variant="default">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
          {promoCode.oneTimePerCustomer && (
            <Badge variant="outline" className="text-xs">
              1x/customer
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (promoCode: PromoCode) => (
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedPromoCode(promoCode);
              setIsModalOpen(true);
            }}
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleActive(promoCode.id)}
            title={promoCode.isActive ? "Deactivate" : "Activate"}
          >
            <Badge variant={promoCode.isActive ? "default" : "secondary"}>
              {promoCode.isActive ? "Active" : "Inactive"}
            </Badge>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(promoCode.id)}
            title="Delete"
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
            <h1 className="page-title">Promo Codes</h1>
            <p className="page-description">
              Manage promotional discount codes for customers
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedPromoCode(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Promo Code
          </Button>
        </div>

        <DataTable
          title="All Promo Codes"
          data={promoCodes}
          columns={columns}
          loading={loading}
          emptyMessage="No promo codes found"
          emptyDescription="Create your first promo code to get started"
          getRowKey={(promoCode) => promoCode.id}
        />

        {isModalOpen && (
          <PromoCodeForm
            promoCode={selectedPromoCode}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedPromoCode(null);
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default PromoCodesPage;
