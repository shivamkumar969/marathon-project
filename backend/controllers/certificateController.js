const PDFDocument = require("pdfkit");
const User = require("../models/User");
const Event = require("../models/Event");
const Registration = require("../models/Registration");
const Winner = require("../models/Winner");
const fs = require("fs");
const path = require("path");
const https = require("https");

const fontPath = path.join(__dirname, '..', 'GreatVibes-Regular.ttf');

const downloadFont = () => {
  return new Promise((resolve) => {
    if (fs.existsSync(fontPath)) {
      return resolve(true);
    }
    const file = fs.createWriteStream(fontPath);
    https.get('https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf', (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    }).on('error', () => {
      fs.unlink(fontPath, () => {});
      resolve(false);
    });
  });
};

// Start download asynchronously right away so it's ready when needed
downloadFont();

const isEventEnded = async (event, eventId) => {
  if (!event) return false;
  
  // Explicitly confirmed by coordinator
  if (event.resultsDeclared === true) return true;
  
  // Fallback: If winners are declared, it's definitely ended
  const winnersCount = await Winner.countDocuments({ eventId });
  return winnersCount > 0; 
};

// Helper to draw an elegant border
const drawBorder = (doc, isWinner = false) => {
  // Main thick border
  doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
     .lineWidth(8)
     .strokeColor(isWinner ? "#d97706" : "#a855f7") // Gold for winner, Fuchsia for participation
     .stroke();
  
  // Inner thin border
  doc.rect(30, 30, doc.page.width - 60, doc.page.height - 60)
     .lineWidth(2)
     .strokeColor(isWinner ? "#b45309" : "#475569") 
     .stroke();

  // If winner, draw a very subtle watermark in the background
  if (isWinner) {
    doc.save();
    const oldY = doc.y;
    const oldX = doc.x;
    doc.fontSize(120);
    doc.fillOpacity(0.04);
    doc.fillColor("#d97706");
    doc.translate(doc.page.width / 2, doc.page.height / 2);
    doc.rotate(-30);
    doc.text("ACHIEVEMENT", -350, -50, { width: 700, align: "center", lineBreak: false });
    doc.restore();
    doc.x = oldX;
    doc.y = oldY;
  }
};

const drawSignatures = (doc, coordName, sigY = 480) => {
  const directorName = "P.N Jha";

  // Simulate Digital Signatures (Dark Blue ink)
  const hasCursive = fs.existsSync(fontPath);
  if (hasCursive) {
    doc.font(fontPath).fontSize(36).fillColor("#1e40af");
  } else {
    doc.font("Times-BoldItalic").fontSize(28).fillColor("#1e40af");
  }
  
  doc.text(coordName, 140, sigY - 15, { width: 220, align: 'center' });
  doc.text(directorName, doc.page.width - 340, sigY - 15, { width: 220, align: 'center' });

  // Lines
  doc.font("Helvetica").fontSize(14).fillColor("#0f0a19");
  doc.text("_______________________", 150, sigY + 25);
  doc.text("_______________________", doc.page.width - 330, sigY + 25);
  
  // Titles
  doc.font("Helvetica-Bold").fontSize(12).fillColor("#475569");
  doc.text("Event Coordinator", 150, sigY + 45, { width: 175, align: 'center' });
  doc.text("Director", doc.page.width - 330, sigY + 45, { width: 175, align: 'center' });
};

const generateParticipationPDF = (user, event) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4", layout: "landscape", margins: { top: 50, bottom: 0, left: 50, right: 50 }, autoFirstPage: true
      });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      drawBorder(doc, false);
      doc.font("Times-BoldItalic").fontSize(42).fillColor("#0f0a19").text("CERTIFICATE", 0, 100, { width: 841.89, align: "center" });
      doc.font("Helvetica-Bold").fontSize(20).fillColor("#64748b").text("OF PARTICIPATION", 0, 145, { width: 841.89, align: "center", characterSpacing: 5 });
      doc.font("Times-Roman").fontSize(18).fillColor("#334155").text("This is proudly presented to", 0, 210, { width: 841.89, align: "center" });
      doc.font("Times-BoldItalic").fontSize(36).fillColor("#c026d3").text(user.name, 0, 250, { width: 841.89, align: "center" });
      doc.font("Times-Roman").fontSize(16).fillColor("#334155").text("for outstanding effort and active participation in", 0, 310, { width: 841.89, align: "center" });
      doc.font("Helvetica-Bold").fontSize(24).fillColor("#0f0a19").text(event.title, 0, 350, { width: 841.89, align: "center" });
      doc.font("Helvetica").fontSize(14).fillColor("#475569").text(`Held on ${event.date || 'a specified date'} at ${event.venue || 'campus'}`, 0, 400, { width: 841.89, align: "center" });

      const coordName = event.coordinators && event.coordinators.length > 0 ? event.coordinators[0].name : "Event Coordinator";
      drawSignatures(doc, coordName, 480);
      doc.end();
    } catch (e) { reject(e); }
  });
};

