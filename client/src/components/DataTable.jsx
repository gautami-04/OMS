import React, { useState } from "react";
import { Search } from "lucide-react";

export default function DataTable({
  columns = [],
  data = [],
  searchKey = "",
  placeholder = "Search table...",
  actions,
  emptyMessage = "No records found",
}) {
  const [query, setQuery] = useState("");

  const filteredData = data.filter((item) => {
    if (!query) return true;
    if (searchKey && item[searchKey]) {
      return String(item[searchKey]).toLowerCase().includes(query.toLowerCase());
    }
    return JSON.stringify(item).toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="table-card">
      <div className="table-toolbar">
        <div className="search-container" style={{ width: "240px" }}>
          <Search className="search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {actions && <div className="table-filter-group">{actions}</div>}
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, idx) => (
                <th key={col.key || idx} style={col.style}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ textAlign: "center", padding: "24px", color: "#6D746D" }}>
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIdx) => (
                <tr key={row._id || row.id || rowIdx}>
                  {columns.map((col, colIdx) => (
                    <td key={col.key || colIdx} style={col.style}>
                      {col.render ? col.render(row, rowIdx) : row[col.key] ?? "—"}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
