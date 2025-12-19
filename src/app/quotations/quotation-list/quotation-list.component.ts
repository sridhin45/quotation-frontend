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
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './quotation-list.component.html',
  styleUrls: ['./quotation-list.component.css']
})
export class QuotationListComponent implements OnInit {

  quotations: any[] = [];
  filteredQuotations: any[] = [];
  searchText = '';

  // private imageBase = "https://quotation-backend-3.onrender.com/uploads/items/";


  constructor(
    private qs: QuotationService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuotations();
  }

  // ================= LOAD =================
  loadQuotations() {
    this.qs.getQuotations().subscribe({
      next: (res: any[]) => {
        this.quotations = res;
        this.filteredQuotations = res;
      },
      error: (err) => console.error('Failed to load quotations', err)
    });
  }

  // ================= SEARCH =================
  filterQuotations() {
    const text = this.searchText.toLowerCase();

    this.filteredQuotations = this.quotations.filter(q =>
      q.customer_name.toLowerCase().includes(text) ||
      q.quote_no.toLowerCase().includes(text)
    );
  }

  // ================= TOTAL =================
  getGrandTotal(q: any): number {
    return q.items?.reduce(
      (sum: number, it: any) => sum + it.total,
      0
    ) || 0;
  }

  // ================= PDF =================
  async generatePDF(q: any) {
    if (!q) return;

    const doc = new jsPDF('p', 'pt', 'a4');

    // ---- Load images
    const itemImages = await Promise.all(
      q.items.map((it: any) =>
        new Promise<HTMLImageElement | null>(resolve => {
          if (!it.item?.image) return resolve(null);

          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = it.item.image;

          img.onload = () => resolve(img);
          img.onerror = () => resolve(null);
        })
      )
    );

    // ---- Logo
    const logo = new Image();
    logo.src = 'assets/celastial-logo.png';
    await new Promise(res => (logo.onload = res));

    doc.addImage(logo, 'PNG', 40, 20, 80, 40);
    doc.setFontSize(16);
    doc.text('CELESTIAL LIGHT', 150, 45);

    // ---- Header table
    autoTable(doc, {
      startY: 80,
      theme: 'grid',
      styles: { fontSize: 11 },
      body: [
        ['Quotation No:', q.quote_no],
        ['Date:', new Date(q.created_at).toLocaleDateString()],
        ['Customer Name:', q.customer_name],
        ['Customer Phone:', q.customer_phone || '-'],
        ['Salesman:', q.salesman_name]
      ]
    });

    // ---- Items table
    const body = q.items.map((it: any, i: number) => [
      i + 1,
      it.item.name,
      '',
      it.qty,
      it.price,
      it.total
    ]);

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,
      head: [['Sl', 'Item', 'Image', 'Qty', 'Unit Price', 'Total']],
      body,
      theme: 'grid',
      didDrawCell: data => {
        if (data.column.index === 2 && data.cell.section === 'body') {
          const img = itemImages[data.row.index];
          if (!img) return;

          doc.addImage(
            img,
            'JPEG',
            data.cell.x + 5,
            data.cell.y + 5,
            30,
            30
          );
        }
      }
    });

    doc.save(`Quotation_${q.quote_no}.pdf`);
  }

  downloadPDF(id: number) {
    this.qs.getQuotation(id).subscribe({
      next: q => this.generatePDF(q),
      error: err => console.error('PDF error', err)
    });
  }

  // ================= ACTIONS =================
  viewQuotation(id: number) {
    this.router.navigate(['/quotations/view', id]);
  }

  goToEdit(id: number) {
    this.router.navigate(['/quotations/edit', id]);
  }

  deleteQuotation(id: number) {
    if (!confirm('Are you sure you want to delete this quotation?')) return;

    this.qs.deleteQuotation(id).subscribe({
      next: () => {
        alert('Quotation deleted successfully');
        this.loadQuotations();
      },
      error: err => {
        console.error('Delete failed', err);
        alert('Delete failed');
      }
    });
  }
}
