import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export async function generateInvoice({ auction, buyer, seller, amount }) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const invoicesDir = path.join(__dirname, '../../invoices');

  if (!fs.existsSync(invoicesDir)) {
    fs.mkdirSync(invoicesDir, { recursive: true });
  }

  const filePath = path.join(invoicesDir, `invoice-${auction.id}.pdf`);

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4' });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // --- Invoice content ---
      doc.fontSize(22).text('Auction Invoice', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Auction: ${auction.item_name}`);
      doc.text(`Description: ${auction.description}`);
      doc.text(`Buyer: ${buyer.name} <${buyer.email}>`);
      doc.text(`Seller: ${seller.name} <${seller.email}>`);
      doc.moveDown();
      doc.fontSize(16).text(`Total: $${amount}`);
      doc.end();

      // ✅ Wait until file is fully written
      stream.on('finish', () => resolve(filePath));
      stream.on('error', reject);
    } catch (err) {
      reject(err);
    }
  });
}
