import { NextRequest, NextResponse } from "next/server";
import cron from "node-cron";

// In-memory storage for sent alerts (to avoid duplicate SMS)
let sentAlerts = new Set<string>();

// Function to check and send automatic SMS alerts
async function checkAndSendAlerts() {
  try {
    console.log("🔍 Checking for expiring agreements...");

    // Fetch all agreements
    const [rentResponse, saleResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/rent`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/submit`)
    ]);

    const rentData = rentResponse.ok ? await rentResponse.json() : [];
    const saleData = saleResponse.ok ? await saleResponse.json() : [];

    const allAgreements = [
      ...rentData.map((item: any) => ({ ...item, type: 'rent' })),
      ...saleData.map((item: any) => ({ ...item, type: 'sale' }))
    ];

    const today = new Date();
    let alertsSent = 0;

    for (const agreement of allAgreements) {
      const endDate = new Date(agreement.endDate);
      const diffTime = endDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Send alert if expiring within 7 days and not already sent
      if (diffDays <= 7 && diffDays >= 0) {
        const alertKey = `${agreement.type}-${agreement.name}-${agreement.mobile}-${agreement.endDate}`;

        if (!sentAlerts.has(alertKey)) {
          const message = `Alert: Your ${agreement.type} agreement for ${agreement.name} expires in ${diffDays} days. Please renew soon.`;

          try {
            const smsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/send-sms`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                mobile: agreement.mobile,
                message: message
              }),
            });

            if (smsResponse.ok) {
              sentAlerts.add(alertKey);
              alertsSent++;
              console.log(`✅ SMS sent to ${agreement.mobile} for ${agreement.type} agreement (${diffDays} days left)`);
            } else {
              console.error(`❌ Failed to send SMS to ${agreement.mobile}`);
            }
          } catch (error) {
            console.error(`❌ Error sending SMS to ${agreement.mobile}:`, error);
          }
        }
      }
    }

    console.log(`📊 Cron job completed: ${alertsSent} SMS alerts sent`);
    return { success: true, alertsSent };

  } catch (error) {
    console.error("❌ Cron job error:", error);
    return { success: false, error: error };
  }
}

// Global flag to prevent duplicate cron jobs
let cronJobScheduled = false;

// Schedule the cron job to run daily at 9 AM
if (!cronJobScheduled) {
  cron.schedule('0 9 * * *', async () => {
    console.log("⏰ Running daily SMS alert cron job...");
    await checkAndSendAlerts();
  });

  cronJobScheduled = true;
  console.log("✅ Daily SMS alert cron job scheduled (runs at 9 AM daily)");
}

export async function GET() {
  // Manual trigger endpoint for testing
  const result = await checkAndSendAlerts();
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  // Manual trigger endpoint for testing
  const result = await checkAndSendAlerts();
  return NextResponse.json(result);
}