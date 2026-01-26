import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      className="stat-card"
      style={{ position: "relative", overflow: "hidden" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "8px",
        }}
      >
        <div
          className="stat-label"
          style={{ fontSize: "14px", color: "#9CA3AF" }}
        >
          {label}
        </div>
        {icon && (
          <div
            style={{
              padding: "8px",
              borderRadius: "10px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#F3F4F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </div>
        )}
      </div>
      <div
        className="stat-value"
        style={{
          fontSize: "24px",
          fontWeight: "700",
          color: "#F9FAFB",
          marginBottom: "4px",
        }}
      >
        {value}
      </div>
      {trend && (
        <div
          className="stat-trend"
          style={{ fontSize: "13px", color: "#6B7280" }}
        >
          {trend}
        </div>
      )}
    </div>
  );
}
