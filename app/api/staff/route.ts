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
      .from("clinic_staff")
      .insert([{ ...body, clinic_id: clinicId }]);
    return NextResponse.json({
      success: true,
      message: "Staff member added successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to add staff member." },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  const body = await req.json();
  try {
    await supabase
      .from("clinic_staff")
      .update({ status: body.status })
      .eq("id", body.staffId)
      .eq("clinic_id", clinicId);
    return NextResponse.json({
      success: true,
      message: "Staff status updated successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to update staff status." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  const body = await req.json();
  try {
    await supabase
      .from("clinic_staff")
      .delete()
      .eq("id", body.staffId)
      .eq("clinic_id", clinicId);
    return NextResponse.json({
      success: true,
      message: "Staff member deleted successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to delete staff member." },
      { status: 500 }
    );
  }
}
