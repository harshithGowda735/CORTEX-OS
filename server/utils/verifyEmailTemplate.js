function verifyEmailTemplate(name, otp) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #f6f9fc;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      }
    </style>
  </head>

  <body>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding: 40px 16px;">
          
          <!-- Container -->
          <table width="100%" max-width="480" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 12px; border: 1px solid #e6ebf1;">
            
            <!-- Header -->
            <tr>
              <td style="padding: 28px 32px 16px 32px;">
                <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">
                  🧠 CORTEX-OS
                </h2>
                <p style="margin: 4px 0 0 0; font-size: 13px; color: #6b7280;">
                  Autonomous MCP-Agent Framework
                </p>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="border-top: 1px solid #e6ebf1;"></td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding: 32px;">
                
                <h1 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 600; color: #111827;">
                  Verify your email
                </h1>

                <p style="margin: 0 0 20px 0; font-size: 14px; color: #4b5563; line-height: 1.6;">
                  Hi ${name},<br><br>
                  Welcome to <strong>CORTEX-OS</strong>. Please confirm your email address to activate your account.
                </p>

                <!-- CTA Button -->
                <div style="margin: 24px 0;">
                  <a href="#" style="
                    display: inline-block;
                    padding: 12px 20px;
                    background: #6366f1;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                  ">
                    Verify Email
                  </a>
                </div>

                <!-- OTP Fallback -->
                <p style="margin: 20px 0 8px 0; font-size: 13px; color: #6b7280;">
                  Or use this verification code:
                </p>

                <div style="
                  font-size: 20px;
                  letter-spacing: 6px;
                  font-weight: 600;
                  color: #111827;
                  padding: 12px 16px;
                  background: #f3f4f6;
                  border-radius: 8px;
                  display: inline-block;
                ">
                  ${otp}
                </div>

                <!-- Info -->
                <p style="margin: 24px 0 0 0; font-size: 12px; color: #6b7280; line-height: 1.5;">
                  This code expires in 10 minutes. If you didn’t request this, you can safely ignore this email.
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="border-top: 1px solid #e6ebf1; padding: 20px 32px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                  © ${new Date().getFullYear()} CORTEX-OS · Autonomous MCP-Agent Framework
                </p>
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

module.exports = verifyEmailTemplate;