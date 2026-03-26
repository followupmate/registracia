import { NextResponse } from "next/server";
import { fetchRegistrations } from "@/lib/db";
import { INDIVIDUAL_SPORTS, TEAM_SPORTS } from "@/lib/sports";

export async function GET() {
  try {
    const registrations = await fetchRegistrations();

    const indHeaders = INDIVIDUAL_SPORTS.map((s) => s.name);
    const teamHeaders = TEAM_SPORTS.map((s) => s.name);

    const header = [
      "#",
      "Meno",
      "Email",
      ...indHeaders,
      ...teamHeaders,
      "Individ.",
      "Tímové",
      "SPOLU",
    ].join(",") + "\n";

    const rows = registrations.map((r, i) => {
      const indCols = INDIVIDUAL_SPORTS.map((s) =>
        (r.activities || []).includes(s.id) ? "✓" : ""
      );
      const teamCols = TEAM_SPORTS.map((s) =>
        (r.team_sports || []).includes(s.id) ? "✓" : ""
      );
      const indCount = (r.activities || []).length;
      const teamCount = (r.team_sports || []).length;
      return [
        i + 1,
        `"${r.name}"`,
        `"${r.email}"`,
        ...indCols.map((v) => `"${v}"`),
        ...teamCols.map((v) => `"${v}"`),
        indCount,
        teamCount,
        indCount + teamCount,
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
