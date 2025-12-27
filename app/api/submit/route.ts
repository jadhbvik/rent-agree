import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "../../../lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const mobile = formData.get("mobile") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const file = formData.get("file") as File;

    let filePath = null;
    let fileName = null;

    if (file) {
      // Generate unique filename
      const timestamp = Date.now();
      const originalName = file.name;
      fileName = originalName;
      const uniqueFileName = `${timestamp}_${originalName}`;
      filePath = `/uploads/${uniqueFileName}`;

      // Ensure uploads directory exists
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      await mkdir(uploadsDir, { recursive: true });

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(join(uploadsDir, uniqueFileName), buffer);
    }

    // Save to database
    const submission = await prisma.saleAgreement.create({
      data: {
        name,
        email,
        mobile,
        startDate,
        endDate,
        fileName,
        filePath,
      },
    });

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message });
  }
}

export async function GET() {
  try {
    const submissions = await prisma.saleAgreement.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(submissions);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ success: false, error: (error as Error).message });
  }
}
