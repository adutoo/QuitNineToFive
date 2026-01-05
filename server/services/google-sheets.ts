import { GoogleAuth } from "google-auth-library";
import { google, sheets_v4 } from "googleapis";

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor() {
    // 🔴 SAFETY CHECKS
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL is not set");
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64 is not set");
    }

    if (!process.env.GOOGLE_SHEETS_ID) {
      throw new Error("GOOGLE_SHEETS_ID is not set");
    }

    // ✅ Decode private key safely (FIXES OpenSSL error)
    const privateKey = Buffer.from(
      process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_BASE64,
      "base64"
    ).toString("utf8");

    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  }

  async addEmailToSheet(email: string): Promise<void> {
    const timestamp = new Date().toISOString();

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: "Form Responses 1!A:B",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[timestamp, email]],
      },
    });
  }

  async getWaitlistCountFromSheet(): Promise<number> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "Pivot!G6",
      });

      const value = response.data.values?.[0]?.[0];
      return Number(value) || 0;
    } catch (error) {
      console.error("❌ Error reading waitlist count:", error);
      return 0;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
