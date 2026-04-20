import { NextRequest, NextResponse } from "next/server";

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? "http://localhost:8000";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const merchantId = formData.get("merchantId") as string;
  const file = formData.get("file") as File;

  if (!merchantId || !file) {
    return NextResponse.json({ error: "merchantId and file required" }, { status: 400 });
  }

  const aiFormData = new FormData();
  aiFormData.append("file", file);
  aiFormData.append("merchant_id", merchantId);

  const response = await fetch(`${AI_SERVICE_URL}/catalog/parse`, {
    method: "POST",
    body: aiFormData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "AI service error" }));
    return NextResponse.json({ error: err.detail }, { status: 502 });
  }

  const result = await response.json();
  return NextResponse.json(result);
}
