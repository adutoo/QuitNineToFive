import { GoogleAuth } from "google-auth-library";
import { google, sheets_v4 } from "googleapis";

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor() {
    // 🔴 SAFETY CHECKS (fail fast if env vars are missing)
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_EMAIL is not set");
    }

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY is not set");
    }

    if (!process.env.GOOGLE_SHEETS_ID) {
      throw new Error("GOOGLE_SHEETS_ID is not set");
    }

    // ✅ Create Google Auth using ENV variables (Render-safe)
    const auth = new GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(
          /\\n/g,
          "\n"
        ),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  }

  // ✅ ADD EMAIL TO GOOGLE SHEET
  async addEmailToSheet(email: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const rowData = [timestamp, email];

      await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.spreadsheetId,
        range: "Form Responses 1!A:B",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [rowData],
        },
      });

      console.log("✅ Email added to Google Sheets");
    } catch (error) {
      console.error("❌ Error adding email to Google Sheets:", error);
      throw new Error("Failed to save email to waitlist");
    }
  }

  // ✅ READ WAITLIST COUNT
  async getWaitlistCountFromSheet(): Promise<number> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "Pivot!G6",
      });

      const value = response.data.values?.[0]?.[0];
      const count = Number(value);

      return isNaN(count) ? 0 : count;
    } catch (error) {
      console.error("❌ Error reading waitlist count:", error);
      return 0;
    }
  }
}

// ✅ SINGLETON INSTANCE
export const googleSheetsService = new GoogleSheetsService();
