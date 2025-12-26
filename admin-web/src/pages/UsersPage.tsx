import React from "react";
import { Badge } from "../components/Badge";
import { DataTable } from "../components/DataTable";
import { UserRow, users } from "../data/mockData";

export function UsersPage() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h3>Users</h3>
        <p className="muted">Manage travelers and guides</p>
      </div>
      <DataTable<UserRow>
        columns={[
          { key: "name", label: "Name" },
          { key: "email", label: "Email" },
          { key: "role", label: "Role" },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <Badge
                label={row.status}
                tone={
                  row.status === "active"
                    ? "success"
                    : row.status === "pending"
                    ? "warning"
                    : "danger"
                }
              />
            ),
          },
        ]}
        data={users}
        renderActions={(row) => (
          <div className="table-actions">
            <button className="btn btn-primary">View</button>
            <button className="btn">Message</button>
            <button className="btn btn-danger">Block</button>
          </div>
        )}
      />
    </div>
  );
}
