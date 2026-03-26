import { NextResponse } from "next/server";
import { fetchRegistrations } from "@/lib/db";

const IND_COLS = [
  { id: "strelba",   label: "Streľba" },
  { id: "penalta",   label: "Penalta" },
  { id: "ostep",     label: "Oštep" },
  { id: "discgolf",  label: "Disc Golf" },
  { id: "wellness",  label: "Wellness" },
  { id: "gym",       label: "Gym" },
  { id: "bazen",     label: "Bazén" },
  { id: "aqua",      label: "Aqua" },
  { id: "bicykel",   label: "Bicykel" },
  { id: "beh",       label: "Beh" },
];

const TEAM_COLS = [
  { id: "futbal",        label: "Futbal" },
  { id: "beachvolejbal", label: "Beach Volejbal" },
  { id: "streetball",    label: "Streetball" },
];

function td(value, style = "") {
  return `<td style="border:1px solid #ccc;padding:4px 8px;text-align:center;${style}">${value}</td>`;
}

function tdLeft(value, style = "") {
  return `<td style="border:1px solid #ccc;padding:4px 8px;text-align:left;${style}">${value}</td>`;
}

export async function GET() {
  try {
    const registrations = await fetchRegistrations();

    /* Zoradiť od najväčšieho SPOLU */
    const sorted = [...registrations].sort((a, b) => {
      const totalA = (a.activities || []).length + (a.team_sports || []).length;
      const totalB = (b.activities || []).length + (b.team_sports || []).length;
      return totalB - totalA;
    });

    const headerStyle = "background-color:#e20074;color:#ffffff;font-weight:bold;text-align:center;border:1px solid #c0005f;padding:5px 8px;";

    const headerRow = `
      <tr>
        <th style="${headerStyle}">#</th>
        <th style="${headerStyle}text-align:left;">Meno</th>
        <th style="${headerStyle}text-align:left;">Email</th>
        ${IND_COLS.map((c) => `<th style="${headerStyle}">${c.label}</th>`).join("")}
        ${TEAM_COLS.map((c) => `<th style="${headerStyle}">${c.label}</th>`).join("")}
        <th style="${headerStyle}">Individ.</th>
        <th style="${headerStyle}">Tímové</th>
        <th style="${headerStyle}">SPOLU</th>
      </tr>`;

    const dataRows = sorted.map((r, i) => {
      const indCount = (r.activities || []).length;
      const teamCount = (r.team_sports || []).length;
      const total = indCount + teamCount;
      const rowBg = i % 2 === 0 ? "#ffffff" : "#dce6f1";

      return `
        <tr>
          ${td(i + 1, `background:${rowBg};`)}
          ${tdLeft(r.name, `background:${rowBg};`)}
          ${tdLeft(r.email, `background:${rowBg};`)}
          ${IND_COLS.map((c) =>
            td((r.activities || []).includes(c.id) ? "✓" : "", `background:${rowBg};color:#e20074;font-weight:bold;`)
          ).join("")}
          ${TEAM_COLS.map((c) =>
            td((r.team_sports || []).includes(c.id) ? "✓" : "", `background:${rowBg};color:#427bab;font-weight:bold;`)
          ).join("")}
          ${td(indCount, `background:${rowBg};font-weight:bold;`)}
          ${td(teamCount, `background:${rowBg};font-weight:bold;`)}
          ${td(total, `background:${rowBg};font-weight:bold;color:#e20074;`)}
        </tr>`;
    }).join("");

    const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
  <x:Name>Registracie</x:Name>
  <x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
  </x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
</head>
<body>
  <table style="border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11px;">
    ${headerRow}
    ${dataRows}
  </table>
</body>
</html>`;

    return new NextResponse(html, {
      headers: {
        "Content-Type": "application/vnd.ms-excel; charset=utf-8",
        "Content-Disposition": "attachment; filename=sportovy-den-registracie.xls",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
