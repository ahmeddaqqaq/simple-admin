"use client";

import React, { useEffect, useState } from "react";
import {
  SubscriptionPlan,
  CreateSubscriptionPlanDto,
  UpdateSubscriptionPlanDto,
  subscriptionPlansService,
} from "@/lib/services/subscription-plans.service";
import { handleError, showSuccess } from "@/lib/utils/error-handler";
import SubscriptionPlanForm from "@/components/SubscriptionPlanForm";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Plus, Coins, Calendar, List } from "lucide-react";
import { PageTransition } from "@/components/page-transition";

const SubscriptionPlansPage = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await subscriptionPlansService.findAll(true); // Include inactive
      setPlans(data);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSave = async (plan: CreateSubscriptionPlanDto | UpdateSubscriptionPlanDto) => {
    try {
      if (selectedPlan) {
        await subscriptionPlansService.update(
          selectedPlan.id,
          plan as UpdateSubscriptionPlanDto
        );
        showSuccess("Subscription plan updated successfully");
      } else {
        await subscriptionPlansService.create(plan as CreateSubscriptionPlanDto);
        showSuccess("Subscription plan created successfully");
      }

      fetchPlans();
      setIsModalOpen(false);
      setSelectedPlan(null);
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subscription plan? This will soft delete the plan."))
      return;

    try {
      await subscriptionPlansService.remove(id);
      showSuccess("Subscription plan deleted successfully");
      fetchPlans();
    } catch (error) {
      handleError(error);
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      await subscriptionPlansService.toggleActive(id);
      showSuccess("Subscription plan status updated");
      fetchPlans();
    } catch (error) {
      handleError(error);
    }
  };

  const columns = [
    {
      key: "name",
      header: "Plan Name",
      render: (plan: SubscriptionPlan) => (
        <div>
          <span className="font-semibold">{plan.name}</span>
          {plan.description && (
            <p className="text-sm text-muted-foreground">{plan.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "coins",
      header: "Coins",
      render: (plan: SubscriptionPlan) => (
        <div className="flex items-center gap-1">
          <Coins className="w-4 h-4 text-yellow-600" />
          <span className="font-medium">{plan.coinCost} coins</span>
          <span className="text-sm text-muted-foreground">({plan.coinCost} JOD)</span>
        </div>
      ),
    },
    {
      key: "validity",
      header: "Validity",
      render: (plan: SubscriptionPlan) => (
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{plan.validityDays} days</span>
        </div>
      ),
    },
    {
      key: "features",
      header: "Features",
      render: (plan: SubscriptionPlan) => (
        <div className="flex items-center gap-1">
          <List className="w-4 h-4 text-gray-500" />
          <span className="text-sm">
            {plan.features?.length || 0} features
          </span>
        </div>
      ),
    },
    {
      key: "sortOrder",
      header: "Order",
      render: (plan: SubscriptionPlan) => (
        <Badge variant="outline">{plan.sortOrder}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (plan: SubscriptionPlan) => (
        <div>
          {plan.isActive ? (
            <Badge variant="default">Active</Badge>
          ) : (
            <Badge variant="secondary">Inactive</Badge>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right" as const,
      render: (plan: SubscriptionPlan) => (
        <div className="space-x-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSelectedPlan(plan);
              setIsModalOpen(true);
            }}
            title="Edit"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleToggleActive(plan.id)}
            title={plan.isActive ? "Deactivate" : "Activate"}
          >
            <Badge variant={plan.isActive ? "default" : "secondary"}>
              {plan.isActive ? "Active" : "Inactive"}
            </Badge>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDelete(plan.id)}
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
            <h1 className="page-title">Subscription Plans</h1>
            <p className="page-description">
              Manage gold coin subscription plans for customers
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedPlan(null);
              setIsModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Plan
          </Button>
        </div>

        <DataTable
          title="All Subscription Plans"
          data={plans}
          columns={columns}
          loading={loading}
          emptyMessage="No subscription plans found"
          emptyDescription="Create your first subscription plan to get started"
          getRowKey={(plan) => plan.id}
        />

        {isModalOpen && (
          <SubscriptionPlanForm
            plan={selectedPlan}
            onSave={handleSave}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedPlan(null);
            }}
          />
        )}
      </div>
    </PageTransition>
  );
};

export default SubscriptionPlansPage;
