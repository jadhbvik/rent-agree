import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

// Initialize Twilio client conditionally
let client: any = null;
let twilioPhoneNumber: string | undefined;

try {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

  // Only initialize if we have valid credentials
  if (accountSid && authToken && accountSid.startsWith('AC') && twilioPhoneNumber) {
    client = twilio(accountSid, authToken);
    console.log("✅ Twilio client initialized successfully");
  } else {
    console.log("⚠️ Twilio credentials not configured - running in demo mode");
  }
} catch (error) {
  console.log("⚠️ Failed to initialize Twilio client - running in demo mode");
}

export async function POST(req: NextRequest) {
  try {
    const { mobile, message } = await req.json();

    // Validate input
    if (!mobile || !message) {
      return NextResponse.json(
        { success: false, error: "Mobile number and message are required" },
        { status: 400 }
      );
    }

    // Format mobile number to E.164 format
    let formattedMobile = mobile.toString().trim();

    // Remove any existing + if present
    if (formattedMobile.startsWith('+')) {
      formattedMobile = formattedMobile.substring(1);
    }

    // If it's a 10-digit Indian number, add +91
    if (formattedMobile.length === 10 && /^\d{10}$/.test(formattedMobile)) {
      formattedMobile = `+91${formattedMobile}`;
    }
    // If it's already 12 digits starting with 91, add +
    else if (formattedMobile.length === 12 && formattedMobile.startsWith('91')) {
      formattedMobile = `+${formattedMobile}`;
    }
    // If it's not in expected format, add + prefix
    else if (!formattedMobile.startsWith('+')) {
      formattedMobile = `+${formattedMobile}`;
    }

    console.log(`📱 Original mobile: ${mobile}, Formatted: ${formattedMobile}`);

    // Check if Twilio is configured
    if (!client) {
      console.log("📱 SMS Demo Mode (Twilio not configured):");
      console.log(`To: ${formattedMobile}`);
      console.log(`Message: ${message}`);
      console.log(`Timestamp: ${new Date().toISOString()}`);
      console.log(`---`);

      return NextResponse.json({
        success: true,
        message: "SMS sent successfully (demo mode - Twilio not configured)",
        mobile: formattedMobile,
        timestamp: new Date().toISOString(),
        mode: "demo"
      });
    }

    // Send SMS using Twilio
    try {
      const twilioMessage = await client.messages.create({
        body: message,
        from: twilioPhoneNumber,
        to: formattedMobile
      });

      console.log(`📱 SMS Sent via Twilio:`);
      console.log(`SID: ${twilioMessage.sid}`);
      console.log(`To: ${formattedMobile}`);
      console.log(`Status: ${twilioMessage.status}`);
      console.log(`---`);

      return NextResponse.json({
        success: true,
        message: "SMS sent successfully via Twilio",
        mobile: formattedMobile,
        messageSid: twilioMessage.sid,
        status: twilioMessage.status,
        timestamp: new Date().toISOString(),
        mode: "production"
      });

    } catch (twilioError: any) {
      console.error("Twilio SMS Error:", twilioError);

      return NextResponse.json(
        {
          success: false,
          error: `Twilio Error: ${twilioError.message}`,
          code: twilioError.code,
          mobile: formattedMobile
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("SMS sending error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send SMS" },
      { status: 500 }
    );
  }
}