const generateAchievementPDF = (user, event, winnerData) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4", layout: "landscape", margins: { top: 50, bottom: 0, left: 50, right: 50 }, autoFirstPage: true
      });
      let buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      drawBorder(doc, true);
      doc.font("Times-BoldItalic").fontSize(42).fillColor("#0f0a19").text("CERTIFICATE", 0, 100, { width: 841.89, align: "center" });
      doc.font("Helvetica-Bold").fontSize(20).fillColor("#d97706").text("OF ACHIEVEMENT", 0, 145, { width: 841.89, align: "center", characterSpacing: 6 });
      doc.font("Times-Roman").fontSize(18).fillColor("#334155").text("This honor is hereby awarded to", 0, 210, { width: 841.89, align: "center" });
      doc.font("Times-BoldItalic").fontSize(40).fillColor("#b45309").text(user.name, 0, 250, { width: 841.89, align: "center" });
      doc.font("Times-Roman").fontSize(18).fillColor("#334155").text("for securing the prestigious", 0, 310, { width: 841.89, align: "center" });
      doc.font("Times-BoldItalic").fontSize(26).fillColor("#d97706").text(`${winnerData.position} Place`, 0, 340, { width: 841.89, align: "center" });
      doc.font("Times-Roman").fontSize(18).fillColor("#334155").text("in", 0, 375, { width: 841.89, align: "center" });
      doc.font("Helvetica-Bold").fontSize(26).fillColor("#0f0a19").text(event.title, 0, 405, { width: 841.89, align: "center" });
      doc.font("Helvetica").fontSize(14).fillColor("#475569").text(`Held on ${event.date || 'a specified date'} at ${event.venue || 'campus'}`, 0, 445, { width: 841.89, align: "center" });

      const coordName = event.coordinators && event.coordinators.length > 0 ? event.coordinators[0].name : "Event Coordinator";
      drawSignatures(doc, coordName, 490);
      doc.end();
    } catch (e) { reject(e); }
  });
};

// Participation Certificate
const participationCertificate = async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const user = await User.findById(userId);
    const event = await Event.findById(eventId).populate("coordinators");
    const registration = await Registration.findOne({ 
      $or: [{ userId: userId }, { teamMembers: userId }],
      eventId 
    });

    if (!user || !event || !registration) {
      return res.status(404).send("Details not found");
    }

    const isUserPresent = registration.presentMembers?.includes(userId) || (registration.userId.toString() === userId && registration.isPresent);
    
    if (!isUserPresent) {
      return res.status(403).send("You must be individually marked 'Present' to download this certificate.");
    }

    const ended = await isEventEnded(event, eventId);
    if (!ended) {
      return res.status(403).send("Certificates are only available after the event has completely ended and winners are announced.");
    }

    const winningRegistration = await Registration.findOne({
      $or: [{ userId: userId }, { teamMembers: userId }],
      eventId,
      isWinner: true
    });
    
    if (winningRegistration) {
      return res.status(403).send("You are a winner! Please download your Achievement Certificate instead.");
    }

    const buffer = await generateParticipationPDF(user, event);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${user.name.replace(/\s+/g, '_')}_Participation.pdf`);
    res.send(buffer);

  } catch (error) {
    res.status(500).send("Error generating certificate");
  }
};

// Winner Certificate
const winnerCertificate = async (req, res) => {
  try {
    const { userId, eventId } = req.params;

    const user = await User.findById(userId);
    const event = await Event.findById(eventId).populate("coordinators");
    // The winnerData stores the primary userId who registered the team,
    // so we need to check if the current user is part of the winning Registration.
    const winningRegistration = await Registration.findOne({
      $or: [{ userId: userId }, { teamMembers: userId }],
      eventId,
      isWinner: true
    });

    if (!winningRegistration) {
      return res.status(404).send("Winner details not found for this participant");
    }
    
    // We get the winner Data to know the position
    const winnerData = await Winner.findOne({ userId: winningRegistration.userId, eventId });

    const ended = await isEventEnded(event, eventId);
    if (!ended) {
      return res.status(403).send("Certificates are only available after the event has completely ended and winners are announced.");
    }

    const buffer = await generateAchievementPDF(user, event, winnerData);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${user.name.replace(/\s+/g, '_')}_Achievement.pdf`);
    res.send(buffer);

  } catch (error) {
    res.status(500).send("Error generating certificate");
  }
};

const { sendCertificateEmail } = require("../utils/sendEmail");

const sendAllCertificates = async (eventId) => {
  try {
    const event = await Event.findById(eventId).populate("coordinators");
    if (!event) return;

    const registrations = await Registration.find({ eventId }).populate("userId teamMembers");
    const winners = await Winner.find({ eventId });

    for (const reg of registrations) {
      const presentUsers = [];
      if (event.type === 'individual' && reg.isPresent) {
        if (reg.userId) presentUsers.push(reg.userId);
      } else if (event.type === 'team') {
        if (reg.teamMembers) {
          for (const member of reg.teamMembers) {
            if (reg.presentMembers && reg.presentMembers.includes(member._id)) {
              presentUsers.push(member);
            }
          }
        }
        if (reg.isPresent && reg.userId) presentUsers.push(reg.userId);
      }

      const isWinner = reg.isWinner;
      const winnerData = isWinner ? winners.find(w => w.userId.toString() === reg.userId._id.toString()) : null;

      for (const user of presentUsers) {
        if (!user || !user.email) continue;
        try {
          if (isWinner && winnerData) {
            const pdfBuffer = await generateAchievementPDF(user, event, winnerData);
            await sendCertificateEmail(user.email, user.name, event.title, true, pdfBuffer);
          } else {
            const pdfBuffer = await generateParticipationPDF(user, event);
            await sendCertificateEmail(user.email, user.name, event.title, false, pdfBuffer);
          }
        } catch (err) {
          console.error(`Failed to send email to ${user.email}`, err);
        }
      }
    }
  } catch (e) {
    console.error("Error in automated certificate dispatch", e);
  }
};

module.exports = {
  participationCertificate,
  winnerCertificate,
  sendAllCertificates
};