import { useEffect, useState } from "react";
import ServiceForm from "./components/ServiceForm";
import ServiceList from "./components/ServiceList";
import ServiceDetails from "./components/ServiceDetails";

import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "./api/services";

const CATEGORY_OPTIONS = [
  "Health",
  "Mental Health",
  "Housing",
  "Shelter",
  "Food Bank",
  "Education",
  "Child Care",
  "Seniors",
  "Employment",
  "Legal",
  "Recreation",
  "Library",
  "Community Centre",
];

function App() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

  async function loadServices(overrides = {}) {
    const params = {
      q: overrides.q !== undefined ? overrides.q : searchTerm,
      city: overrides.city !== undefined ? overrides.city : cityFilter,
      category:
        overrides.category !== undefined ? overrides.category : categoryFilter,
      page: overrides.page !== undefined ? overrides.page : page,
      pageSize:
        overrides.pageSize !== undefined ? overrides.pageSize : pageSize,
    };

    try {
      setLoading(true);
      setError("");
      const result = await getServices(params);
      setServices(result.data);
      setTotal(result.total);
      setPage(params.page);
    } catch (err) {
      console.error(err);
      setError("Failed to load services");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(formData) {
    if (editingService) {
      await updateService(editingService.id, formData);
      setEditingService(null);
    } else {
      await createService(formData);
    }
    // after save, reload from page 1 with current filters
    await loadServices({ page: 1 });
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this service?")) return;
    try {
      await deleteService(id);
      await loadServices();
    } catch (err) {
      alert(err.message || "Failed to delete service");
    }
  }

  async function handleSearch(e) {
    e.preventDefault();
    await loadServices({ page: 1 });
  }

  async function handleClearFilters() {
    setSearchTerm("");
    setCityFilter("");
    setCategoryFilter("");
    await loadServices({ q: "", city: "", category: "", page: 1 });
  }

  return (
    <div style={styles.app}>
      <h1>Ontario Service & Facility Finder</h1>

      {error && <p style={styles.error}>{error}</p>}

      <ServiceForm
        mode={editingService ? "edit" : "create"}
        initialValues={editingService}
        onSave={handleSave}
        onCancel={() => setEditingService(null)}
      />

      <form onSubmit={handleSearch} style={styles.filterBar}>
        <div style={styles.filterField}>
          <label style={styles.filterLabel}>Search</label>
          <input
            style={styles.filterInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Name, address, category..."
          />
        </div>

        <div style={styles.filterField}>
          <label style={styles.filterLabel}>City</label>
          <input
            style={styles.filterInput}
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="e.g. Toronto"
          />
        </div>

        <div style={styles.filterField}>
          <label style={styles.filterLabel}>Category</label>
          <select
            style={styles.filterInput}
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterButtons}>
          <button type="submit" style={styles.filterButtonPrimary}>
            Apply
          </button>
          <button
            type="button"
            style={styles.filterButtonSecondary}
            onClick={handleClearFilters}
          >
            Clear
          </button>
        </div>
      </form>

      {loading ? (
        <p>Loading services...</p>
      ) : (
        <>
          {total > 0 && (
            <div style={styles.paginationBar}>
              <button
                type="button"
                style={styles.paginationButton}
                disabled={page <= 1}
                onClick={() => loadServices({ page: page - 1 })}
              >
                Previous
              </button>

              <span style={styles.paginationInfo}>
                Page {page} of {totalPages}{" "}
                {total > 0 && (
                  <>
                    {" "}
                    (showing {(page - 1) * pageSize + 1} to{" "}
                    {Math.min(page * pageSize, total)} of {total})
                  </>
                )}
              </span>

              <button
                type="button"
                style={styles.paginationButton}
                disabled={page >= totalPages}
                onClick={() => loadServices({ page: page + 1 })}
              >
                Next
              </button>
            </div>
          )}

          <ServiceList
            services={services}
            onDelete={handleDelete}
            onEdit={(service) => {
              setEditingService(service);
              setSelectedService(null);
            }}
            onView={(service) => setSelectedService(service)}
          />

          {selectedService && (
            <ServiceDetails
              service={selectedService}
              onClose={() => setSelectedService(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  app: {
    maxWidth: 1000,
    margin: "0 auto",
    padding: 24,
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backgroundColor: "#f5f5f5",
    color: "#222",
    minHeight: "100vh",
  },
  error: {
    color: "red",
    marginBottom: 12,
  },
  filterBar: {
    display: "flex",
    alignItems: "flex-end",
    gap: 16,
    marginBottom: 24,
    padding: 12,
    borderRadius: 8,
    border: "1px solid #ddd",
    backgroundColor: "#f9f9f9",
    flexWrap: "wrap",
  },
  filterField: {
    display: "flex",
    flexDirection: "column",
    minWidth: 200,
  },
  filterLabel: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  filterInput: {
    padding: 8,
    borderRadius: 4,
    border: "1px solid #ccc",
  },
  filterButtons: {
    display: "flex",
    gap: 8,
  },
  filterButtonPrimary: {
    padding: "8px 16px",
    borderRadius: 4,
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
  filterButtonSecondary: {
    padding: "8px 16px",
    borderRadius: 4,
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    color: "#333",
    cursor: "pointer",
  },
  paginationBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 8,
  },
  paginationButton: {
    padding: "6px 12px",
    borderRadius: 4,
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
    minWidth: 80,
  },
  paginationInfo: {
    fontSize: 14,
  },
};

export default App;
