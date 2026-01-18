"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  SalesReportData,
  reportsService,
} from "@/lib/services/reports.service";
import { handleError } from "@/lib/utils/error-handler";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  Truck,
  TrendingUp,
  Package,
  Clock,
  Filter,
  Loader2,
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

const ReportsPage = () => {
  const reportRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<SalesReportData | null>(null);
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

      const data = await reportsService.getSalesReport(start, end);
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
        <title>Sales Report - ${formatDate(startDate)} to ${formatDate(endDate)}</title>
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
            grid-template-columns: repeat(4, 1fr);
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
            .summary-grid { grid-template-columns: repeat(4, 1fr); }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sales Report</h1>
          <p>${formatDate(startDate)}${startDate !== endDate ? ` - ${formatDate(endDate)}` : ""}</p>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Total Sales</div>
            <div class="value">JOD ${report?.summary.totalSales.toFixed(2) || "0.00"}</div>
            <div class="subvalue">${report?.summary.completedOrders || 0} orders</div>
          </div>
          <div class="summary-card">
            <div class="label">Items Subtotal</div>
            <div class="value">JOD ${report?.summary.subtotal.toFixed(2) || "0.00"}</div>
          </div>
          <div class="summary-card">
            <div class="label">Delivery Fees</div>
            <div class="value">JOD ${report?.summary.deliveryFees.toFixed(2) || "0.00"}</div>
          </div>
          <div class="summary-card">
            <div class="label">Avg Order Value</div>
            <div class="value">JOD ${report?.summary.averageOrderValue.toFixed(2) || "0.00"}</div>
          </div>
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="label">Promo Discounts</div>
            <div class="value">-JOD ${report?.summary.promoDiscounts.toFixed(2) || "0.00"}</div>
          </div>
          <div class="summary-card">
            <div class="label">Qty Discounts</div>
            <div class="value">-JOD ${report?.summary.quantityDiscounts.toFixed(2) || "0.00"}</div>
          </div>
          <div class="summary-card">
            <div class="label">Points Used</div>
            <div class="value">-JOD ${report?.summary.pointsUsedValue.toFixed(2) || "0.00"}</div>
          </div>
          <div class="summary-card">
            <div class="label">Cancelled</div>
            <div class="value">${report?.summary.cancelledOrders || 0}</div>
            <div class="subvalue">orders</div>
          </div>
        </div>

        ${report?.paymentMethods && report.paymentMethods.length > 0 ? `
        <div class="section">
          <h2>Payment Methods</h2>
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th class="text-center">Orders</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${report.paymentMethods.map(pm => `
                <tr>
                  <td>${pm.method}</td>
                  <td class="text-center">${pm.count}</td>
                  <td class="text-right">JOD ${pm.total.toFixed(2)}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ` : ""}

        ${report?.ingredients && report.ingredients.length > 0 ? `
        <div class="section">
          <h2>Ingredients Used (by weight)</h2>
          <table>
            <thead>
              <tr>
                <th>Ingredient</th>
                <th>Category</th>
                <th class="text-right">Grams</th>
                <th class="text-right">Servings</th>
                <th class="text-center">Orders</th>
              </tr>
            </thead>
            <tbody>
              ${report.ingredients.map(ing => `
                <tr>
                  <td>${ing.name}</td>
                  <td>${ing.categoryName}</td>
                  <td class="text-right">${ing.totalGrams.toFixed(0)}g</td>
                  <td class="text-right">${ing.totalServings}</td>
                  <td class="text-center">${ing.orderCount}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ` : ""}

        ${report?.readyItems && report.readyItems.length > 0 ? `
        <div class="section">
          <h2>Ready Items Sold</h2>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Type</th>
                <th class="text-center">Quantity</th>
                <th class="text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${report.readyItems.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.type}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">JOD ${item.revenue.toFixed(2)}</td>
                </tr>
              `).join("")}
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
              <FileText className="w-8 h-8" />
              Sales Reports
            </h1>
            <p className="page-description">
              Generate daily sales reports with ingredient usage
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sales</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(report.summary.totalSales)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {report.summary.completedOrders} completed orders
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
                      <p className="text-sm text-muted-foreground">Items Subtotal</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(report.summary.subtotal)}
                      </p>
                    </div>
                    <ShoppingCart className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Delivery Fees</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(report.summary.deliveryFees)}
                      </p>
                    </div>
                    <Truck className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Order Value</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(report.summary.averageOrderValue)}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Discounts & Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Promo Discounts</p>
                  <p className="text-xl font-bold text-red-600">
                    -{formatCurrency(report.summary.promoDiscounts)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Qty Discounts</p>
                  <p className="text-xl font-bold text-red-600">
                    -{formatCurrency(report.summary.quantityDiscounts)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Points Used</p>
                  <p className="text-xl font-bold text-orange-600">
                    -{formatCurrency(report.summary.pointsUsedValue)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Cancelled Orders</p>
                  <p className="text-xl font-bold">{report.summary.cancelledOrders}</p>
                </CardContent>
              </Card>
            </div>

            {/* Payment Methods & Orders by Status */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {report.paymentMethods.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Method</TableHead>
                          <TableHead className="text-center">Orders</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.paymentMethods.map((pm) => (
                          <TableRow key={pm.method}>
                            <TableCell className="font-medium">{pm.method}</TableCell>
                            <TableCell className="text-center">{pm.count}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(pm.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {report.ordersByStatus.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Orders by Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Count</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.ordersByStatus.map((os) => (
                          <TableRow key={os.status}>
                            <TableCell className="font-medium">{os.status}</TableCell>
                            <TableCell className="text-center">{os.count}</TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(os.total)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Ingredients Table */}
            {report.ingredients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Ingredients Used
                  </CardTitle>
                  <CardDescription>
                    Total ingredient usage in grams (from completed orders only)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ingredient</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Total Grams</TableHead>
                        <TableHead className="text-right">Servings</TableHead>
                        <TableHead className="text-right">Base (g)</TableHead>
                        <TableHead className="text-center">Orders</TableHead>
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
                          <TableCell className="text-right">
                            {ing.totalServings}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {ing.baseServing}g
                          </TableCell>
                          <TableCell className="text-center">{ing.orderCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Ready Items Table */}
            {report.readyItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Ready Items Sold</CardTitle>
                  <CardDescription>
                    Salads, soups, and detox items sold
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.readyItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.name}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.revenue)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {/* Hourly Distribution */}
            {report.hourlyDistribution.some((h) => h.orderCount > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Hourly Distribution
                  </CardTitle>
                  <CardDescription>Orders by hour of day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-12 gap-1">
                    {report.hourlyDistribution
                      .filter((h) => h.hour >= 8 && h.hour <= 23)
                      .map((h) => {
                        const maxOrders = Math.max(
                          ...report.hourlyDistribution.map((x) => x.orderCount)
                        );
                        const heightPercent =
                          maxOrders > 0 ? (h.orderCount / maxOrders) * 100 : 0;

                        return (
                          <div key={h.hour} className="text-center">
                            <div className="h-24 flex items-end justify-center mb-1">
                              <div
                                className="w-6 bg-primary/80 rounded-t transition-all"
                                style={{ height: `${Math.max(heightPercent, 4)}%` }}
                                title={`${h.orderCount} orders - ${formatCurrency(h.revenue)}`}
                              />
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {h.hour}:00
                            </div>
                            <div className="text-xs font-medium">{h.orderCount}</div>
                          </div>
                        );
                      })}
                  </div>
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

export default ReportsPage;
