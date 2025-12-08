import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotationService } from '../../services/quotation.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Router } from '@angular/router';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './quotation-list.component.html',
  styleUrls: ['./quotation-list.component.css']
})
export class QuotationListComponent implements OnInit {

  quotations: any[] = [];

  constructor(private qs: QuotationService,private router: Router) {}

  ngOnInit(): void {
    this.loadQuotations();
  }

  loadQuotations() {
    this.qs.getQuotations().subscribe({
      next: (res: any) => {
        this.quotations = res;
      },
      error: (err) => console.error("Failed to load quotations", err)
    });
  }

  async generatePDF(q: any) {
    if (!q) return;

    const doc = new jsPDF();

    // ---------- 1️⃣ LOAD ALL ITEM IMAGES FIRST ----------
    const itemImages = await Promise.all(
      q.items.map((item: any) =>
        new Promise(resolve => {
          if (!item.image) return resolve(null);

          const img = new Image();
          img.crossOrigin = "anonymous";
img.src = `https://quotation-backend-e2jd.onrender.com/uploads/${item.image}`;

          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
        })
      )
    );

    // ---------- 2️⃣ HEADER ----------
    const logo = new Image();
    logo.src = 'assets/celastial-logo.png';

    await new Promise(res => logo.onload = res);
    doc.addImage(logo, 'JPEG', 15, 10, 40, 25);

    doc.setFontSize(16);
    doc.text("CELESTIAL LIGHT", 70, 20);

    doc.setFontSize(10);
    doc.text("XLVI/794, Near Income Tax Office, Kannothumchal, Kannur", 15, 40);
    doc.text("Phone: +91-7560940958 | Email: celestiallightskannur@gmail.com", 15, 46);
    doc.text("Website: www.celestiallights.com", 15, 52);

    // ---------- 3️⃣ CUSTOMER INFO ----------
    autoTable(doc, {
      startY: 60,
      theme: 'grid',
      styles: { fontSize: 11 },
      body: [
        ["Quotation No:", q.quote_no],
        ["Date:", new Date(q.date).toLocaleDateString()],
        ["Customer Name:", q.customer_name],
        ["Customer Phone:", q.customer_phone],
        ["Salesman:", q.salesman_name]
      ]
    });

    // ---------- 4️⃣ ITEMS TABLE ----------
    const body = q.items.map((item: any, index: number) => [
      index + 1,
      item.description,
      "",
      item.quantity,
      item.unit_price,
      item.line_total
    ]);

    const startY = (doc as any).lastAutoTable.finalY + 10;

    autoTable(doc, {
      startY,
      head: [["Sl", "Description", "Image", "Qty", "Unit Price", "Total"]],
      body,
      didDrawCell: (data) => {
        if (data.column.index === 2 && data.cell.section === "body") {
          const img = itemImages[data.row.index];
          if (img) {
            doc.addImage(img, "JPEG", data.cell.x + 3, data.cell.y + 3, 20, 20);
          }
        }
      }
    });

    // ---------- 5️⃣ TOTAL ----------
    const totalY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.text(`TOTAL: ₹ ${q.total}/-`, 15, totalY);

    // ---------- 6️⃣ BANK DETAILS ----------
    doc.setFontSize(12);
    doc.text("Bank Details:", 15, totalY + 15);

    doc.setFontSize(10);
    doc.text("Account Name: CELESTIAL LIGHTS", 15, totalY + 22);
    doc.text("Account No: 50200107775048", 15, totalY + 28);
    doc.text("Bank: HDFC BANK LTD, Kannur", 15, totalY + 34);
    doc.text("IFSC: HDFC0001522", 15, totalY + 40);

    // ---------- 7️⃣ TERMS ----------
    doc.setFontSize(12);
    doc.text("Terms & Conditions:", 15, totalY + 55);

    doc.setFontSize(10);
    const terms = [
      "1. No return for ordered products.",
      "2. Quotation valid for 10 days.",
      "3. Work starts after advance payment.",
      "4. Customer must check item condition on delivery."
    ];

    let y = totalY + 62;
    terms.forEach(t => { doc.text(t, 15, y); y += 6; });

    // ---------- 8️⃣ SAVE ----------
    doc.save(`Quotation_${q.quote_no}.pdf`);
  }

  downloadPDF(id: number) {
    this.qs.getQuotation(id).subscribe({
      next: (q) => this.generatePDF(q),
      error: (err) => console.error("Error loading quotation", err)
    });
  }
  viewQuotation(id: number) {
    this.router.navigate(['/quotations/view', id]);
  }
}
