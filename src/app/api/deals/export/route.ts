import { NextRequest, NextResponse } from "next/server";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { formatDistanceToNow } from "date-fns";
import { handleApiError } from "@/lib/api-response";
import { withRateLimit } from "@/lib/api-rate-limit";
import { ValidationError } from "@/lib/errors";

const EXPORT_LIMIT = 5000;

type DealExport = Awaited<ReturnType<typeof getAllDeals>>[number];

function escapeCsvValue(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function toExportRow(deal: DealExport) {
  const assignedTo = deal.assignedTo
    ? [deal.assignedTo.name, deal.assignedTo.surname].filter(Boolean).join(" ") || ""
    : "";
  return {
    name: deal.name,
    stage: deal.stage,
    value: deal.value,
    company: (deal as DealExport & { location?: string | null }).location ?? "",
    createdAt: new Date(deal.createdAt).toISOString(),
    lastActivityAt: new Date(deal.lastActivityAt).toISOString(),
    riskScore: deal.riskScore,
    primaryRiskReason: deal.primaryRiskReason ?? "",
    assignedTo,
  };
}

async function exportHandler(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const format = (searchParams.get("format") || "pdf").toLowerCase();
    const teamId = searchParams.get("teamId") ?? undefined;
    const includeTeamDeals = searchParams.get("includeTeamDeals") === "true";

    const validFormats = ["csv", "json", "pdf"];
    if (!validFormats.includes(format)) {
      throw new ValidationError(`Invalid format. Use: ${validFormats.join(", ")}`, {
        format: `Must be one of: ${validFormats.join(", ")}`,
      });
    }

    const options =
      teamId ? { teamId } : includeTeamDeals ? { includeTeamDeals: true } : undefined;
    const deals = await getAllDeals(options);

    if (deals.length > EXPORT_LIMIT) {
      throw new ValidationError(
        `Export limit exceeded. Maximum ${EXPORT_LIMIT} deals per export.`,
        { limit: `Reduce scope or filters. Current: ${deals.length} deals.` }
      );
    }

    if (deals.length === 0) {
      return NextResponse.json({ error: "No deals found" }, { status: 404 });
    }

    if (format === "csv") {
      const headers = [
        "name",
        "stage",
        "value",
        "company",
        "createdAt",
        "lastActivityAt",
        "riskScore",
        "primaryRiskReason",
        "assignedTo",
      ];
      const rows = deals.map((d) => toExportRow(d));
      const csvLines = [
        headers.join(","),
        ...rows.map((r) =>
          headers
            .map((h) => escapeCsvValue(String((r as Record<string, unknown>)[h] ?? "")))
            .join(",")
        ),
      ];
      const csv = csvLines.join("\n");

      return new NextResponse(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="deals-export-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    if (format === "json") {
      const data = deals.map((d) => toExportRow(d));
      const json = JSON.stringify(data, null, 2);

      return new NextResponse(json, {
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Disposition": `attachment; filename="deals-export-${new Date().toISOString().split("T")[0]}.json"`,
        },
      });
    }

    const { jsPDF } = await import("jspdf");

    const textPrimary: [number, number, number] = [51, 51, 51];
    const textSecondary: [number, number, number] = [102, 102, 102];
    const borderColor: [number, number, number] = [200, 200, 200];

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textPrimary);
    doc.text("All Deals Export", margin, 30);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textSecondary);
    const exportDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.text(`Exported on ${exportDate}`, margin, 40);

    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const activeDeals = deals.filter((deal) => deal.status === "active").length;
    const highRiskDeals = deals.filter(
      (deal) => formatRiskLevel(deal.riskScore) === "High"
    ).length;

    let yPos = 55;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textPrimary);
    doc.text("Summary", margin, yPos);

    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textSecondary);
    doc.text(`Total Deals: ${deals.length}`, margin, yPos);
    yPos += 6;
    doc.text(`Active Deals: ${activeDeals}`, margin, yPos);
    yPos += 6;
    doc.text(`High Risk Deals: ${highRiskDeals}`, margin, yPos);
    yPos += 6;
    doc.text(
      `Total Pipeline Value: $${totalValue.toLocaleString("en-US")}`,
      margin,
      yPos
    );

    yPos += 15;

    const tableTop = yPos;
    const rowHeight = 8;
    const colWidths = [
      contentWidth * 0.3,
      contentWidth * 0.15,
      contentWidth * 0.15,
      contentWidth * 0.12,
      contentWidth * 0.18,
      contentWidth * 0.1,
    ];

    doc.setDrawColor(...borderColor);
    doc.line(
      margin,
      tableTop - rowHeight,
      margin + contentWidth,
      tableTop - rowHeight
    );

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textPrimary);
    let xPos = margin;
    doc.text("Deal Name", xPos + 2, tableTop - 3);
    xPos += colWidths[0];
    doc.text("Value", xPos + 2, tableTop - 3);
    xPos += colWidths[1];
    doc.text("Stage", xPos + 2, tableTop - 3);
    xPos += colWidths[2];
    doc.text("Risk", xPos + 2, tableTop - 3);
    xPos += colWidths[3];
    doc.text("Next Action", xPos + 2, tableTop - 3);
    xPos += colWidths[4];
    doc.text("Last Activity", xPos + 2, tableTop - 3);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    yPos = tableTop;

    deals.forEach((deal) => {
      if (yPos + rowHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin + rowHeight;

        doc.setDrawColor(...borderColor);
        doc.line(
          margin,
          yPos - rowHeight,
          margin + contentWidth,
          yPos - rowHeight
        );
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...textPrimary);
        xPos = margin;
        doc.text("Deal Name", xPos + 2, yPos - 3);
        xPos += colWidths[0];
        doc.text("Value", xPos + 2, yPos - 3);
        xPos += colWidths[1];
        doc.text("Stage", xPos + 2, yPos - 3);
        xPos += colWidths[2];
        doc.text("Risk", xPos + 2, yPos - 3);
        xPos += colWidths[3];
        doc.text("Next Action", xPos + 2, yPos - 3);
        xPos += colWidths[4];
        doc.text("Last Activity", xPos + 2, yPos - 3);
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
      }

      doc.setDrawColor(...borderColor);
      doc.line(
        margin,
        yPos + rowHeight,
        margin + contentWidth,
        yPos + rowHeight
      );

      xPos = margin;
      doc.setTextColor(...textPrimary);
      const dealName = doc.splitTextToSize(deal.name, colWidths[0] - 4);
      doc.text(dealName, xPos + 2, yPos + 5);
      xPos += colWidths[0];

      doc.text(`$${deal.value.toLocaleString("en-US")}`, xPos + 2, yPos + 5);
      xPos += colWidths[1];

      doc.setTextColor(...textSecondary);
      doc.text(deal.stage.substring(0, 12), xPos + 2, yPos + 5);
      xPos += colWidths[2];

      const riskLevel = formatRiskLevel(deal.riskScore);
      if (riskLevel === "High") {
        doc.setTextColor(220, 38, 38);
      } else if (riskLevel === "Medium") {
        doc.setTextColor(245, 158, 11);
      } else {
        doc.setTextColor(34, 197, 94);
      }
      doc.text(riskLevel, xPos + 2, yPos + 5);
      xPos += colWidths[3];

      doc.setTextColor(...textSecondary);
      const actionText = (
        deal.recommendedAction?.label || "No action needed"
      ).substring(0, 20);
      doc.text(actionText, xPos + 2, yPos + 5);
      xPos += colWidths[4];

      const lastActivity = formatDistanceToNow(new Date(deal.lastActivityAt), {
        addSuffix: true,
      });
      doc.text(lastActivity.substring(0, 15), xPos + 2, yPos + 5);

      yPos += rowHeight;
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...textSecondary);
      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin - 20,
        pageHeight - 10
      );
    }

    const pdfOutput = doc.output("arraybuffer");
    const buffer = Buffer.from(pdfOutput);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="deals-export-${new Date().toISOString().split("T")[0]}.pdf"`,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export const GET = withRateLimit(exportHandler, { tier: "export" });
