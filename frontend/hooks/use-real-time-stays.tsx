import { useCallback, useEffect, useState } from "react";

export interface StayBooking {
  id: string;
  user_id: string | null;
  property_id: string;
  property_name: string;
  property_type: string;
  location: string;
  traveler_name: string;
  phone: string;
  email: string;
  notes: string | null;
  check_in_date: string;
  check_out_date: string;
  number_of_guests: number;
  number_of_nights: number;
  room_type: string | null;
  base_fare: number;
  taxes: number;
  service_fee: number;
  discount: number;
  total_amount: number;
  payment_method: string;
  card_last_four: string | null;
  status: string;
  amenities: string[];
  special_requests: string | null;
  created_at: string;
  updated_at: string;
}

export interface StayStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  totalRevenue: number;
  todayBookings: number;
  timestamp: string;
}

interface UseRealTimeStaysReturn {
  bookings: StayBooking[];
  stats: StayStats | null;
  loading: boolean;
  error: string | null;
  refreshData: () => void;
  isRealTimeConnected: boolean;
}

const API_BASE_URL = "http://localhost:5001/api";

export const useRealTimeStays = (
  enableRealTime: boolean = true
): UseRealTimeStaysReturn => {
  const [bookings, setBookings] = useState<StayBooking[]>([]);
  const [stats, setStats] = useState<StayStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const [lastTimestamp, setLastTimestamp] = useState<string>("");

  // Fetch initial data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch bookings
      const bookingsResponse = await fetch(
        `${API_BASE_URL}/stays?realtime=true`
      );
      const bookingsData = await bookingsResponse.json();

      if (bookingsData.success) {
        setBookings(bookingsData.data);
        setLastTimestamp(bookingsData.timestamp);
      }

      // Fetch stats
      const statsResponse = await fetch(`${API_BASE_URL}/stays/stats`);
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
      console.error("Error fetching stay data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh data manually
  const refreshData = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Real-time polling
  useEffect(() => {
    if (!enableRealTime) return;

    let pollInterval: NodeJS.Timeout;

    const pollForUpdates = async () => {
      try {
        // Fetch new bookings since last timestamp
        const response = await fetch(
          `${API_BASE_URL}/stays?realtime=true&since=${lastTimestamp}`
        );
        const data = await response.json();

        if (data.success && data.data.length > 0) {
          console.log(
            `📡 Real-time update: ${data.data.length} new stay bookings`
          );

          // Prepend new bookings to existing list
          setBookings((prev) => [...data.data, ...prev]);
          setLastTimestamp(data.timestamp);

          // Update stats
          const statsResponse = await fetch(`${API_BASE_URL}/stays/stats`);
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setStats(statsData.stats);
          }
        }

        setIsRealTimeConnected(true);
      } catch (err) {
        console.error("Real-time polling error:", err);
        setIsRealTimeConnected(false);
      }
    };

    // Start polling every 10 seconds
    pollInterval = setInterval(pollForUpdates, 10000);

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [enableRealTime, lastTimestamp]);

  // Server-Sent Events connection
  useEffect(() => {
    if (!enableRealTime) return;

    let eventSource: EventSource;

    const connectSSE = () => {
      eventSource = new EventSource(`${API_BASE_URL}/stays/stream`);

      eventSource.onopen = () => {
        console.log("📡 SSE connected to stay bookings stream");
        setIsRealTimeConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const update = JSON.parse(event.data);

          if (update.type === "new_bookings" && update.data.length > 0) {
            console.log(
              `📡 SSE: Received ${update.data.length} new stay bookings`
            );

            // Add new bookings to the top of the list
            setBookings((prev) => [...update.data, ...prev]);

            // Refresh stats
            fetch(`${API_BASE_URL}/stays/stats`)
              .then((res) => res.json())
              .then((data) => {
                if (data.success) {
                  setStats(data.stats);
                }
              })
              .catch(console.error);
          }
        } catch (err) {
          console.error("Error parsing SSE data:", err);
        }
      };

      eventSource.onerror = () => {
        console.log("📡 SSE connection error, will retry...");
        setIsRealTimeConnected(false);
        eventSource.close();

        // Retry connection after 5 seconds
        setTimeout(connectSSE, 5000);
      };
    };

    // Start SSE connection
    connectSSE();

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [enableRealTime]);

  // Initial data load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    bookings,
    stats,
    loading,
    error,
    refreshData,
    isRealTimeConnected,
  };
};
