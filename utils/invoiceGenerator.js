// utils/invoiceGenerator.js
// const PDFDocument = require("pdfkit");
import PDFDocument from "pdfkit";
import fs from "fs";

export async function generateInvoicePdf(data, path) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(path);
    doc.pipe(stream);

    // Header
    doc
      .image(data.shopLogo || "", 50, 45, { width: 60 })
      .fontSize(20)
      .text(data.shopName, 120, 60)
      .fontSize(10)
      .text(data.shopAddress, 120, 85)
      .text(data.shopPhone, 120, 100)
      .text(data.shopEmail, 120, 115)
      .moveDown();

    doc.fontSize(25).text("INVOICE", { align: "right" });

    // Invoice & Customer
    doc
      .fontSize(10)
      .text(`Invoice No: ${data.invoiceNumber}`, { align: "right" })
      .text(`Date: ${new Date(data.saleDate).toLocaleDateString()}`, {
        align: "right",
      })
      .moveDown()
      .text(`Bill To: ${data.customerName}`)
      .text(data.customerPhone || "")
      .moveDown();

    // Table header
    const tableTop = 250;
    doc
      .font("Helvetica-Bold")
      .text("Item", 50, tableTop)
      .text("Qty", 300, tableTop)
      .text("Price", 380, tableTop, { align: "right" })
      .text("Total", 480, tableTop, { align: "right" })
      .moveTo(50, tableTop + 20)
      .lineTo(550, tableTop + 20)
      .stroke();

    // Table rows
    let y = tableTop + 30;
    data.items.forEach((item) => {
      doc
        .font("Helvetica")
        .text(item.name, 50, y)
        .text(item.quantity, 300, y)
        .text(item.unitPrice.toFixed(2), 380, y, { align: "right" })
        .text(item.totalPrice.toFixed(2), 480, y, { align: "right" });
      y += 20;
    });

    // Totals
    doc
      .moveTo(50, y + 10)
      .lineTo(550, y + 10)
      .stroke()
      .font("Helvetica-Bold")
      .text("Subtotal:", 380, y + 20, { align: "right" })
      .text(data.subtotal.toFixed(2), 480, y + 20, { align: "right" });

    if (data.discount) {
      doc
        .text("Discount:", 380, y + 35, { align: "right" })
        .text(data.discount.toFixed(2), 480, y + 35, { align: "right" });
    }
    if (data.tax) {
      doc
        .text("Tax:", 380, y + 50, { align: "right" })
        .text(data.tax.toFixed(2), 480, y + 50, { align: "right" });
    }

    doc
      .fontSize(15)
      .text("TOTAL:", 380, y + 75, { align: "right" })
      .text(data.totalAmount.toFixed(2), 480, y + 75, { align: "right" });

    // Footer
    doc
      .fontSize(10)
      .text("Thank you for your business!", 50, doc.page.height - 50, {
        align: "center",
      });

    doc.end();
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
}

// export default function generateInvoicePDF(data, outStream) {
//   const doc = new PDFDocument({ margin: 50 });

//   // Pipe PDF to the output (file or response)
//   doc.pipe(outStream);

//   // Attempt to add the shop logo if defined
//   const logoEnv = (process.env.SHOP_LOGO || "").trim();
//   if (logoEnv) {
//     // Resolve the path (handle absolute or relative values)
//     const logoPath = path.isAbsolute(logoEnv)
//       ? logoEnv
//       : path.resolve(process.cwd(), logoEnv);
//     if (fs.existsSync(logoPath)) {
//       // Draw the logo at position (50,50) with width 150
//       doc.image(logoPath, 50, 50, { width: 150 });
//     } else {
//       console.warn(`SHOP_LOGO file not found at ${logoPath}; skipping logo.`);
//       // Optionally, add fallback text or skip
//       doc.fontSize(20).text("Your Company Name", 50, 60);
//     }
//   } else {
//     console.info("SHOP_LOGO not set; generating PDF without logo.");
//     // Fallback behavior (e.g., add shop name instead)
//     doc.fontSize(20).text("Your Company Name", 50, 60);
//   }

//   // ... (add other PDF content: header, items, etc.) ...

//   doc.end();
// }
