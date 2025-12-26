import React from "react";

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  renderActions?: (row: T) => React.ReactNode;
  searchableKeys?: (keyof T)[];
}

export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  renderActions,
  searchableKeys,
}: DataTableProps<T>) {
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    if (!query.trim()) return data;
    const lower = query.toLowerCase();
    return data.filter((row) =>
      (searchableKeys || columns.map((c) => c.key)).some((key) =>
        String(row[key] ?? "")
          .toLowerCase()
          .includes(lower)
      )
    );
  }, [query, data, columns, searchableKeys]);

  return (
    <div>
      <div className="table-toolbar">
        <input
          className="table-search"
          placeholder="Search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div style={{ color: "var(--muted)", fontSize: 13 }}>
          {filtered.length} records
        </div>
      </div>
      <div className="card" style={{ padding: 0 }}>
        <table className="table">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)}>{col.label}</th>
              ))}
              {renderActions && <th style={{ width: 220 }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, idx) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={String(col.key)}>
                    {col.render ? col.render(row) : String(row[col.key])}
                  </td>
                ))}
                {renderActions && <td>{renderActions(row)}</td>}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="empty-state">No data matches your search.</div>
        )}
      </div>
    </div>
  );
}
