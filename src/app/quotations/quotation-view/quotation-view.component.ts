import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { QuotationService } from '../../services/quotation.service';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-quotation-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quotation-view.component.html',
  styleUrls: ['./quotation-view.component.css']
})
export class QuotationViewComponent implements OnInit {

  quotation: any;

  constructor(
    private route: ActivatedRoute,
    private qs: QuotationService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.qs.getQuotation(id).subscribe({
      next: (res) => {
        this.quotation = res;
      },
      error: (err) => console.error("Failed to load quotation", err)
    });
  }

  // --------------------------------------------------------------
  //  GENERATE PDF EXACTLY LIKE SAMPLE
  // --------------------------------------------------------------
  async generatePDF(q: any) {
    const doc = new jsPDF("p", "pt", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();

    // ---------- 1️⃣ LOAD ALL ITEM IMAGES ----------
    const itemImages = await Promise.all(
      q.items.map((item: any) =>
        new Promise(resolve => {
          if (!item.image) return resolve(null);

          const img = new Image();
          img.crossOrigin = "anonymous";
img.src = `https://quotation-backend-e2jd.onrender.com/uploads/${item.image}`;
img.crossOrigin = "anonymous";

          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
        })
      )
    );

    // ---------- 2️⃣ HEADER ----------
    const logo = new Image();
    logo.src = "assets/133981645509522193.jpg";

    await new Promise(res => (logo.onload = res));
    doc.addImage(logo, "JPEG", 40, 20, 80, 40);

    doc.setFontSize(16);
    doc.text("CELESTIAL LIGHT", 150, 45);

    doc.setFontSize(10);
    doc.text("Address Line : XLVI/794,Near Income Tax Office, Kannothumchal,Kannur", 40, 80);
    doc.text("Phone: +91-7560940958 | Email: celestiallightskannur.com | Website: www.celestiallight.com", 40, 95);

    // ---------- 3️⃣ QUOTATION TITLE ----------
    doc.setFontSize(20);
    doc.setFont("Helvetica", "bold");
    doc.text("QUOTATION", pageWidth / 2, 140, { align: "center" });

    // ---------- 4️⃣ QUOTATION DETAILS TABLE ----------
    autoTable(doc, {
      startY: 160,
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 4 },
      columnStyles: { 0: { cellWidth: 150 } },
      body: [
        ["Quotation No.:", q.quote_no],
        ["Date:", new Date(q.date).toLocaleDateString()],
        ["Valid Till:", q.valid_till || "-"],
        ["Customer Name:", q.customer_name],
        ["Customer Phone:", q.customer_phone]
      ]
    });

    // ---------- 5️⃣ ITEMS TABLE ----------
    const itemTable = q.items.map((item: any, index: number) => [
      index + 1,
      item.description,
      "",
      item.quantity + " NOS",
      item.unit_price,
      item.line_total
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,

      head: [["Sl. No.", "Details", "Product", "Qty", "Unit Price", "Total"]],
      body: itemTable,
      theme: "grid",
      styles: { fontSize: 11, cellPadding: 5, minCellHeight: 60 },
      columnStyles: {
        2: { cellWidth: 70 }   // Product column
      },
     didDrawCell: (data) => {
  if (data.column.index === 2 && data.cell.section === "body") {

    const img = itemImages[data.row.index];
    if (!img) return;

    // Fit inside a clean 50x50 box
    const maxWidth = 50;
    const maxHeight = 50;

    let imgWidth = img.width;
    let imgHeight = img.height;

    const ratio = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);

    imgWidth *= ratio;
    imgHeight *= ratio;

    const x = data.cell.x + (data.cell.width - imgWidth) / 2;
    const y = data.cell.y + (data.cell.height - imgHeight) / 2;

    doc.addImage(img, "JPEG", x, y, imgWidth, imgHeight);
  }
}

    });
    

    // ---------- 6️⃣ TOTAL ----------
    const totalY = (doc as any).lastAutoTable.finalY + 20;

    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.text(`Total: ₹${q.total}/-`, 40, totalY);

    // ---------- 7️⃣ BANK DETAILS ----------
    const bankY = totalY + 30;

    doc.setFontSize(12);
    doc.text("Account Name: CELESTIAL LIGHTS", 40, bankY);
    doc.text("Account No: 50200107775048", 40, bankY + 15);
    doc.text("Bank: HDFC BANK LTD", 40, bankY + 30);
    doc.text("Branch: KANNUR", 40, bankY + 45);
    doc.text("IFSC Code: HDFC0001522", 40, bankY + 60);

    // ---------- 8️⃣ TERMS & CONDITIONS ----------
    const termsY = bankY + 100;

    doc.setFontSize(12);
    doc.text("Terms & Conditions", 40, termsY);

    doc.setFontSize(10);

    const terms = [
      "1. There is no return which products are against ordered.",
      `2. Quotation valid until: ${q.valid_till || "N/A"}.`,
      "3. Work will commence after advance payment.",
      "4. Payment Terms:",
      "   • 80% advance on confirmation.",
      "   • Remaining before dispatch.",
      "   • Free delivery.",
      "   • Delivery 4 days if in stock; else 6–10 days.",
      "5. Date of receipt of advance = order confirmation date.",
      "6. Customer must verify product condition at delivery."
    ];

    let y = termsY + 15;
    terms.forEach(line => {
      doc.text(line, 40, y);
      y += 15;
    });

    // ---------- 9️⃣ SAVE PDF ----------
    doc.save(`Quotation_${q.quote_no}.pdf`);
  }

  downloadPDF() {
    if (this.quotation) {
      this.generatePDF(this.quotation);
    }
  }
  printQuotation() {
    window.print();
  }
  
}
