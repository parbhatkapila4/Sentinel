import { NextResponse } from "next/server";
import { getAllDeals } from "@/app/actions/deals";
import { formatRiskLevel } from "@/lib/dealRisk";
import { format } from "date-fns";

export async function GET() {
  try {
    const deals = await getAllDeals();

    if (deals.length === 0) {
      return NextResponse.json(
        { error: "No deals found to export" },
        { status: 404 }
      );
    }

    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    const textPrimary: [number, number, number] = [51, 51, 51];
    const textSecondary: [number, number, number] = [102, 102, 102];
    const borderColor: [number, number, number] = [200, 200, 200];

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textPrimary);
    doc.text("Pipeline Summary Report", margin, 30);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textSecondary);
    const reportDate = format(new Date(), "MMMM d, yyyy 'at' h:mm a");
    doc.text(`Generated on ${reportDate}`, margin, 40);

    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
    const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;
    const highRiskDeals = deals.filter(
      (deal) => formatRiskLevel(deal.riskScore) === "High"
    );
    const mediumRiskDeals = deals.filter(
      (deal) => formatRiskLevel(deal.riskScore) === "Medium"
    );
    const lowRiskDeals = deals.filter(
      (deal) => formatRiskLevel(deal.riskScore) === "Low"
    );
    const highRiskValue = highRiskDeals.reduce(
      (sum, deal) => sum + deal.value,
      0
    );
    const avgRiskScore =
      totalDeals > 0
        ? deals.reduce((sum, deal) => sum + deal.riskScore, 0) / totalDeals
        : 0;

    let yPos = 55;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textPrimary);
    doc.text("Executive Summary", margin, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textSecondary);

    const summaryData = [
      ["Total Pipeline Value", `$${totalValue.toLocaleString("en-US")}`],
      ["Total Deals", totalDeals.toString()],
      ["Average Deal Size", `$${Math.round(avgDealValue).toLocaleString("en-US")}`],
      [
        "High Risk Deals",
        `${highRiskDeals.length} ($${highRiskValue.toLocaleString("en-US")})`,
      ],
      ["Average Risk Score", `${(avgRiskScore * 100).toFixed(0)}%`],
    ];

    summaryData.forEach(([label, value]) => {
      doc.text(`${label}:`, margin, yPos);
      doc.setFont("helvetica", "bold");
      doc.text(value, margin + 80, yPos);
      doc.setFont("helvetica", "normal");
      yPos += 7;
    });

    yPos += 5;
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textPrimary);
    doc.text("Risk Distribution", margin, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textSecondary);

    const riskData = [
      ["Low Risk", lowRiskDeals.length],
      ["Medium Risk", mediumRiskDeals.length],
      ["High Risk", highRiskDeals.length],
    ];

    riskData.forEach(([label, count]) => {
      doc.text(`${label}: ${count} deals`, margin, yPos);
      yPos += 7;
    });

    const stageDistribution = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const valueByStage = deals.reduce((acc, deal) => {
      acc[deal.stage] = (acc[deal.stage] || 0) + deal.value;
      return acc;
    }, {} as Record<string, number>);

    yPos += 5;
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textPrimary);
    doc.text("Pipeline by Stage", margin, yPos);

    yPos += 10;
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textPrimary);

    doc.text("Stage", margin, yPos);
    doc.text("Deals", margin + 50, yPos);
    doc.text("Value", margin + 90, yPos);
    doc.text("%", margin + 140, yPos);

    yPos += 7;
    doc.setDrawColor(...borderColor);
    doc.line(margin, yPos - 3, margin + contentWidth, yPos - 3);

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textSecondary);

    Object.entries(stageDistribution)
      .sort(([, a], [, b]) => b - a)
      .forEach(([stage, count]) => {
        if (yPos > pageHeight - 30) {
          doc.addPage();
          yPos = 20;
        }

        const value = valueByStage[stage] || 0;
        const percentage = totalValue > 0 ? (value / totalValue) * 100 : 0;

        doc.text(stage, margin, yPos);
        doc.text(count.toString(), margin + 50, yPos);
        doc.text(`$${value.toLocaleString("en-US")}`, margin + 90, yPos);
        doc.text(`${percentage.toFixed(1)}%`, margin + 140, yPos);
        yPos += 7;
      });

    yPos += 5;
    if (yPos > pageHeight - 60) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textPrimary);
    doc.text("Top Deals (by Value)", margin, yPos);

    yPos += 10;
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...textPrimary);

    doc.text("Deal Name", margin, yPos);
    doc.text("Stage", margin + 70, yPos);
    doc.text("Value", margin + 110, yPos);
    doc.text("Risk", margin + 150, yPos);

    yPos += 6;
    doc.setDrawColor(...borderColor);
    doc.line(margin, yPos - 3, margin + contentWidth, yPos - 3);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textSecondary);

    const topDeals = [...deals].sort((a, b) => b.value - a.value).slice(0, 20);

    topDeals.forEach((deal) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = 20;
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textSecondary);
      }

      const riskLevel = formatRiskLevel(deal.riskScore);
      const dealName =
        deal.name.length > 25 ? deal.name.substring(0, 22) + "..." : deal.name;

      doc.text(dealName, margin, yPos);
      doc.text(deal.stage, margin + 70, yPos);
      doc.text(`$${deal.value.toLocaleString("en-US")}`, margin + 110, yPos);
      doc.text(riskLevel, margin + 150, yPos);
      yPos += 6;
    });

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...textSecondary);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
        align: "center",
      });
    }

    const pdfBlob = doc.output("blob");
    const pdfBuffer = await pdfBlob.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="pipeline-report-${format(
          new Date(),
          "yyyy-MM-dd"
        )}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF report" },
      { status: 500 }
    );
  }
}
