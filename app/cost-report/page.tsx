"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  CostReportData,
  reportsService,
} from "@/lib/services/reports.service";
import { handleError } from "@/lib/utils/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Calculator,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  Package,
  Filter,
  Loader2,
  Percent,
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

const CostReportPage = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<CostReportData | null>(null);
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

      const data = await reportsService.getCostReport(start, end);
      setReport(data);
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

  const handleExportPDF = () => {
    if (!reportRef.current) return;

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const formatDate = (dateStr: string) => {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    // Build the HTML content
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
          .summary-card.green .value { color: #16a34a; }
          .summary-card.red .value { color: #dc2626; }
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
          .totals-row { font-weight: bold; background: #f8f9fa; }
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
            .summary-grid { grid-template-columns: repeat(3, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Cost Report</h1>
          <p>${formatDate(startDate)}${startDate !== endDate ? ` - ${formatDate(endDate)}` : ""}</p>
        </div>

        <div class="summary-grid">
          <div class="summary-card green">
            <div class="label">Total Revenue</div>
            <div class="value">JOD ${report?.summary.totalRevenue.toFixed(2) || "0.00"}</div>
          </div>
          <div class="summary-card red">
            <div class="label">Total Cost</div>
            <div class="value">JOD ${report?.summary.totalCost.toFixed(2) || "0.00"}</div>
          </div>
          <div class="summary-card green">
            <div class="label">Gross Profit</div>
            <div class="value">JOD ${report?.summary.grossProfit.toFixed(2) || "0.00"}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Ingredients Cost</div>
            <div class="value">JOD ${report?.summary.totalIngredientsCost.toFixed(2) || "0.00"}</div>
          </div>
          <div class="summary-card">
            <div class="label">Ready Items Cost</div>
            <div class="value">JOD ${report?.summary.totalReadyItemsCost.toFixed(2) || "0.00"}</div>
          </div>
          <div class="summary-card">
            <div class="label">Profit Margin</div>
            <div class="value">${report?.summary.profitMargin.toFixed(1) || "0"}%</div>
          </div>
        </div>

        ${report?.ingredients && report.ingredients.length > 0 ? `
        <div class="section">
          <h2>Ingredients Cost Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Category</th>
                <th class="text-right">Grams Used</th>
                <th class="text-right">Cost/g</th>
                <th class="text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              ${report.ingredients.map(ing => `
                <tr>
                  <td>${ing.name}</td>
                  <td>${ing.categoryName}</td>
                  <td class="text-right">${ing.totalGrams.toFixed(0)}g</td>
                  <td class="text-right">JOD ${ing.costPerGram.toFixed(4)}</td>
                  <td class="text-right">JOD ${ing.totalCost.toFixed(2)}</td>
                </tr>
              `).join("")}
              <tr class="totals-row">
                <td colspan="4">Total Ingredients Cost</td>
                <td class="text-right">JOD ${report.summary.totalIngredientsCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        ` : ""}

        ${report?.readyItems && report.readyItems.length > 0 ? `
        <div class="section">
          <h2>Ready Items Cost Breakdown</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th class="text-center">Quantity</th>
                <th class="text-right">Cost/Unit</th>
                <th class="text-right">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              ${report.readyItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.type}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">JOD ${item.costPrice.toFixed(2)}</td>
                  <td class="text-right">JOD ${item.totalCost.toFixed(2)}</td>
                </tr>
              `).join("")}
              <tr class="totals-row">
                <td colspan="4">Total Ready Items Cost</td>
                <td class="text-right">JOD ${report.summary.totalReadyItemsCost.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        ` : ""}

        <div class="generated-at">
          Generated on ${new Date().toLocaleString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const formatCurrency = (amount: number) => `JOD ${amount.toFixed(2)}`;

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

  return (
    <PageTransition>
      <div className="space-y-6" ref={reportRef}>
        <div className="page-header">
          <div>
            <h1 className="page-title flex items-center gap-2">
              <Calculator className="w-8 h-8" />
              Cost Report
            </h1>
            <p className="page-description">
              Analyze costs and profit margins for ingredients and ready items
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
            {/* Summary Cards - Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <p className="text-sm text-muted-foreground">Gross Profit</p>
                      <p className={`text-2xl font-bold ${report.summary.grossProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(report.summary.grossProfit)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards - Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Ingredients Cost</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(report.summary.totalIngredientsCost)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Ready Items Cost</p>
                  <p className="text-xl font-bold">
                    {formatCurrency(report.summary.totalReadyItemsCost)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Profit Margin</p>
                      <p className={`text-xl font-bold ${report.summary.profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {report.summary.profitMargin.toFixed(1)}%
                      </p>
                    </div>
                    <Percent className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ingredients Cost Table */}
            {report.ingredients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Ingredients Cost Breakdown
                  </CardTitle>
                  <CardDescription>
                    Cost analysis based on grams used and cost per gram
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Grams Used</TableHead>
                        <TableHead className="text-right">Cost/g (JOD)</TableHead>
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
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {ing.costPerGram.toFixed(4)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {formatCurrency(ing.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={4}>Total Ingredients Cost</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(report.summary.totalIngredientsCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Ready Items Cost Table */}
            {report.readyItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ready Items Cost Breakdown</CardTitle>
                  <CardDescription>
                    Cost analysis for salads, soups, and detox items
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Cost/Unit (JOD)</TableHead>
                        <TableHead className="text-right">Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.readyItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right font-mono text-muted-foreground">
                            {formatCurrency(item.costPrice)}
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {formatCurrency(item.totalCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={4}>Total Ready Items Cost</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(report.summary.totalReadyItemsCost)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Final Cost Summary */}
            <Card className="border-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="w-5 h-5" />
                  Final Cost Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Ingredients Cost</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(report.summary.totalIngredientsCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-muted-foreground">Ready Items Cost</span>
                    <span className="font-mono font-medium">
                      {formatCurrency(report.summary.totalReadyItemsCost)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 bg-primary/10 rounded-lg px-4 -mx-4">
                    <span className="text-lg font-bold">Final Total Cost</span>
                    <span className="text-2xl font-mono font-bold text-red-600">
                      {formatCurrency(report.summary.totalCost)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {!report && !loading && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                <Calculator className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a date range and click Generate Report</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
};

export default CostReportPage;
