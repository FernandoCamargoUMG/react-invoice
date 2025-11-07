import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Genera un recibo de caja simple a partir de un objeto invoice.
// invoice: { id, invoice_date, customer: { name, email }, items: [{ quantity, price, description }], total, payment_method, notes }
export function generateReceiptPdf(invoice = {}, options = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 12;

  // Header
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('RECIBO DE CAJA', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  const idText = invoice.id ? `N°: ${invoice.id}` : 'N°: --';
  doc.text(idText, 14, y);
  const dateText = invoice.invoice_date ? `Fecha: ${new Date(invoice.invoice_date).toLocaleDateString()}` : `Fecha: ${new Date().toLocaleDateString()}`;
  doc.text(dateText, pageWidth - 14, y, { align: 'right' });
  y += 8;

  // Company / place holder
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text(options.companyName || 'Importadora - Recibo', 14, y);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  if (options.companyAddress) {
    doc.text(options.companyAddress, 14, y + 5);
    y += 6;
  }
  y += 4;

  // Customer
  const customerName = invoice.customer?.name || invoice.customer_name || 'Cliente: --';
  doc.text(`Recibí de: ${customerName}`, 14, y);
  y += 6;
  if (invoice.customer?.email) {
    doc.text(`Email: ${invoice.customer.email}`, 14, y);
    y += 6;
  }

  // Amount summary
  const total = Number(invoice.total ?? invoice.amount ?? 0);
  doc.setFont(undefined, 'bold');
  doc.text(`Importe recibido: ${total.toFixed(2)}`, 14, y);
  doc.setFont(undefined, 'normal');
  y += 8;

  // Items table (si hay items)
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  if (items.length > 0) {
    const body = items.map((it) => {
      const qty = it.quantity ?? 1;
      const desc = it.description || it.product?.name || it.product_name || '';
      const price = Number(it.price ?? it.unit_price ?? 0).toFixed(2);
      const subtotal = (qty * Number(it.price ?? it.unit_price ?? 0)).toFixed(2);
      return [String(qty), desc, price, subtotal];
    });

    autoTable(doc, {
      startY: y,
      head: [['Cant', 'Descripción', 'P.Unit', 'Subtotal']],
      body,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [139, 95, 191] },
      columnStyles: {
        0: { cellWidth: 14 },
        1: { cellWidth: 90 },
        2: { cellWidth: 26, halign: 'right' },
        3: { cellWidth: 26, halign: 'right' },
      },
    });

    y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + 40;
  }

  // Totals and payment method
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL: ', pageWidth - 60, y);
  doc.text(`${total.toFixed(2)}`, pageWidth - 14, y, { align: 'right' });
  y += 8;

  if (invoice.payment_method) {
    doc.setFont(undefined, 'normal');
    doc.text(`Método de pago: ${invoice.payment_method}`, 14, y);
    y += 8;
  }

  if (invoice.notes) {
    doc.setFont(undefined, 'normal');
    doc.text('Observaciones:', 14, y);
    y += 6;
    // Wrap notes if long
    const splitNotes = doc.splitTextToSize(String(invoice.notes), pageWidth - 28);
    doc.text(splitNotes, 14, y);
    y += splitNotes.length * 5;
  }

  y += 12;
  // Signature line
  doc.text('Recibí conforme:', 14, y);
  doc.line(14, y + 6, pageWidth - 14, y + 6);
  y += 16;

  // Footer
  doc.setFontSize(8);
  doc.text(options.footerText || 'Este documento es un recibo de caja.', pageWidth / 2, doc.internal.pageSize.getHeight() - 12, { align: 'center' });

  const filename = `recibo_${invoice.id ?? 'sin-id'}.pdf`;
  doc.save(filename);
}

export default generateReceiptPdf;

