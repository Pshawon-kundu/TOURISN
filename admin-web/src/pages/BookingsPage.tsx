import { Badge } from "../components/Badge";
import { DataTable } from "../components/DataTable";
import { BookingRow, bookings } from "../data/mockData";

export function BookingsPage() {
  return (
    <div className="grid" style={{ gap: 16 }}>
      <div className="card">
        <h3>Bookings</h3>
        <p className="muted">Review and manage all customer trips</p>
      </div>
      <DataTable<BookingRow>
        columns={[
          { key: "trip", label: "Trip" },
          { key: "traveler", label: "Traveler" },
          { key: "date", label: "Date" },
          { key: "amount", label: "Amount" },
          {
            key: "status",
            label: "Status",
            render: (row) => (
              <Badge
                label={row.status}
                tone={
                  row.status === "paid"
                    ? "success"
                    : row.status === "pending"
                    ? "warning"
                    : "danger"
                }
              />
            ),
          },
        ]}
        data={bookings}
        searchableKeys={["trip", "traveler", "status"]}
        renderActions={(row) => (
          <div className="table-actions">
            <button className="btn btn-primary">View</button>
            <button className="btn">Refund</button>
            <button className="btn btn-danger">Cancel</button>
          </div>
        )}
      />
    </div>
  );
}
