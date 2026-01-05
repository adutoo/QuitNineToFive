import { GoogleAuth } from "google-auth-library";
import { google, sheets_v4 } from "googleapis";

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor() {
    const base64 = process.env.GOOGLE_SERVICE_ACCOUNT_JSON_BASE64;
    if (!base64) {
      throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON_BASE64 not set");
    }

    const json = JSON.parse(
      Buffer.from(base64, "base64").toString("utf-8")
    );

    const auth = new GoogleAuth({
      credentials: json,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    this.sheets = google.sheets({ version: "v4", auth });
    this.spreadsheetId = process.env.GOOGLE_SHEETS_ID!;
  }

  async getWaitlistCountFromSheet(): Promise<number> {
    try {
      const res = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "Pivot!G6",
      });

      const value = res.data.values?.[0]?.[0];
      return Number(value) || 0;
    } catch (err) {
      console.error("read count error:", err);
      return 0;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
