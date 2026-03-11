import { NextResponse } from "next/server";
import { fetchRegistrations } from "@/lib/db";
import { INDIVIDUAL_SPORTS, TEAM_SPORTS } from "@/lib/sports";

export async function GET() {
  try {
    const registrations = await fetchRegistrations();

    const indHeaders = INDIVIDUAL_SPORTS.map((s) => s.name);
    const teamHeaders = TEAM_SPORTS.map((s) => s.name);
    const header = ["Meno", "Email", ...indHeaders, ...teamHeaders, "Poznamka", "Datum"].join(",") + "\n";

    const rows = registrations.map((r) => {
      const indCols = INDIVIDUAL_SPORTS.map((s) =>
        (r.activities || []).includes(s.id) ? "ano" : ""
      );
      const teamCols = TEAM_SPORTS.map((s) =>
        (r.team_sports || []).includes(s.id) ? "ano" : ""
      );
      return [
        `"${r.name}"`,
        `"${r.email}"`,
        ...indCols.map((v) => `"${v}"`),
        ...teamCols.map((v) => `"${v}"`),
        `"${r.note || ""}"`,
        `"${new Date(r.created_at).toLocaleString("sk")}"`,
      ].join(",");
    });

    const csvContent = "\uFEFF" + header + rows.join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=sportovy-den-registracie.csv",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
