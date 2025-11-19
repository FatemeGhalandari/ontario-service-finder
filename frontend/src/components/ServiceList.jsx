export default function ServiceList({ services, onDelete, onEdit, onView }) {
  if (!services.length) {
    return <p>No services yet. Add one above.</p>;
  }

  return (
    <div style={styles.container}>
      <h2>Services</h2>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>ID</th>
            <th style={styles.th}>Name</th>
            <th style={styles.th}>Category</th>
            <th style={styles.th}>City</th>
            <th style={styles.th}>Phone</th>
            <th style={styles.th}>Website</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {services.map((s) => (
            <tr key={s.id}>
              <td style={styles.td}>{s.id}</td>
              <td style={styles.td}>{s.name}</td>
              <td style={styles.td}>{s.category || "-"}</td>
              <td style={styles.td}>{s.city}</td>
              <td style={styles.td}>{s.phone || "-"}</td>
              <td style={styles.td}>
                {s.website ? (
                  <a
                    href={normalizeUrl(s.website)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Link
                  </a>
                ) : (
                  "-"
                )}
              </td>
              <td style={styles.td}>
                <button
                  style={styles.smallButton}
                  onClick={() => onView && onView(s)}
                >
                  View
                </button>
                <button style={styles.smallButton} onClick={() => onEdit(s)}>
                  Edit
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => onDelete(s.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function normalizeUrl(url) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  return `https://${url}`;
}

const styles = {
  container: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: 16,
    backgroundColor: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    borderBottom: "1px solid #ccc",
    padding: 8,
    fontSize: 14,
  },
  td: {
    borderBottom: "1px solid #eee",
    padding: 8,
    fontSize: 14,
  },
  smallButton: {
    padding: "4px 8px",
    borderRadius: 4,
    border: "1px solid #007bff",
    backgroundColor: "#fff",
    color: "#007bff",
    cursor: "pointer",
    marginRight: 4,
  },
  deleteButton: {
    padding: "4px 8px",
    borderRadius: 4,
    border: "none",
    backgroundColor: "#dc3545",
    color: "#fff",
    cursor: "pointer",
  },
};
