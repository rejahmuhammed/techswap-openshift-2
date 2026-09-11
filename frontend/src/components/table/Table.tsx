import React from 'react';

/**
 * Table component for displaying data in tabular format
 * Accepts columns config and rows data
 */
const Table = ({ columns, rows, className, ...props }) => {
  return (
    <div className="rounded-lg border overflow-x-auto ${className}">
      <div className="min-w-full">
        <table className="w-full rounded-md bg-card shadow-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.accessor} className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="bg-background transition-colors hover:bg-accent/20">
                {columns.map((col) => (
                  <td key={col.accessor} className="px-6 py-4 whitespace-no-wrap text-small text-muted-foreground">
                    {row[col.accessor] !== null && row[col.accessor] !== undefined ? row[col.accessor] : '—'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

Table.displayName = 'Table';

export default Table;
export { Table };