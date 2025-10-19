import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Generador de PDF para movimientos de inventario
export const generateInventoryPdf = ({ movements = [], stats = {}, company = {} } = {}) => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  const title = company.name || 'Reporte de Movimientos de Inventario';
  doc.setFillColor(139, 95, 191);
  doc.rect(0, 0, pageWidth, 70, 'F');
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 40, 44);

  // Subtitle / fecha
  doc.setFontSize(10);
  doc.setTextColor(240, 240, 240);
  const generatedAt = new Date().toLocaleString();
  doc.text(`Generado: ${generatedAt}`, pageWidth - 40, 44, { align: 'right' });

  // Optional company info
  if (company.address) {
    doc.setFontSize(9);
    doc.setTextColor(255, 255, 255);
    doc.text(company.address, 40, 60);
  }

  // Small stats area
  let cursorY = 90;
  doc.setFillColor(250, 250, 250);
  doc.rect(36, cursorY, pageWidth - 72, 48, 'F');
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.text(`Total movimientos: ${stats.total ?? movements.length}`, 48, cursorY + 18);
  doc.text(`Entradas: ${stats.inbound ?? 0}`, 220, cursorY + 18);
  doc.text(`Salidas: ${stats.outbound ?? 0}`, 340, cursorY + 18);
  doc.text(`Ajustes: ${stats.adjustments ?? 0}`, 440, cursorY + 18);
  cursorY += 70;

  // Table
  const head = [['Producto', 'Tipo', 'Cantidad', 'Referencia', 'Fecha', 'Usuario', 'Stock antes', 'Stock después']];
  // Simple translator for movement types (temporary until full i18n is added)
  const translateType = (t) => {
    if (!t) return '-';
    const map = {
      sale: 'Venta',
      purchase: 'Compra',
      adjustment: 'Ajuste',
      transfer: 'Transferencia'
    };
    return map[t] ?? t;
  };

  const body = movements.map(m => [
    m.product?.name || '-',
    translateType((m.type || m.movement_type)),
    String(m.quantity ?? '-'),
    m.reference?.number || (m.reference_type ? `${m.reference_type} #${m.reference_id ?? ''}` : '-'),
    new Date(m.created_at || m.movement_date).toLocaleString(),
    m.user?.name || '-',
    m.stock_before ?? '-',
    m.stock_after ?? (m.product?.stock ?? '-')
  ]);

  autoTable(doc, {
    startY: cursorY,
    headStyles: {
      fillColor: [139, 95, 191],
      textColor: 255,
      halign: 'center'
    },
    head: head,
    body: body,
    styles: {
      fontSize: 9,
      cellPadding: 6
    },
    theme: 'striped',
    margin: { left: 36, right: 36 }
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 30, { align: 'center' });
  }

  return doc;
};