// Genera un comprobante de compra (voucher) más detallado que un recibo de caja.
export function generatePurchasePdf(purchase = {}, options = {}) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 12;

  // Header
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(options.title || 'COMPROBANTE DE COMPRA', pageWidth / 2, y, { align: 'center' });
  y += 8;

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text(`N° Compra: ${purchase.purchase_number || purchase.id || '--'}`, 14, y);
  const dateText = purchase.purchase_date ? new Date(purchase.purchase_date).toLocaleDateString() : (purchase.created_at ? new Date(purchase.created_at).toLocaleDateString() : new Date().toLocaleDateString());
  doc.text(`Fecha: ${dateText}`, pageWidth - 14, y, { align: 'right' });
  y += 8;

  // Supplier info
  doc.setFont(undefined, 'bold');
  doc.text('Proveedor:', 14, y);
  doc.setFont(undefined, 'normal');
  // Aceptar varias formas: supplier.name, supplier.data.name, supplier_name
  const supplierName = purchase.supplier?.name || purchase.supplier?.data?.name || purchase.supplier_name || '---';
  doc.text(supplierName, 40, y);
  y += 6;
  const contactPerson = purchase.supplier?.contact_person || purchase.supplier?.data?.contact_person || purchase.supplier?.data?.contact || null;
  if (contactPerson) {
    doc.text(`Contacto: ${contactPerson}`, 14, y);
    y += 6;
  }
  const supplierEmail = purchase.supplier?.email || purchase.supplier?.data?.email || null;
  if (supplierEmail) {
    doc.text(`Email: ${supplierEmail}`, 14, y);
    y += 6;
  }
  y += 4;

  // Items table
  const items = Array.isArray(purchase.items) ? purchase.items : [];
  const body = items.map((it, idx) => {
    const desc = it.description || it.product?.name || it.product_name || `Item ${idx + 1}`;
    const qty = it.quantity ?? it.qty ?? 1;
    const unitCost = Number(it.cost_price ?? it.unit_price ?? it.price ?? 0).toFixed(2);
    const subtotal = (qty * Number(it.cost_price ?? it.unit_price ?? it.price ?? 0)).toFixed(2);
    return [String(idx + 1), desc, String(qty), unitCost, subtotal];
  });

  autoTable(doc, {
    startY: y,
    head: [['#', 'Descripción', 'Cant', 'P.Unit', 'Subtotal']],
    body,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [54, 162, 235] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 90 },
      2: { cellWidth: 18, halign: 'center' },
      3: { cellWidth: 24, halign: 'right' },
      4: { cellWidth: 26, halign: 'right' }
    }
  });

  y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : y + 40;

  // Totals
  const total = Number(purchase.total ?? purchase.amount ?? items.reduce((s, it) => s + ((it.quantity ?? 1) * Number(it.cost_price ?? it.price ?? 0)), 0));
  doc.setFont(undefined, 'bold');
  doc.text('SUBTOTAL:', pageWidth - 60, y);
  doc.text((total).toFixed(2), pageWidth - 14, y, { align: 'right' });
  y += 8;

  if (purchase.tax && Number(purchase.tax) > 0) {
    const taxValue = (total * Number(purchase.tax)) / 100;
    doc.setFont(undefined, 'normal');
    doc.text(`Impuesto (${purchase.tax}%):`, pageWidth - 60, y);
    doc.text(taxValue.toFixed(2), pageWidth - 14, y, { align: 'right' });
    y += 8;
  }

  if (purchase.discount && Number(purchase.discount) > 0) {
    const discountValue = Number(purchase.discount);
    doc.setFont(undefined, 'normal');
    doc.text(`Descuento:`, pageWidth - 60, y);
    doc.text(`-${discountValue.toFixed(2)}`, pageWidth - 14, y, { align: 'right' });
    y += 8;
  }

  const grandTotal = Number(purchase.total ?? total);
  doc.setFont(undefined, 'bold');
  doc.text('TOTAL:', pageWidth - 60, y);
  doc.text(`${grandTotal.toFixed(2)}`, pageWidth - 14, y, { align: 'right' });
  y += 12;

  // Notes
  if (purchase.notes) {
    doc.setFont(undefined, 'normal');
    doc.text('Notas:', 14, y);
    y += 6;
    const split = doc.splitTextToSize(String(purchase.notes), pageWidth - 28);
    doc.text(split, 14, y);
    y += split.length * 5;
  }

  y += 12;
  doc.text('Recibí conforme:', 14, y);
  doc.line(14, y + 6, pageWidth / 2 - 10, y + 6);
  doc.text('Entregué:', pageWidth / 2 + 10, y);
  doc.line(pageWidth / 2 + 10, y + 6, pageWidth - 14, y + 6);

  // Footer
  doc.setFontSize(8);
  doc.text(options.footerText || 'Comprobante de compra generado por el sistema.', pageWidth / 2, doc.internal.pageSize.getHeight() - 12, { align: 'center' });

  const filename = `comprobante_compra_${purchase.purchase_number ?? purchase.id ?? 'sin-id'}.pdf`;
  doc.save(filename);
}

