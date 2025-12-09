import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuotationService } from '../../services/quotation.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quotation-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule,
    MatButtonModule],
  templateUrl: './quotation-list.component.html',
  styleUrls: ['./quotation-list.component.css']
})
export class QuotationListComponent implements OnInit {
searchText: string = '';
filteredQuotations: any[] = [];


  quotations: any[] = [];

  constructor(
    private qs: QuotationService,
    public router: Router   // <-- public so HTML can access router
  ) {}

  ngOnInit(): void {
    this.loadQuotations();
  }

  loadQuotations() {
    this.qs.getQuotations().subscribe({
      next: (res: any) => {
        this.quotations = res;
         this.filteredQuotations = res;
      },
      error: (err) => console.error("Failed to load quotations", err)
    });
  }

  // ---------------- PDF ----------------
  async generatePDF(q: any) {
    if (!q) return;

    const doc = new jsPDF();

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

    const logo = new Image();
    logo.src = 'assets/celastial-logo.png';

    await new Promise(res => logo.onload = res);
    doc.addImage(logo, 'JPEG', 15, 10, 40, 25);

    doc.setFontSize(16);
    doc.text("CELESTIAL LIGHT", 70, 20);

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

    doc.save(`Quotation_${q.quote_no}.pdf`);
  }

  downloadPDF(id: number) {
    this.qs.getQuotation(id).subscribe({
      next: (q) => this.generatePDF(q),
      error: (err) => console.error("Error loading quotation", err)
    });
  }

  // ---------------- VIEW ----------------
  viewQuotation(id: number) {
    this.router.navigate(['/quotations/view', id]);
  }

  // ---------------- DELETE ----------------
  deleteQuotation(id: number) {
    if (!confirm("Are you sure you want to delete this quotation?")) return;

    this.qs.deleteQuotation(id).subscribe({
      next: () => {
        alert("Quotation deleted successfully");
        this.loadQuotations();
      },
      error: (err) => {
        console.error("Delete failed", err);
        alert("Delete failed");
      }
    });
  }

  // ---------------- EDIT ----------------
  goToEdit(id: number) {
    this.router.navigate(['/quotations/edit', id]);
  }
filterQuotations() {
  const text = this.searchText.toLowerCase();

  this.filteredQuotations = this.quotations.filter((q: any) =>
    q.customer_name.toLowerCase().includes(text) ||
    q.quote_no.toLowerCase().includes(text)
  );
}
}
