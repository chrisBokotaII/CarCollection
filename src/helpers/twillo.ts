import * as dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const {
  TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN,
  TWILIO_SERVICE_ID,
  TWILIO_CHANNEL,
} = process.env;

if (
  !TWILIO_ACCOUNT_SID ||
  !TWILIO_AUTH_TOKEN ||
  !TWILIO_SERVICE_ID ||
  !TWILIO_CHANNEL
) {
  throw new Error("Twilio environment variables are not set properly.");
}

const twilioClient = twilio(`${TWILIO_ACCOUNT_SID}`, `${TWILIO_AUTH_TOKEN}`);

export class TwilioActions {
  static async sendVerificationCode(phoneNumber: string) {
    try {
      const verification = await twilioClient.verify.v2
        .services(`${TWILIO_SERVICE_ID}`)
        .verifications.create({
          channel: `${TWILIO_CHANNEL}`,
          to: phoneNumber,
        });
      console.log("Verification sent: ", verification);
      return { status: "success", verificationStatus: verification.status };
    } catch (error) {
      console.error("Error sending verification code: ", error);
      return { status: "error", message: error.message || "Unknown error" };
    }
  }

  static async verifyCode(phoneNumber: string, code: string) {
    try {
      const verificationCheck = await twilioClient.verify.v2
        .services(`${TWILIO_SERVICE_ID}`)
        .verificationChecks.create({ code: code, to: phoneNumber });
      console.log("Verification check: ", verificationCheck);
      return {
        status: "success",
        verificationStatus: verificationCheck.status,
      };
    } catch (error) {
      console.error("Error verifying code: ", error);
      return { status: "error", message: error.message || "Unknown error" };
    }
  }
}
