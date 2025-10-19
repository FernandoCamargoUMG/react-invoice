import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Generador de PDF para cotizaciones
export const generateQuotePdf = ({ quote = {}, customer = {}, items = [], meta = {} } = {}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header morado
  doc.setFillColor(139, 95, 191);
  doc.rect(0, 0, pageWidth, 90, 'F');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text(quote.number ? `Cotización ${quote.number}` : 'Cotización', 40, 50);
  doc.setFontSize(10);
  doc.setTextColor(230, 230, 230);
  doc.text(`Fecha: ${quote.date || new Date().toLocaleDateString()}`, pageWidth - 40, 50, { align: 'right' });

  // Cliente
  let y = 110;
  doc.setFontSize(12);
  doc.setTextColor(60);
  doc.text('Cliente:', 40, y);
  doc.setFontSize(11);
  doc.text(customer.name || '-', 120, y);
  y += 18;
  if (customer.email) { doc.setFontSize(10); doc.text(`Email: ${customer.email}`, 120, y); y += 16; }
  if (customer.address) { doc.setFontSize(10); doc.text(`Dirección: ${customer.address}`, 120, y); y += 16; }

  // Items table
  const head = [['#', 'Descripción', 'Cantidad', 'Precio', 'Total']];
  const body = items.map((it, idx) => [
    String(idx + 1),
    it.description || it.name || '-',
    String(it.quantity ?? '1'),
    (it.price != null) ? Number(it.price).toFixed(2) : '-',
    (it.total != null) ? Number(it.total).toFixed(2) : ((it.quantity && it.price) ? (it.quantity * it.price).toFixed(2) : '-')
  ]);

  autoTable(doc, {
    startY: y + 8,
    head: head,
    body: body,
    headStyles: { fillColor: [139,95,191], textColor: 255 },
    styles: { fontSize: 10 },
    margin: { left: 36, right: 36 }
  });

  // Totales
  const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : y + 200;
  doc.setFontSize(11);
  doc.text(`Subtotal: ${quote.subtotal != null ? Number(quote.subtotal).toFixed(2) : '-'}`, pageWidth - 180, finalY);
  doc.text(`Impuesto: ${quote.tax != null ? Number(quote.tax).toFixed(2) : '-'}`, pageWidth - 180, finalY + 16);
  doc.setFontSize(13);
  doc.setTextColor(139,95,191);
  doc.text(`Total: ${quote.total != null ? Number(quote.total).toFixed(2) : '-'}`, pageWidth - 180, finalY + 36);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`${meta.companyName || ''}`, 40, doc.internal.pageSize.getHeight() - 30);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth - 40, doc.internal.pageSize.getHeight() - 30, { align: 'right' });
  }

  return doc;
};
