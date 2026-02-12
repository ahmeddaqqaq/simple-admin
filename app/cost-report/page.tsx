"use client";

import React, { useEffect, useRef, useState } from "react";
import { CostReportData, reportsService } from "@/lib/services/reports.service";
import {
  deliveryExpensesService,
  DeliveryExpense,
} from "@/lib/services/delivery-expenses.service";
import {
  operationalCostsService,
  OperationalCost,
} from "@/lib/services/operational-costs.service";
import { handleError } from "@/lib/utils/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Filter,
  Loader2,
  Truck,
  Box,
  Utensils,
  Leaf,
  Download,
  Briefcase,
} from "lucide-react";
import { PageTransition } from "@/components/page-transition";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const CostReportsPage = () => {
  const [report, setReport] = useState<CostReportData | null>(null);
  const [deliveryExpenses, setDeliveryExpenses] = useState<DeliveryExpense[]>(
    [],
  );
  const [operationalCosts, setOperationalCosts] = useState<OperationalCost[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Date range - default to today
  const today = new Date();
  const [startDate, setStartDate] = useState(today.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const [data, expenses, opCosts] = await Promise.all([
        reportsService.getCostReport(start, end),
        deliveryExpensesService.findAll(start, end),
        operationalCostsService.findAll(),
      ]);
      setReport(data);
      setDeliveryExpenses(expenses);
      setOperationalCosts(opCosts);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleGenerateReport = () => {
    fetchReport();
  };

  const formatCurrency = (amount: number) => `JOD ${amount.toFixed(2)}`;
  const formatCostPerGram = (amount: number) => `JOD ${amount.toFixed(7)}`;

  const setDateRange = (range: "today" | "yesterday" | "week" | "month") => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (range) {
      case "today":
        start = new Date(now);
        end = new Date(now);
        break;
      case "yesterday":
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        end = new Date(start);
        break;
      case "week":
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        end = new Date(now);
        break;
      case "month":
        start = new Date(now);
        start.setDate(start.getDate() - 30);
        end = new Date(now);
        break;
    }

    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
  };

  const totalDeliveryExpenses = deliveryExpenses.reduce(
    (sum, e) => sum + e.cost,
    0,
  );

  // Operational costs computations
  const totalMonthlyOperational = operationalCosts.reduce(
    (sum, c) => sum + c.monthlyCost,
    0,
  );
  const dailyOperationalCost = totalMonthlyOperational / 30;
  const daysDiff = report
    ? Math.max(
        1,
        Math.ceil(
          (new Date(endDate).getTime() - new Date(startDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1,
      )
    : 1;
  const periodOperationalCost = dailyOperationalCost * daysDiff;

  const handleExportPDF = () => {
    if (!report) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formatDate = (dateStr: string) =>
      new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

    const totalCostWithOp = report.summary.totalCost + periodOperationalCost;
    const netProfitAfterOp = report.summary.grossProfit - periodOperationalCost;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Cost Report - ${formatDate(startDate)} to ${formatDate(endDate)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            padding: 40px;
            color: #1a1a1a;
            line-height: 1.5;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e5e5;
          }
          .header h1 { font-size: 28px; margin-bottom: 8px; }
          .header p { color: #666; font-size: 14px; }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 16px;
            margin-bottom: 30px;
          }
          .summary-grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 30px;
          }
          .summary-card {
            background: #f8f9fa;
            padding: 16px;
            border-radius: 8px;
            text-align: center;
          }
          .summary-card .label { font-size: 12px; color: #666; margin-bottom: 4px; }
          .summary-card .value { font-size: 24px; font-weight: bold; }
          .summary-card .subvalue { font-size: 12px; color: #888; }
          .section { margin-bottom: 30px; }
          .section h2 {
            font-size: 18px;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 1px solid #e5e5e5;
          }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th, td { padding: 10px 12px; text-align: left; border-bottom: 1px solid #e5e5e5; }
          th { background: #f8f9fa; font-weight: 600; }
          tr:last-child td { border-bottom: none; }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .text-red { color: #dc2626; }
          .text-green { color: #16a34a; }
          .text-orange { color: #ea580c; }
          .total-row { background: #f8f9fa; font-weight: bold; }
          .generated-at {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #888;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Cost Report</h1>
          <p>${formatDate(startDate)} - ${formatDate(endDate)}</p>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Total Revenue</div>
            <div class="value text-green">JOD ${report.summary.totalRevenue.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Total Cost</div>
            <div class="value text-red">JOD ${report.summary.totalCost.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Gross Profit</div>
            <div class="value" style="color: ${report.summary.grossProfit >= 0 ? "#16a34a" : "#dc2626"}">JOD ${report.summary.grossProfit.toFixed(2)}</div>
          </div>
          <div class="summary-card">
            <div class="label">Profit Margin</div>
            <div class="value" style="color: ${report.summary.profitMargin >= 0 ? "#16a34a" : "#dc2626"}">${report.summary.profitMargin.toFixed(1)}%</div>
          </div>
          <div class="summary-card">
            <div class="label">Cost Margin</div>
            <div class="value text-orange">${report.summary.costMargin.toFixed(1)}%</div>
          </div>
        </div>

        ${
          operationalCosts.length > 0
            ? `
        <div class="summary-grid-3">
          <div class="summary-card" style="border-left: 4px solid #6366f1;">
            <div class="label">Operational Cost (${daysDiff} days)</div>
            <div class="value text-red">JOD ${periodOperationalCost.toFixed(2)}</div>
            <div class="subvalue">JOD ${dailyOperationalCost.toFixed(2)}/day x ${daysDiff} days</div>
          </div>
          <div class="summary-card" style="border-left: 4px solid #dc2626;">
            <div class="label">Total Cost + Operational</div>
            <div class="value text-red">JOD ${totalCostWithOp.toFixed(2)}</div>
          </div>
          <div class="summary-card" style="border-left: 4px solid ${netProfitAfterOp >= 0 ? "#16a34a" : "#dc2626"};">
            <div class="label">Net Profit (after Operational)</div>
            <div class="value" style="color: ${netProfitAfterOp >= 0 ? "#16a34a" : "#dc2626"}">JOD ${netProfitAfterOp.toFixed(2)}</div>
          </div>
        </div>
        `
            : ""
        }

        <div class="section">
          <h2>Cost Breakdown</h2>
          <table>
            <tr><td>Ingredients Cost</td><td class="text-right text-red">JOD ${report.summary.totalIngredientsCost.toFixed(2)}</td></tr>
            <tr><td>Ready Items Cost</td><td class="text-right text-red">JOD ${report.summary.totalReadyItemsCost.toFixed(2)}</td></tr>
            <tr><td>Packaging Cost</td><td class="text-right text-red">JOD ${report.summary.totalPackagingCost.toFixed(2)}</td></tr>
            <tr><td>Delivery Expenses</td><td class="text-right text-green">JOD ${totalDeliveryExpenses.toFixed(2)}</td></tr>
            <tr class="total-row"><td>Total Items Cost</td><td class="text-right text-red">JOD ${report.summary.totalCost.toFixed(2)}</td></tr>
          </table>
        </div>

        <div class="section">
          <h2>Packaging Breakdown</h2>
          <table>
            <thead>
              <tr><th>Item</th><th class="text-center">Count</th><th class="text-right">Unit Cost</th><th class="text-right">Total</th></tr>
            </thead>
            <tbody>
              <tr><td>Meal Boxes</td><td class="text-center">${report.packaging.mealBoxes.count}</td><td class="text-right">JOD ${report.packaging.mealBoxes.unitCost.toFixed(2)}</td><td class="text-right">JOD ${report.packaging.mealBoxes.totalCost.toFixed(2)}</td></tr>
              <tr><td>Salad Boxes</td><td class="text-center">${report.packaging.saladBoxes.count}</td><td class="text-right">JOD ${report.packaging.saladBoxes.unitCost.toFixed(2)}</td><td class="text-right">JOD ${report.packaging.saladBoxes.totalCost.toFixed(2)}</td></tr>
              <tr><td>Detox Bottles</td><td class="text-center">${report.packaging.detoxBottles.count}</td><td class="text-right">JOD ${report.packaging.detoxBottles.unitCost.toFixed(2)}</td><td class="text-right">JOD ${report.packaging.detoxBottles.totalCost.toFixed(2)}</td></tr>
              <tr><td>Wood Cutlery</td><td class="text-center">${report.packaging.woodCutlery.count}</td><td class="text-right">JOD ${report.packaging.woodCutlery.unitCost.toFixed(2)}</td><td class="text-right">JOD ${report.packaging.woodCutlery.totalCost.toFixed(2)}</td></tr>
              <tr><td>Plastic Cutlery</td><td class="text-center">${report.packaging.plasticCutlery.count}</td><td class="text-right">JOD ${report.packaging.plasticCutlery.unitCost.toFixed(2)}</td><td class="text-right">JOD ${report.packaging.plasticCutlery.totalCost.toFixed(2)}</td></tr>
              <tr><td>Bags</td><td class="text-center">${report.packaging.bags.count}</td><td class="text-right">JOD ${report.packaging.bags.unitCost.toFixed(2)}</td><td class="text-right">JOD ${report.packaging.bags.totalCost.toFixed(2)}</td></tr>
              <tr class="total-row"><td colspan="3">Total Packaging</td><td class="text-right">JOD ${report.packaging.totalPackagingCost.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>

        ${
          report.ingredients.length > 0
            ? `
        <div class="section">
          <h2>Ingredients Cost</h2>
          <table>
            <thead>
              <tr><th>Ingredient</th><th>Category</th><th class="text-right">Total Grams</th><th class="text-right">Cost/g</th><th class="text-right">Total Cost</th></tr>
            </thead>
            <tbody>
              ${report.ingredients.map((ing) => `<tr><td>${ing.name}</td><td>${ing.categoryName}</td><td class="text-right">${ing.totalGrams.toFixed(0)}g</td><td class="text-right">JOD ${ing.costPerGram.toFixed(7)}</td><td class="text-right">JOD ${ing.totalCost.toFixed(2)}</td></tr>`).join("")}
              <tr class="total-row"><td colspan="4">Total</td><td class="text-right">JOD ${report.summary.totalIngredientsCost.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        ${
          report.readyItems.length > 0
            ? `
        <div class="section">
          <h2>Ready Items Cost</h2>
          <table>
            <thead>
              <tr><th>Item</th><th>Type</th><th class="text-center">Qty</th><th class="text-right">Unit Cost</th><th class="text-right">Total Cost</th></tr>
            </thead>
            <tbody>
              ${report.readyItems.map((item) => `<tr><td>${item.name}</td><td>${item.type}</td><td class="text-center">${item.quantity}</td><td class="text-right">JOD ${item.costPrice.toFixed(2)}</td><td class="text-right">JOD ${item.totalCost.toFixed(2)}</td></tr>`).join("")}
              <tr class="total-row"><td colspan="4">Total</td><td class="text-right">JOD ${report.summary.totalReadyItemsCost.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        ${
          deliveryExpenses.length > 0
            ? `
        <div class="section">
          <h2>Delivery Expenses</h2>
          <table>
            <thead>
              <tr><th>Location</th><th>Date & Time</th><th class="text-right">Cost</th></tr>
            </thead>
            <tbody>
              ${deliveryExpenses.map((e) => `<tr><td>${e.deliveryLocation}</td><td>${new Date(e.createdAt).toLocaleString()}</td><td class="text-right">JOD ${e.cost.toFixed(2)}</td></tr>`).join("")}
              <tr class="total-row"><td colspan="2">Total</td><td class="text-right">JOD ${totalDeliveryExpenses.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        ${
          operationalCosts.length > 0
            ? `
        <div class="section">
          <h2>Operational Costs</h2>
          <table>
            <thead>
              <tr><th>Name</th><th class="text-right">Monthly Cost</th><th class="text-right">Daily Cost</th></tr>
            </thead>
            <tbody>
              ${operationalCosts.map((c) => `<tr><td>${c.name}</td><td class="text-right">JOD ${c.monthlyCost.toFixed(2)}</td><td class="text-right">JOD ${(c.monthlyCost / 30).toFixed(2)}</td></tr>`).join("")}
              <tr class="total-row"><td>Total</td><td class="text-right">JOD ${totalMonthlyOperational.toFixed(2)}</td><td class="text-right">JOD ${dailyOperationalCost.toFixed(2)}</td></tr>
            </tbody>
          </table>
        </div>
        `
            : ""
        }

        <div class="generated-at">
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="page-header flex items-center justify-between">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <FileText className="w-8 h-8" />
              Cost Reports
            </h1>
            <p className="page-description">
              View cost breakdown including ingredients, ready items, and
              packaging
            </p>
          </div>
          <Button onClick={handleExportPDF} disabled={!report || loading}>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>

        {/* Date Range Selector */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-base">Date Range</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange("today")}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange("yesterday")}
                >
                  Yesterday
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange("week")}
                >
                  Last 7 Days
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDateRange("month")}
                >
                  Last 30 Days
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-[160px]"
                  />
                </div>
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-[160px]"
                />
              </div>
              <Button onClick={handleGenerateReport} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Generate Report"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {report && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Revenue
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(report.summary.totalRevenue)}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500/50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Cost
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(report.summary.totalCost)}
                      </p>
                    </div>
                    <Package className="w-8 h-8 text-red-500/50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Gross Profit
                      </p>
                      <p
                        className={`text-2xl font-bold ${report.summary.grossProfit >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {formatCurrency(report.summary.grossProfit)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Profit Margin
                      </p>
                      <p
                        className={`text-2xl font-bold ${report.summary.profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}
                      >
                        {report.summary.profitMargin.toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Cost Margin
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {report.summary.costMargin.toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-orange-500/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Items Cost</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(report.summary.totalItemsCost)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Ingredients + Ready Items
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Ingredients Cost
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(report.summary.totalIngredientsCost)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Ready Items Cost
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(report.summary.totalReadyItemsCost)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">
                    Packaging Cost
                  </p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(report.summary.totalPackagingCost)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Oj's Delivery</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency(totalDeliveryExpenses)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {deliveryExpenses.length} deliveries
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Operational Cost Cards */}
            {operationalCosts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-l-4 border-l-indigo-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Operational Cost ({daysDiff} days)
                        </p>
                        <p className="text-2xl font-bold text-indigo-600">
                          {formatCurrency(periodOperationalCost)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(dailyOperationalCost)}/day x{" "}
                          {daysDiff} days
                        </p>
                      </div>
                      <Briefcase className="w-8 h-8 text-indigo-500/50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-red-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Cost + Operational
                        </p>
                        <p className="text-2xl font-bold text-red-600">
                          {formatCurrency(
                            report.summary.totalCost + periodOperationalCost,
                          )}
                        </p>
                      </div>
                      <Package className="w-8 h-8 text-red-500/50" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Net Profit (after Operational)
                        </p>
                        <p
                          className={`text-2xl font-bold ${
                            report.summary.grossProfit -
                              periodOperationalCost >=
                            0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {formatCurrency(
                            report.summary.grossProfit - periodOperationalCost,
                          )}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Packaging Cost Breakdown */}
            {report.packaging && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Packaging Cost Breakdown
                  </CardTitle>
                  <CardDescription>
                    Individual packaging item costs from delivered orders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                    <Card className="border-2 border-blue-100">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Box className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Meal Boxes</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {report.packaging.mealBoxes.count}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{" "}
                          {formatCurrency(report.packaging.mealBoxes.unitCost)}{" "}
                          each
                        </p>
                        <p className="text-lg font-semibold text-red-600 mt-1">
                          {formatCurrency(report.packaging.mealBoxes.totalCost)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-green-100">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Leaf className="w-5 h-5 text-green-500" />
                          <span className="font-medium">Salad Boxes</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {report.packaging.saladBoxes.count}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{" "}
                          {formatCurrency(report.packaging.saladBoxes.unitCost)}{" "}
                          each
                        </p>
                        <p className="text-lg font-semibold text-red-600 mt-1">
                          {formatCurrency(
                            report.packaging.saladBoxes.totalCost,
                          )}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-100">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5 text-purple-500" />
                          <span className="font-medium">Detox Bottles</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {report.packaging.detoxBottles.count}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{" "}
                          {formatCurrency(
                            report.packaging.detoxBottles.unitCost,
                          )}{" "}
                          each
                        </p>
                        <p className="text-lg font-semibold text-red-600 mt-1">
                          {formatCurrency(
                            report.packaging.detoxBottles.totalCost,
                          )}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-100">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Utensils className="w-5 h-5 text-amber-600" />
                          <span className="font-medium">Wood Cutlery</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {report.packaging.woodCutlery.count}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{" "}
                          {formatCurrency(
                            report.packaging.woodCutlery.unitCost,
                          )}{" "}
                          each
                        </p>
                        <p className="text-lg font-semibold text-red-600 mt-1">
                          {formatCurrency(
                            report.packaging.woodCutlery.totalCost,
                          )}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-gray-100">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Utensils className="w-5 h-5 text-gray-500" />
                          <span className="font-medium">Plastic Cutlery</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {report.packaging.plasticCutlery.count}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @{" "}
                          {formatCurrency(
                            report.packaging.plasticCutlery.unitCost,
                          )}{" "}
                          each
                        </p>
                        <p className="text-lg font-semibold text-red-600 mt-1">
                          {formatCurrency(
                            report.packaging.plasticCutlery.totalCost,
                          )}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-orange-100">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5 text-orange-500" />
                          <span className="font-medium">Bags</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {report.packaging.bags.count}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          @ {formatCurrency(report.packaging.bags.unitCost)}{" "}
                          each
                        </p>
                        <p className="text-lg font-semibold text-red-600 mt-1">
                          {formatCurrency(report.packaging.bags.totalCost)}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Ingredients Table */}
            {report.ingredients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Ingredients Cost
                  </CardTitle>
                  <CardDescription>
                    Cost breakdown by ingredient (from completed orders)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">
                          Total Grams
                        </TableHead>
                        <TableHead className="text-right">Cost/g</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.ingredients.map((ing) => (
                        <TableRow key={ing.id}>
                          <TableCell className="font-medium">
                            {ing.name}
                          </TableCell>
                          <TableCell>{ing.categoryName}</TableCell>
                          <TableCell className="text-right font-mono">
                            {ing.totalGrams.toFixed(0)}g
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground font-mono text-xs">
                            {formatCostPerGram(ing.costPerGram)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            {formatCurrency(ing.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={4}>
                          Total Ingredients Cost
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          {formatCurrency(report.summary.totalIngredientsCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Ready Items Table */}
            {report.readyItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ready Items Cost</CardTitle>
                  <CardDescription>
                    Cost breakdown by ready item (salads, soups, detox)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.readyItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.name}
                          </TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell className="text-center">
                            {item.quantity}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(item.costPrice)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            {formatCurrency(item.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={4}>
                          Total Ready Items Cost
                        </TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          {formatCurrency(report.summary.totalReadyItemsCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Delivery Expenses Table */}
            {deliveryExpenses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Oj's Delivery
                  </CardTitle>
                  <CardDescription>
                    {deliveryExpenses.length} deliveries -{" "}
                    {formatCurrency(totalDeliveryExpenses)} total
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Location</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {deliveryExpenses.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell className="font-medium">
                            {expense.deliveryLocation}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(expense.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-green-600">
                            {formatCurrency(expense.cost)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>
                          Total Delivery Expenses
                        </TableCell>
                        <TableCell className="text-right font-mono text-green-600">
                          {formatCurrency(totalDeliveryExpenses)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
            {/* Operational Costs Table */}
            {operationalCosts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Operational Costs
                  </CardTitle>
                  <CardDescription>
                    Monthly recurring costs — daily = monthly / 30
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">
                          Monthly Cost
                        </TableHead>
                        <TableHead className="text-right">Daily Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {operationalCosts.map((cost) => (
                        <TableRow key={cost.id}>
                          <TableCell className="font-medium">
                            {cost.name}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(cost.monthlyCost)}
                          </TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {formatCurrency(cost.monthlyCost / 30)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell>Total</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(totalMonthlyOperational)}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(dailyOperationalCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!report && !loading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a date range and click Generate Report</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default CostReportsPage;
