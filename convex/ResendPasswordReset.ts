import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

function resendApiKey(): string | undefined {
  return process.env.AUTH_RESEND_KEY ?? process.env.RESEND_API_KEY;
}

function resendFrom(): string {
  return process.env.RESEND_FROM ?? "Papermind <hello@usepapermind.app>";
}

function generateOtpCode(): string {
  const digits = "0123456789";
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += digits[bytes[i]! % 10];
  }
  return code;
}

export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: resendApiKey(),
  async generateVerificationToken() {
    return generateOtpCode();
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const apiKey = provider.apiKey ?? resendApiKey();
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new ResendAPI(apiKey);
    const { error } = await resend.emails.send({
      from: resendFrom(),
      to: [email],
      subject: "Reset your Papermind password",
      text: `Your Papermind password reset code is ${token}. It expires in 24 hours. If you did not request this, you can ignore this email.`,
      html: `<p>Your Papermind password reset code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:4px;margin:16px 0;">${token}</p><p style="color:#6b7280;font-size:14px;">This code expires in 24 hours. If you did not request a password reset, you can safely ignore this email.</p>`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },
});
