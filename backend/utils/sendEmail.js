const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.MAIL_SERVER || 'smtp.gmail.com',
    port: process.env.MAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.MAIL_USERNAME || 'shivamji101202@gmail.com',
      pass: process.env.MAIL_PASSWORD || 'vezp ahya xxpo trgo',
    },
  });
};

const sendProvisioningEmail = async (userEmail, userName, userRole, plainPassword) => {
  try {
    const transporter = createTransporter();

    const roleName = userRole === 'admin' ? 'Master Admin' : 'Coordinator';

    const mailOptions = {
      from: `"SMART Event Manager" <${process.env.MAIL_DEFAULT_SENDER || 'shivamji101202@gmail.com'}>`,
      to: userEmail,
      subject: `Welcome to SMART Event Manager - Your ${roleName} Account`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #6a1b9a; text-align: center;">Welcome, ${userName}!</h2>
          <p style="font-size: 16px; color: #333;">Your <strong>${roleName}</strong> account for the SMART Event Manager has been successfully provisioned by the administration team.</p>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #6a1b9a; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Login Credentials:</strong></p>
            <p style="margin: 5px 0; font-size: 15px;"><strong>Email (Login ID):</strong> ${userEmail}</p>
            <p style="margin: 5px 0; font-size: 15px;"><strong>Password:</strong> ${plainPassword}</p>
          </div>

          <p style="font-size: 14px; color: #666;">Please login to your dashboard to manage your assigned events. We highly recommend changing your password after your first login for security purposes.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/login" style="background-color: #6a1b9a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Access Dashboard</a>
          </div>

          <hr style="border: 0; border-top: 1px solid #ddd; margin-top: 40px; margin-bottom: 20px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">This is an automated email from the SMART Event Manager system. Please do not reply.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${userEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
    return false;
  }
};

const sendEventRegistrationEmail = async (userEmail, userName, event) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"SMART Event Manager" <${process.env.MAIL_DEFAULT_SENDER || 'shivamji101202@gmail.com'}>`,
      to: userEmail,
      subject: `Registration Confirmed: ${event.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #10b981; text-align: center;">Registration Successful!</h2>
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #333;">You have successfully registered for <strong>${event.title}</strong>.</p>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 20px 0;">
            <h3 style="margin-top: 0;">Event Details</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${event.date || 'TBD'}</p>
            <p style="margin: 5px 0;"><strong>Venue:</strong> ${event.venue || 'TBD'}</p>
            <p style="margin: 5px 0;"><strong>Type:</strong> <span style="text-transform: uppercase;">${event.type}</span></p>
            ${event.amountPaid !== undefined ? `<p style="margin: 5px 0;"><strong>Amount Paid:</strong> ₹${event.amountPaid}</p>` : ''}
          </div>

          <p style="font-size: 14px; color: #666;">Please keep this email for your records. If you have any questions, you can check your Participant Dashboard.</p>
          
          <hr style="border: 0; border-top: 1px solid #ddd; margin-top: 40px; margin-bottom: 20px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">SMART Event Manager Automated Notification</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${userEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending registration email to ${userEmail}:`, error);
    return false;
  }
};

const sendPasswordResetEmail = async (userEmail, userName, newPassword) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"SMART Event Manager Support" <${process.env.MAIL_DEFAULT_SENDER || 'shivamji101202@gmail.com'}>`,
      to: userEmail,
      subject: `Your New Password - SMART Event Manager`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #eab308; text-align: center;">Password Reset</h2>
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #333;">You recently requested to reset your password. We have generated a new secure password for you.</p>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #eab308; margin: 20px 0; text-align: center;">
            <p style="margin: 0 0 10px 0; font-size: 16px;"><strong>Your New Password:</strong></p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #333; margin: 10px 0;">${newPassword}</p>
          </div>

          <p style="font-size: 14px; color: #666;">You can now log in using this new password. We highly recommend changing it immediately after logging in.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/login" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Go to Login</a>
          </div>

          <hr style="border: 0; border-top: 1px solid #ddd; margin-top: 40px; margin-bottom: 20px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">If you did not request this, please contact your administrator immediately.</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending password reset to ${userEmail}:`, error);
    return false;
  }
};

const sendCertificateEmail = async (userEmail, userName, eventTitle, isWinner, pdfBuffer) => {
  try {
    const transporter = createTransporter();
    const certType = isWinner ? "Achievement" : "Participation";
    const mailOptions = {
      from: `"SMART Event Manager" <${process.env.MAIL_DEFAULT_SENDER || 'shivamji101202@gmail.com'}>`,
      to: userEmail,
      subject: `Your Certificate of ${certType} - ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: ${isWinner ? '#d97706' : '#c026d3'}; text-align: center;">Congratulations, ${userName}!</h2>
          <p style="font-size: 16px; color: #333; text-align: center;">The results for <strong>${eventTitle}</strong> have been officially published.</p>
          <p style="font-size: 16px; color: #333; text-align: center;">Please find your official <strong>Certificate of ${certType}</strong> attached to this email.</p>
          <p style="font-size: 14px; color: #666; text-align: center; margin-top: 30px;">Thank you for being a part of this event!</p>
          <hr style="border: 0; border-top: 1px solid #ddd; margin-top: 40px; margin-bottom: 20px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">SMART Event Manager Automated Notification</p>
        </div>
      `,
      attachments: [
        {
          filename: `${userName.replace(/\s+/g, '_')}_${certType}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Error sending certificate to ${userEmail}:`, error);
    return false;
  }
};

const sendCoordinatorAssignmentEmail = async (userEmail, userName, eventTitle, eventDate) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"SMART Event Manager" <${process.env.MAIL_DEFAULT_SENDER || 'shivamji101202@gmail.com'}>`,
      to: userEmail,
      subject: `New Event Assignment: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #3b82f6; text-align: center;">New Event Assigned</h2>
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #333;">You have been officially assigned as a Coordinator for the upcoming event: <strong>${eventTitle}</strong>.</p>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <h3 style="margin-top: 0;">Event Details</h3>
            <p style="margin: 5px 0;"><strong>Event Title:</strong> ${eventTitle}</p>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${eventDate || 'TBD'}</p>
          </div>

          <p style="font-size: 14px; color: #666;">Please log in to your Coordinator Dashboard to manage registrations and finalize results for this event.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173/login" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Go to Dashboard</a>
          </div>

          <hr style="border: 0; border-top: 1px solid #ddd; margin-top: 40px; margin-bottom: 20px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">SMART Event Manager Automated Notification</p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Assignment email sent to ${userEmail}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`Error sending assignment email to ${userEmail}:`, error);
    return false;
  }
};

const sendCoordinatorDeassignmentEmail = async (userEmail, userName, eventTitle) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"SMART Event Manager" <${process.env.MAIL_DEFAULT_SENDER || 'shivamji101202@gmail.com'}>`,
      to: userEmail,
      subject: `Management Update: Deassignment from ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #f9f9f9;">
          <h2 style="color: #ef4444; text-align: center;">Event Management Update</h2>
          <p style="font-size: 16px; color: #333;">Hi ${userName},</p>
          <p style="font-size: 16px; color: #333;">This is to officially notify you that you have been <strong>deassigned</strong> from the management team of: <strong>${eventTitle}</strong>.</p>
          
          <div style="background-color: #fff; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0; color: #666; font-size: 14px;">If you have any questions regarding this change, please contact your System Administrator.</p>
          </div>

          <p style="font-size: 14px; color: #666;">You will no longer see this event in your management dashboard.</p>
          
          <hr style="border: 0; border-top: 1px solid #ddd; margin-top: 40px; margin-bottom: 20px;" />
          <p style="font-size: 12px; color: #999; text-align: center;">SMART Event Manager Automated Notification</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error(`Error sending deassignment email to ${userEmail}:`, error);
    return false;
  }
};

module.exports = {
  sendProvisioningEmail,
  sendEventRegistrationEmail,
  sendPasswordResetEmail,
  sendCertificateEmail,
  sendCoordinatorAssignmentEmail,
  sendCoordinatorDeassignmentEmail
};
