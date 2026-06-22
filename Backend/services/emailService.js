import nodemailer from 'nodemailer';

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  });
};

const buildWelcomeHtml = ({ name, email }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#1e293b,#334155);padding:32px 28px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="font-size:36px;color:#60a5fa;padding-bottom:8px;">
                    <span>&#127915;</span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">
                    Ticket Management System
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:16px;font-weight:600;color:#1e293b;padding-bottom:16px;">
                    Hello ${name},
                  </td>
                </tr>
                <tr>
                  <td style="font-size:14px;line-height:1.7;color:#475569;padding-bottom:12px;">
                    Welcome to <strong>Ticket Management System</strong>. Your administrator account has been created successfully.
                  </td>
                </tr>
                <tr>
                  <td style="font-size:14px;line-height:1.7;color:#475569;padding-bottom:20px;">
                    You can now log in and start managing your support workflow:
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 0 20px 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#475569;">
                          <span style="color:#3b82f6;margin-right:8px;">&#10003;</span> Creating and tracking tickets
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#475569;">
                          <span style="color:#3b82f6;margin-right:8px;">&#10003;</span> Managing team members
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#475569;">
                          <span style="color:#3b82f6;margin-right:8px;">&#10003;</span> Assigning work to your team
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#475569;">
                          <span style="color:#3b82f6;margin-right:8px;">&#10003;</span> Tracking ticket progress
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:14px;color:#475569;">
                          <span style="color:#3b82f6;margin-right:8px;">&#10003;</span> Viewing reports and analytics
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="font-size:14px;line-height:1.7;color:#475569;padding-bottom:4px;">
                    Thank you for choosing our platform.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f8fafc;padding:20px 28px;border-top:1px solid #e2e8f0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-size:12px;color:#94a3b8;text-align:center;">
                    Regards,<br>
                    <strong style="color:#64748b;">Support Team</strong>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendWelcomeEmail = async ({ name, email }) => {
  console.log(`[EMAIL] Sending welcome email to: ${email}`);

  const transporter = createTransporter();

  const mailOptions = {
    from: `"Ticket Management System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to Ticket Management System',
    html: buildWelcomeHtml({ name, email }),
  };

  await transporter.sendMail(mailOptions);

  console.log('[EMAIL] Welcome email sent successfully');
};

// Future email functions placeholder
export const sendTeamMemberCredentials = async ({ name, email, password }) => {
  // To be implemented
};

export const sendTicketAssignedEmail = async ({ userEmail, userName, ticketTitle, ticketId }) => {
  // To be implemented
};

export const sendTicketResolvedEmail = async ({ userEmail, userName, ticketTitle, ticketId }) => {
  // To be implemented
};

export const sendCommentNotificationEmail = async ({ userEmail, userName, ticketTitle, ticketId, commentAuthor }) => {
  // To be implemented
};
