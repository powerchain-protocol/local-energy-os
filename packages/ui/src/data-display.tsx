import type { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
  width?: string;
};

export function TableToolbar({ title, description, count, children }: { title: string; description?: string; count?: number; children?: ReactNode }) {
  return <div className="pc-table-toolbar" data-slot="table-toolbar">
    <div className="pc-table-toolbar-copy"><div><strong>{title}</strong>{typeof count === "number" ? <span>{count}</span> : null}</div>{description ? <p>{description}</p> : null}</div>
    {children ? <div className="pc-table-toolbar-actions">{children}</div> : null}
  </div>;
}

export function DataTable<T>({ columns, rows, rowKey, empty }: { columns: DataTableColumn<T>[]; rows: T[]; rowKey: (row: T) => string; empty?: ReactNode }) {
  if (!rows.length) return <>{empty ?? <div className="pc-table-empty">No records are available for this workspace.</div>}</>;
  return <div className="pc-table-wrap" data-slot="data-table">
    <table className="pc-data-table">
      <thead><tr>{columns.map((column) => <th key={column.key} style={column.width ? { width: column.width } : undefined} className={column.align === "right" ? "is-right" : undefined}>{column.header}</th>)}</tr></thead>
      <tbody>{rows.map((row) => <tr key={rowKey(row)}>{columns.map((column) => <td key={column.key} data-label={column.header} className={column.align === "right" ? "is-right" : undefined}>{column.cell(row)}</td>)}</tr>)}</tbody>
    </table>
  </div>;
}

export function DataValue({ value, meta }: { value: ReactNode; meta?: ReactNode }) {
  return <div className="pc-data-value" data-slot="data-value"><strong>{value}</strong>{meta ? <small>{meta}</small> : null}</div>;
}

export function FilterPill({ children, active = false }: { children: ReactNode; active?: boolean }) {
  return <span className={`pc-filter-pill ${active ? "is-active" : ""}`} data-slot="filter-pill">{children}</span>;
}
