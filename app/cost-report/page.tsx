"use client";

import React, { useEffect, useState } from "react";
import {
  CostReportData,
  reportsService,
} from "@/lib/services/reports.service";
import {
  deliveryExpensesService,
  DeliveryExpense,
} from "@/lib/services/delivery-expenses.service";
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
  const [deliveryExpenses, setDeliveryExpenses] = useState<DeliveryExpense[]>([]);
  const [loading, setLoading] = useState(false);

  // Date range - default to today
  const today = new Date();
  const [startDate, setStartDate] = useState(
    today.toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = useState(
    today.toISOString().split("T")[0]
  );

  const fetchReport = async () => {
    try {
      setLoading(true);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const [data, expenses] = await Promise.all([
        reportsService.getCostReport(start, end),
        deliveryExpensesService.findAll(start, end),
      ]);
      setReport(data);
      setDeliveryExpenses(expenses);
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

  const totalDeliveryExpenses = deliveryExpenses.reduce((sum, e) => sum + e.cost, 0);

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <FileText className="w-8 h-8" />
              Cost Reports
            </h1>
            <p className="page-description">
              View cost breakdown including ingredients, ready items, and packaging
            </p>
          </div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
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
                      <p className="text-sm text-muted-foreground">Total Cost</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(report.summary.totalCost + totalDeliveryExpenses)}
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
                      <p className="text-sm text-muted-foreground">Gross Profit</p>
                      <p className={`text-2xl font-bold ${report.summary.grossProfit - totalDeliveryExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(report.summary.grossProfit - totalDeliveryExpenses)}
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
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className={`text-2xl font-bold ${report.summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {((report.summary.grossProfit - totalDeliveryExpenses) / report.summary.totalRevenue * 100 || 0).toFixed(1)}%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cost Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Ingredients Cost</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(report.summary.totalIngredientsCost)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Ready Items Cost</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(report.summary.totalReadyItemsCost)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Packaging Cost</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(report.summary.totalPackagingCost)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Delivery Expenses</p>
                  <p className="text-xl font-bold text-red-600">
                    {formatCurrency(totalDeliveryExpenses)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {deliveryExpenses.length} deliveries
                  </p>
                </CardContent>
              </Card>
            </div>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <Card className="border-2 border-blue-100">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Box className="w-5 h-5 text-blue-500" />
                          <span className="font-medium">Meal Boxes</span>
                        </div>
                        <p className="text-2xl font-bold">{report.packaging.mealBoxes.count}</p>
                        <p className="text-xs text-muted-foreground">
                          @ {formatCurrency(report.packaging.mealBoxes.unitCost)} each
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
                        <p className="text-2xl font-bold">{report.packaging.saladBoxes.count}</p>
                        <p className="text-xs text-muted-foreground">
                          @ {formatCurrency(report.packaging.saladBoxes.unitCost)} each
                        </p>
                        <p className="text-lg font-semibold text-red-600 mt-1">
                          {formatCurrency(report.packaging.saladBoxes.totalCost)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-purple-100">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Package className="w-5 h-5 text-purple-500" />
                          <span className="font-medium">Detox Bottles</span>
                        </div>
                        <p className="text-2xl font-bold">{report.packaging.detoxBottles.count}</p>
                        <p className="text-xs text-muted-foreground">
                          @ {formatCurrency(report.packaging.detoxBottles.unitCost)} each
                        </p>
                        <p className="text-lg font-semibold text-red-600 mt-1">
                          {formatCurrency(report.packaging.detoxBottles.totalCost)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-amber-100">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Utensils className="w-5 h-5 text-amber-600" />
                          <span className="font-medium">Wood Cutlery</span>
                        </div>
                        <p className="text-2xl font-bold">{report.packaging.woodCutlery.count}</p>
                        <p className="text-xs text-muted-foreground">
                          @ {formatCurrency(report.packaging.woodCutlery.unitCost)} each
                        </p>
                        <p className="text-lg font-semibold text-red-600 mt-1">
                          {formatCurrency(report.packaging.woodCutlery.totalCost)}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="border-2 border-gray-100">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Utensils className="w-5 h-5 text-gray-500" />
                          <span className="font-medium">Plastic Cutlery</span>
                        </div>
                        <p className="text-2xl font-bold">{report.packaging.plasticCutlery.count}</p>
                        <p className="text-xs text-muted-foreground">
                          @ {formatCurrency(report.packaging.plasticCutlery.unitCost)} each
                        </p>
                        <p className="text-lg font-semibold text-red-600 mt-1">
                          {formatCurrency(report.packaging.plasticCutlery.totalCost)}
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
                        <TableHead className="text-right">Total Grams</TableHead>
                        <TableHead className="text-right">Cost/g</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.ingredients.map((ing) => (
                        <TableRow key={ing.id}>
                          <TableCell className="font-medium">{ing.name}</TableCell>
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
                        <TableCell colSpan={4}>Total Ingredients Cost</TableCell>
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
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {formatCurrency(item.costPrice)}
                          </TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            {formatCurrency(item.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={4}>Total Ready Items Cost</TableCell>
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
                    Delivery Expenses
                  </CardTitle>
                  <CardDescription>
                    {deliveryExpenses.length} deliveries - {formatCurrency(totalDeliveryExpenses)} total
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
                          <TableCell className="font-medium">{expense.deliveryLocation}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(expense.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium text-red-600">
                            {formatCurrency(expense.cost)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={2}>Total Delivery Expenses</TableCell>
                        <TableCell className="text-right font-mono text-red-600">
                          {formatCurrency(totalDeliveryExpenses)}
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
