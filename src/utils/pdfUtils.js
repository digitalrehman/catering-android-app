import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import RNFetchBlob from 'react-native-blob-util';
import { encode as btoa } from 'base-64';

export const numberToWords = num => {
  if (num === 0) return 'Zero Rupees Only';
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];
  const teens = [
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  let words = '';

  if (num >= 1000000) {
    const millions = Math.floor(num / 1000000);
    words += numberToWords(millions).replace(' Rupees Only', '') + ' Million ';
    num %= 1000000;
  }
  if (num >= 1000) {
    const thousands = Math.floor(num / 1000);
    if (thousands > 0)
      words +=
        numberToWords(thousands).replace(' Rupees Only', '') + ' Thousand ';
    num %= 1000;
  }
  if (num >= 100) {
    const hundreds = Math.floor(num / 100);
    words += ones[hundreds] + ' Hundred ';
    num %= 100;
  }
  if (num >= 20) {
    words += tens[Math.floor(num / 10)] + ' ';
    num %= 10;
  } else if (num >= 10) {
    words += teens[num - 10] + ' ';
    num = 0;
  }
  if (num > 0) words += ones[num] + ' ';
  return words.trim() + ' Rupees Only';
};

export const generatePDFFile = async (event, eventDetails) => {
  const {
    food = [],
    beverages = [],
    decoration = [],
    services = [],
  } = eventDetails;
  const totalAmount = parseFloat(event.total || 0);
  const advanceAmount = parseFloat(event.advance || 0);
  const balanceAmount = totalAmount - advanceAmount;

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 50;
  const drawText = (
    text,
    x,
    y,
    size = 11,
    bold = false,
    color = rgb(0, 0, 0),
  ) => {
    page.drawText(String(text || ''), {
      x,
      y,
      size,
      font: bold ? fontBold : font,
      color,
    });
  };
  const addSpace = (space = 14) => {
    y -= space;
  };

  // Header
  drawText('CATERING SERVICES', 50, y, 20, true, rgb(0.72, 0.2, 0.2));
  addSpace(25);
  drawText('QUOTATION', 50, y, 16, true);
  addSpace(20);
  page.drawLine({
    start: { x: 50, y: y },
    end: { x: width - 50, y: y },
    thickness: 1.5,
    color: rgb(0.72, 0.2, 0.2),
  });
  addSpace(25);

  // Client Info
  const clientTopY = y;
  drawText('CLIENT INFORMATION', 50, clientTopY, 13, true, rgb(0.72, 0.2, 0.2));
  addSpace(18);
  drawText(`Party Name: ${event.name}`, 60, y);
  addSpace();
  drawText(`Contact: ${event.contact_no}`, 60, y);
  addSpace();
  drawText(`Venue: ${event.venue}`, 60, y);
  addSpace();
  drawText(
    `Director Name: ${event.originalData?.director_name || 'N/A'}`,
    60,
    y,
  );

  // Event Details
  const baseY = clientTopY - 2;
  drawText('EVENT DETAILS', 320, baseY, 13, true, rgb(0.72, 0.2, 0.2));
  drawText(`Guests: ${event.guest}`, 330, baseY - 18);
  drawText(`Date: ${event.date}`, 330, baseY - 33);
  drawText(`Time: ${event.time || 'N/A'}`, 330, baseY - 48);
  drawText(`Function Code: ${event.function_code}`, 330, baseY - 63);
  y = baseY - 90;

  // Section Drawing Helpers
  const formatNum = n => {
    const num = parseFloat(n || 0);
    if (num === 0 || isNaN(num)) return '';
    return num % 1 === 0 ? String(num) : num.toFixed(2).replace(/\.00$/, '');
  };

  const addSection = (items, title) => {
    if (!items.length) return 0;
    let sectionTotal = 0;
    drawText(title.toUpperCase(), 50, y, 11, true, rgb(0.72, 0.2, 0.2));
    addSpace(16);
    items.forEach((item, index) => {
      const qty = formatNum(item.quantity);
      const rate = formatNum(item.unit_price);
      const amount =
        parseFloat(item.quantity || 0) * parseFloat(item.unit_price || 0);
      sectionTotal += amount;
      if (index % 2 === 0) {
        page.drawRectangle({
          x: 50,
          y: y - 5,
          width: width - 100,
          height: 22,
          color: rgb(0.98, 0.98, 0.98),
        });
      }
      drawText(`${index + 1}`, 55, y, 9);
      drawText(item.description || 'N/A', 80, y, 9);
      drawText(qty, 400, y, 9);
      drawText(rate ? `Rs. ${rate}` : '', 440, y, 9);
      drawText(amount ? `Rs. ${formatNum(amount)}` : '', 515, y, 9);
      addSpace(20);
    });
    drawText(`${title} Total:`, 400, y, 10, true);
    drawText(`Rs. ${formatNum(sectionTotal)}`, 515, y, 10, true);
    addSpace(22);
    return sectionTotal;
  };

  addSection(food, 'Food');
  addSection(beverages, 'Beverages');
  addSection(decoration, 'Decoration');
  addSection(services, 'Services');

  addSpace(12);
  page.drawLine({
    start: { x: 50, y },
    end: { x: width - 50, y },
    thickness: 1,
    color: rgb(0.72, 0.2, 0.2),
  });
  addSpace(22);
  drawText('Grand Total:', 350, y, 11, true);
  drawText(`Rs. ${formatNum(totalAmount)}`, 465, y, 11, true);
  addSpace(18);
  drawText('Received Payment:', 350, y, 11, true);
  drawText(`Rs. ${formatNum(advanceAmount)}`, 465, y, 11, true);
  addSpace(18);
  drawText('Balance:', 350, y, 11, true);
  drawText(`Rs. ${formatNum(balanceAmount)}`, 465, y, 11, true);
  addSpace(28);
  const amountInWords = numberToWords(totalAmount);
  drawText('Amount in Words:', 50, y, 10, true, rgb(0.72, 0.2, 0.2));
  addSpace(12);
  page.drawRectangle({
    x: 50,
    y: y - 5,
    width: width - 100,
    height: 26,
    color: rgb(0.98, 0.98, 0.98),
  });
  drawText(amountInWords, 55, y + 2, 9);

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  const pdfBase64 = btoa(String.fromCharCode(...pdfBytes));
  const fileName = `Quotation_${event.name.replace(/\s+/g, '_')}_${
    event.function_code
  }.pdf`;
  const path = `${RNFetchBlob.fs.dirs.CacheDir}/${fileName}`;
  await RNFetchBlob.fs.writeFile(path, pdfBase64, 'base64');
  return path;
};
