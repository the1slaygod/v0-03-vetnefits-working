import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const clinicId = "default-clinic-id";

export async function POST(req: Request) {
  const body = await req.json();
  try {
    await supabase
      .from("clinic_settings")
      .upsert({ ...body, clinic_id: clinicId }, { onConflict: "clinic_id" });
    return NextResponse.json({
      success: true,
      message: "Settings saved successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to save settings." },
      { status: 500 }
    );
  }
}
