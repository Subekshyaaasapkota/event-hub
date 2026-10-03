/**
 * CSV export helpers.
 *
 * Hand-rolled CSV breaks in two ways that both look like "the button does
 * nothing": a stray comma in a club name shifts every following column, and
 * an empty result set throws on Object.keys(undefined) instead of exporting
 * a header row. Both are handled here.
 */

const NEEDS_QUOTING = /[",\r\n]/;

/**
 * Quote a single cell. Escaping the quote as a doubled quote is what RFC 4180
 * requires and what Excel and Google Sheets both expect.
 */
const escapeCell = (value) => {
if (value === null || value === undefined) return "";

const text = String(value);
return NEEDS_QUOTING.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * Build a CSV string from an array of row objects.
 * Column order comes from the keys of the first row, so every row keeps the
 * same shape. An empty array still yields the header row when one is supplied.
 */
export const buildCsv = (rows, columns) => {
const keys = columns
? columns.map((c) => (typeof c === "string" ? c : c.key))
: rows.length
? Object.keys(rows[0])
: [];

const header = columns
? columns.map((c) => escapeCell(typeof c === "string" ? c : c.label))
: keys.map(escapeCell);

const body = rows.map((row) =>
keys.map((key) => escapeCell(row[key])).join(","),
);

return [header.join(","), ...body].join("\r\n");
};

/**
 * Trigger a browser download for the given text.
 *
 * The anchor has to be in the document for Firefox, and the object URL has to
 * outlive the click. Revoking it synchronously after a.click() cancels the
 * download outright in some browsers, which is a second way an export button
 * can appear dead.
 */
export const downloadFile = (content, filename, mimeType = "text/csv") => {
const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
const url = window.URL.createObjectURL(blob);

const anchor = document.createElement("a");
anchor.href = url;
anchor.download = filename;
anchor.style.display = "none";
document.body.appendChild(anchor);
anchor.click();
document.body.removeChild(anchor);

window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
};

/**
 * Export rows to CSV and report what happened, so the click is never silent.
 */
export const exportToCsv = ({ rows, columns, filename, emptyMessage }) => {
if (!rows.length) {
return { ok: false, message: emptyMessage || "Nothing to export yet." };
}

// A BOM keeps Excel on Windows from reading UTF-8 as Latin-1.
const BOM = "\uFEFF";
downloadFile(BOM + buildCsv(rows, columns), filename);

return {
ok: true,
message: `Exported ${rows.length} row${rows.length === 1 ? "" : "s"}.`,
};
};

/**
 * Build a filename with a date stamp, e.g. registrations-2026-10-02.csv
 */
export const stampedFilename = (base, extension = "csv") => {
const now = new Date();
const pad = (n) => String(n).padStart(2, "0");
const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
now.getDate(),
)}`;
return `${base}-${date}.${extension}`;
};
