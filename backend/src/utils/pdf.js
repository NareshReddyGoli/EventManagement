const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generate a certificate PDF
 * @param {object} data - Certificate data
 * @param {string} data.userName - Participant name
 * @param {string} data.eventName - Event name
 * @param {string} data.eventDate - Event date
 * @param {string} data.certificateNumber - Certificate number
 * @param {string} data.issuedDate - Issue date
 * @param {string} outputPath - Path to save the PDF
 * @returns {Promise<string>} - Path to generated PDF
 */
function generateCertificate(data, outputPath) {
  return new Promise((resolve, reject) => {
    try {
      // Create a document
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50
      });

      // Pipe to file
      const writeStream = fs.createWriteStream(outputPath);
      doc.pipe(writeStream);

      // Certificate border
      doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
        .lineWidth(3)
        .strokeColor('#1e40af')
        .stroke();

      doc.rect(40, 40, doc.page.width - 80, doc.page.height - 80)
        .lineWidth(1)
        .strokeColor('#1e40af')
        .stroke();

      // Certificate title
      doc.fontSize(40)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text('CERTIFICATE', 0, 100, {
          align: 'center'
        });

      doc.fontSize(16)
        .font('Helvetica')
        .fillColor('#374151')
        .text('OF PARTICIPATION', 0, 150, {
          align: 'center'
        });

      // This is to certify that
      doc.fontSize(14)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('This is to certify that', 0, 210, {
          align: 'center'
        });

      // Participant name
      doc.fontSize(32)
        .font('Helvetica-Bold')
        .fillColor('#111827')
        .text(data.userName, 0, 250, {
          align: 'center'
        });

      // Has participated in
      doc.fontSize(14)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('has successfully participated in', 0, 310, {
          align: 'center'
        });

      // Event name
      doc.fontSize(22)
        .font('Helvetica-Bold')
        .fillColor('#1e40af')
        .text(data.eventName, 0, 350, {
          align: 'center'
        });

      // Event date
      doc.fontSize(14)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text(`held on ${data.eventDate}`, 0, 400, {
          align: 'center'
        });

      // Certificate number and issue date
      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#9ca3af')
        .text(`Certificate No: ${data.certificateNumber}`, 60, doc.page.height - 80, {
          align: 'left'
        });

      doc.fontSize(10)
        .font('Helvetica')
        .fillColor('#9ca3af')
        .text(`Issue Date: ${data.issuedDate}`, 0, doc.page.height - 80, {
          align: 'right',
          width: doc.page.width - 120
        });

      // Signature line
      doc.moveTo(doc.page.width - 250, doc.page.height - 120)
        .lineTo(doc.page.width - 100, doc.page.height - 120)
        .strokeColor('#9ca3af')
        .stroke();

      doc.fontSize(12)
        .font('Helvetica')
        .fillColor('#6b7280')
        .text('Authorized Signature', doc.page.width - 250, doc.page.height - 100, {
          width: 150,
          align: 'center'
        });

      // Finalize PDF
      doc.end();

      writeStream.on('finish', () => {
        resolve(outputPath);
      });

      writeStream.on('error', (error) => {
        reject(error);
      });

    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Generate certificate filename
 * @param {string} certificateNumber - Certificate number
 * @returns {string} - Filename
 */
function generateCertificateFilename(certificateNumber) {
  return `certificate_${certificateNumber}_${Date.now()}.pdf`;
}

/**
 * Get certificates directory path
 * @returns {string} - Directory path
 */
function getCertificatesDir() {
  const dir = path.join(__dirname, '../../certificates');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  return dir;
}

module.exports = {
  generateCertificate,
  generateCertificateFilename,
  getCertificatesDir
};





