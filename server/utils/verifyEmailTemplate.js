function verifyEmailTemplate(name, otp) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; }
    </style>
  </head>
  <body>
    <div style="max-width: 520px; margin: 40px auto; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
      
      <!-- Header -->
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 32px 24px; text-align: center;">
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">🌿 AgriHealthTraffic</h1>
        <p style="color: #d1fae5; font-size: 13px; margin-top: 6px;">MCP Intelligence Platform</p>
      </div>

      <!-- Body -->
      <div style="padding: 36px 28px;">
        <p style="color: #e2e8f0; font-size: 16px; margin-bottom: 8px;">Hello <strong style="color: #34d399;">${name}</strong>,</p>
        <p style="color: #94a3b8; font-size: 14px; line-height: 1.7; margin-bottom: 28px;">
          Welcome to AgriHealthTraffic! Please use the verification code below to activate your account.
        </p>

        <!-- OTP Box -->
        <div style="background: #1e293b; border: 2px dashed #10b981; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 28px;">
          <p style="color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Your Verification Code</p>
          <p style="color: #10b981; font-size: 36px; font-weight: 800; letter-spacing: 8px;">${otp}</p>
        </div>

        <p style="color: #64748b; font-size: 13px; line-height: 1.6; margin-bottom: 16px;">
          This code expires in <strong style="color: #f59e0b;">10 minutes</strong>. If you did not request this, please ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #1e293b; margin: 24px 0;">

        <p style="color: #475569; font-size: 12px; text-align: center;">
          &copy; ${new Date().getFullYear()} AgriHealthTraffic MCP Platform
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}

module.exports = verifyEmailTemplate;
