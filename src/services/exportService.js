import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportService = {
  // Export Transactions to Excel (.xlsx)
  exportToExcel(transactions, dateRangeStr = '') {
    const data = transactions.map((t, idx) => ({
      'No': idx + 1,
      'No Struk': t.receiptNo,
      'Tanggal': new Date(t.date).toLocaleString('id-ID'),
      'Jumlah Item': t.items.reduce((sum, item) => sum + item.qty, 0),
      'Metode Pembayaran': t.paymentMethod,
      'Subtotal (Rp)': t.subtotal,
      'Diskon (Rp)': t.discount,
      'Total Penjualan (Rp)': t.total,
      'Status Sync': t.syncStatus
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Penjualan');

    const fileName = `Laporan_Penjualan_${dateRangeStr || new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  },

  // Export Sales Summary to PDF
  exportToPDF(transactions, summary, storeInfo, dateRangeStr = '') {
    const doc = new jsPDF();

    // Store Header
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59);
    doc.text(storeInfo.name || 'TOKO BERKAH UTAMA', 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(storeInfo.address || 'Jl. Raya Toko', 14, 26);
    doc.text(`Telepon: ${storeInfo.phone || '-'}`, 14, 31);
    doc.text(`Periode: ${dateRangeStr || 'Keseluruhan'}`, 14, 36);

    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 40, 196, 40);

    // Summary Boxes
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Ringkasan Keuangan:', 14, 48);

    doc.setFontSize(10);
    doc.text(`Total Omset Penjualan : Rp ${summary.totalSales.toLocaleString('id-ID')}`, 14, 55);
    doc.text(`Total Keuntungan Bersih : Rp ${summary.netProfit.toLocaleString('id-ID')}`, 14, 61);
    doc.text(`Total Transaksi Selesai : ${summary.transactionCount} Transaksi`, 14, 67);

    // Transactions Table
    const tableData = transactions.map((t, idx) => [
      idx + 1,
      t.receiptNo,
      new Date(t.date).toLocaleDateString('id-ID') + ' ' + new Date(t.date).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      t.items.length + ' jenis',
      t.paymentMethod,
      `Rp ${t.total.toLocaleString('id-ID')}`
    ]);

    doc.autoTable({
      startY: 75,
      head: [['No', 'No Struk', 'Waktu', 'Barang', 'Pembayaran', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });

    const fileName = `Laporan_Kasir_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
  }
};
