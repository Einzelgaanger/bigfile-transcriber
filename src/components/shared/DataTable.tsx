import type { KeyboardEvent, ReactNode } from 'react';

export default function DataTable({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: { id: string; cells: ReactNode[]; onClick?: () => void }[];
  empty: ReactNode;
}) {
  if (!rows.length) return <div className="p-4 pt-0">{empty}</div>;

  const activate = (row: (typeof rows)[number], e: KeyboardEvent<HTMLDivElement>) => {
    if (!row.onClick) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      row.onClick();
    }
  };

  return (
    <>
      <div className="hidden md:block table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} onClick={row.onClick}>
                {row.cells.map((cell, i) => (
                  <td key={i}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="md:hidden divide-y divide-[#0E1F1A]/10">
        {rows.map((row) => (
          <div
            key={row.id}
            className="w-full text-left p-3.5 hover:bg-[#f7faf6]"
            role={row.onClick ? 'button' : undefined}
            tabIndex={row.onClick ? 0 : undefined}
            onClick={row.onClick}
            onKeyDown={(e) => activate(row, e)}
          >
            <div className="flex items-start justify-between gap-2 min-w-0">
              <div className="min-w-0 font-semibold text-sm text-[#0E1F1A]">{row.cells[0]}</div>
              {row.cells[3] ? <div className="shrink-0">{row.cells[3]}</div> : null}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {row.cells.slice(1, 3).map((cell, i) => (
                <div key={i} className="detail-cell min-w-0">
                  <span className="detail-cell__label">{headers[i + 1]}</span>
                  <span className="detail-cell__value break-anywhere">{cell}</span>
                </div>
              ))}
            </div>
            {row.cells[4] ? (
              <div className="mt-2" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                {row.cells[4]}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}
