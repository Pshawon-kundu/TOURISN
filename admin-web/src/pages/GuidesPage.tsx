import { Badge } from "../components/Badge";
import { DataTable } from "../components/DataTable";
import { GuideRow, guides } from "../data/mockData";

export function GuidesPage() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h3>Guides</h3>
        <p className="muted">Approve, feature, or pause guides</p>
      </div>
      <DataTable<GuideRow>
        columns={[
          { key: "name", label: "Name" },
          { key: "city", label: "City" },
          { key: "trips", label: "Trips" },
          { key: "rating", label: "Rating" },
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
        data={guides}
        searchableKeys={["name", "city", "status"]}
        renderActions={(row) => (
          <div className="table-actions">
            <button className="btn btn-primary">View</button>
            <button className="btn">Feature</button>
            <button className="btn btn-danger">Suspend</button>
          </div>
        )}
      />
    </div>
  );
}
