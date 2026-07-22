export function ComparisonTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead><tr>{head.map((h, i) => <th key={i} className="border-b border-border bg-surface2 px-4 py-3 text-left text-xs uppercase tracking-wide text-muted">{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className="border-b border-border px-4 py-3" dangerouslySetInnerHTML={{ __html: c }} />)}</tr>)}</tbody>
      </table>
    </div>
  );
}
