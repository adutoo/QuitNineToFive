import { GoogleAuth } from "google-auth-library";
import { google, sheets_v4 } from "googleapis";

const SERVICE_ACCOUNT_EMAIL = "waitlist-replit@quit-9-to-5.iam.gserviceaccount.com";

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCuAY5v0vR8KbGE\nxrSQpYuCjzuKaOSlveQsq+Sr4myruo9ZcrgzOtp3ZVHmggy4wUiGIGvxclFHxinK\nLY4FkOLY3HZFNC/R3TEsjY9jiGbi+X1sAT3p7GsIH2yXhfx/LFU1UGDGqQpIV/9v\n8l7WOhDye7Uvm6zxmqodnWZ3mHX0s3qgaEvTcBsvxcc3ldVN5fWR8a6O4r9yh6e1\nJcd9HOoZ1x14HZAWYkB4Q/OkAbp1jRFMKS9rxknMc/NJBvObETqbn7I0AmU7yaUP\n0BS1rBFGbuzFnGcWIgxu7BsmkIQBeuVYGVjD8b0mcN7rJZzj9ts/+7WDKtoVQsT9\nFXy5pzudAgMBAAECggEAD76gTsn9yUZUg7kfGX+BMh0XvBxlpAGcpdYf6NWiE5/b\n3LIerLQElI0cbgkScZ07nLdOTRiU9jOeEGcy1JoZjlM6Sg5o51BU97CKNlKNz8\ne7/8uAM5aNCpA0AwVs4lvQ8cj6dXzdNH0n2GNlP5uSLXiC912twqkXPZ4wKBgDiq\ngtH2hAKbQfw0W9fBWR72esxggMDeYQSrcV3YPC0ZvKyyUWG8hO82um9GNboYS5jS\n5tC1hnPKO+uVzG9uuGSeQdLlOY7FLKHScT4XeqEXFA3ivVg+7kevgmkN9bA2CcO9\nEsLvDttF+/wlQ5N0G826CwtRlIdW1ojGcyadT9TTAoGBAJOsWIEE6LK7ps8eBEcZ\nXb+ZJfJLdoPvDiWOUGqbYbWYZDD4MWHNHfFvuWZx1xLTUUCJ6A3A789nfumyMvey\nHsxS8sp08r5mnmR4uCuztaLUQ1d/nFujZ7t5xIwKhRXhKMCIF1K2JwIVzoKfrfhr\nHQuKnkMBtk8poCkDTHlUZTQsELYwKBgQDBMRFVDJx3r9ZWCOxbvvg2pjKeEWhVU4ME\nXGV+3o9yKzLWlTV/I8QfGttB48D8eJ/uFNmncacVhEcV9OTBdrILaIi0dudSpONJ\npWcY0eQ6Pw9JshVEhYbtNNTRuh7KxExAmbdCtFCFc4uHJeku/ipmfQ96x/+WCdpp\nx5z8c07M/wKBgQDT41AaipdcwmTCQbo0u9g94Lwb8H7FPwQs8hJV1tIXCsgls3j6\nZqM3RXVwi147yDmsL43jXt6kzXt4b26pXz8GE6fR6A+lM6Sg5o51BU97CKNlKNz8\ne7/8uAM5aNCpA0AwVs4lvQ8cj6dXzdNH0n2GNlP5uSLXiC912twqkXPZ4wKBgDiq\ngtH2hAKbQfw0W9fBWR72esxggMDeYQSrcV3YPC0ZvKyyUWG8hO82um9GNboYS5jS\n5tC1hnPKO+uVzG9uuGSeQdLlOY7FLKHScT4XeqEXFA3ivVg+7kevgmkN9bA2CcO9\nEsLvDttF+/wlQ5N0G826CwtRlIdW1ojGcyadT9TTAoGBAJOsWIEE6LK7ps8eBEcZ\nXb+ZJfJLdoPvDiWOUGqbYbWYZDD4MWHNHfFvuWZx1xLTUUCJ6A3A789nfumyMvey\nHsxS8sp08r5mnmR4uCuztaLUQ1d/nFujZ7t5xIwKhRXhKMCIF1K2JwIVzoKfrfhr\nHQuKnkMBtk8poCkDTHlUZTQs\n-----END PRIVATE KEY-----\n`;

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;
  private spreadsheetId: string;

  constructor() {
    if (!process.env.GOOGLE_SHEETS_ID) {
      throw new Error("GOOGLE_SHEETS_ID is not set");
    }

    const auth = new GoogleAuth({
      credentials: {
        client_email: SERVICE_ACCOUNT_EMAIL,
        private_key: PRIVATE_KEY,
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
      requestBody: { values: [[timestamp, email]] },
    });
  }

  async getWaitlistCountFromSheet(): Promise<number> {
    try {
      const res = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.spreadsheetId,
        range: "Pivot!G6",
      });
      return Number(res.data.values?.[0]?.[0]) || 0;
    } catch (e) {
      console.error("read count error:", e);
      return 0;
    }
  }
}

export const googleSheetsService = new GoogleSheetsService();
