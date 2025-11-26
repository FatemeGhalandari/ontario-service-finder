import { useEffect, useState } from "react";
import { getAdminStats } from "../api/admin";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminStats({ visible }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!visible) return;

    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await getAdminStats();
        if (!cancelled) {
          setStats(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load admin stats");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Admin overview</h2>

      {loading && <p>Loading stats...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {stats && !loading && !error && (
        <>
          <p style={styles.summary}>
            Total services in directory: <strong>{stats.totalServices}</strong>
          </p>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>By category</h3>
            {stats.byCategory && stats.byCategory.length > 0 ? (
              <div style={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={stats.byCategory}
                    margin={{ top: 10, right: 20, left: 10, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      angle={-40}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#007bff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p>No category data available.</p>
            )}
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>By city</h3>
            {stats.byCity && stats.byCity.length > 0 ? (
              <ul style={styles.list}>
                {stats.byCity.map((row) => (
                  <li key={row.city}>
                    <strong>{row.city}</strong>: {row.count}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No city data available.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  card: {
    marginTop: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 8,
    border: "1px solid #ddd",
    backgroundColor: "#ffffff",
  },
  title: {
    marginTop: 0,
    marginBottom: 8,
  },
  error: {
    color: "red",
    marginBottom: 8,
  },
  summary: {
    marginBottom: 12,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 16,
  },
  chartContainer: {
    width: "100%",
    height: 280,
  },
  list: {
    margin: 0,
    paddingLeft: 20,
  },
};
