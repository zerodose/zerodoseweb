import transporter from "./transporter";

export async function sendVerificationEmail({
    email,
    name,
    code,
}) {
    await transporter.sendMail({
        from: `"ZeroDose" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify your ZeroDose account",

        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <h2>Welcome to ZeroDose, ${name}</h2>

        <p>
          Thank you for creating your account.
          Please use the verification code below to verify your email address.
        </p>

        <div
          style="
            margin: 30px 0;
            padding: 20px;
            background: #f5f5f5;
            text-align: center;
            border-radius: 10px;
          "
        >
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px;">
            ${code}
          </div>
        </div>

        <p>
          This code will expire in <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not create this account, you can safely ignore this email.
        </p>

        <hr />

        <p style="font-size: 12px; color: #777;">
          ZeroDose
        </p>
      </div>
    `,
    });
}