import { NextResponse } from "next/server";
import { fetchRegistrations } from "@/lib/db";

/* Poradie a názvy stĺpcov podľa požadovaného výstupu */
const IND_COLS = [
  { id: "strelba",  label: "Streľba" },
  { id: "penalta",  label: "Penalta" },
  { id: "ostep",    label: "Oštep" },
  { id: "discgolf", label: "Disc Golf" },
  { id: "wellness", label: "Wellness" },
  { id: "gym",      label: "Gym" },
  { id: "bazen",    label: "Bazén" },
  { id: "aqua",     label: "Aqua" },
  { id: "bicykel",  label: "Bicykel" },
  { id: "beh",      label: "Beh" },
];

const TEAM_COLS = [
  { id: "futbal",       label: "Futbal" },
  { id: "beachvolejbal", label: "Beach Volejbal" },
  { id: "streetball",   label: "Streetball" },
];

const SEP = ";";

function esc(val) {
  return `"${String(val).replace(/"/g, '""')}"`;
}

export async function GET() {
  try {
    const registrations = await fetchRegistrations();

    const header = [
      "#",
      "Meno",
      "Email",
      ...IND_COLS.map((c) => c.label),
      ...TEAM_COLS.map((c) => c.label),
      "Individ.",
      "Tímové",
      "SPOLU",
    ].join(SEP);

    const rows = registrations.map((r, i) => {
      const indCols = IND_COLS.map((c) =>
        (r.activities || []).includes(c.id) ? "✓" : ""
      );
      const teamCols = TEAM_COLS.map((c) =>
        (r.team_sports || []).includes(c.id) ? "✓" : ""
      );
      const indCount = (r.activities || []).length;
      const teamCount = (r.team_sports || []).length;
      return [
        i + 1,
        esc(r.name),
        esc(r.email),
        ...indCols.map(esc),
        ...teamCols.map(esc),
        indCount,
        teamCount,
        indCount + teamCount,
      ].join(SEP);
    });

    const csv = "\uFEFF" + header + "\n" + rows.join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=sportovy-den-registracie.csv",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
