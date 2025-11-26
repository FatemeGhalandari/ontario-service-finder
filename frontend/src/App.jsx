import { useEffect, useState } from "react";
import ServiceForm from "./components/ServiceForm";
import ServiceList from "./components/ServiceList";
import ServiceDetails from "./components/ServiceDetails";
import AdminStats from "./components/AdminStats";

import {
  API_BASE_URL,
  buildServicesQueryString,
  getServices,
  createService,
  updateService,
  deleteService,
  setAuthToken,
} from "./api/services";

import { login as apiLogin } from "./api/auth";
import ServiceMap from "./components/ServiceMap";

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
  "Settlement",
];

function App() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");

  const [editingService, setEditingService] = useState(null);
  const [selectedService, setSelectedService] = useState(null);

  const [viewMode, setViewMode] = useState("list"); // 'list' or 'map'

  const [viewFavoritesOnly, setViewFavoritesOnly] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const totalPages = total > 0 ? Math.ceil(total / pageSize) : 1;

  const [authTokenState, setAuthTokenState] = useState(null);
  const isAdmin = !!authTokenState;

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  const [favoriteIds, setFavoriteIds] = useState(() => {
    const favRaw = localStorage.getItem("favoriteServiceIds");
    if (!favRaw) return [];
    try {
      const parsed = JSON.parse(favRaw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const visibleServices = viewFavoritesOnly
    ? services.filter((s) => favoriteIds.includes(s.id))
    : services;

  const exportQuery = buildServicesQueryString({
    q: searchTerm,
    city: cityFilter,
    category: categoryFilter,
    sortBy,
    sortDirection,
  });

  const exportUrl = exportQuery
    ? `${API_BASE_URL}/services/export?${exportQuery}`
    : `${API_BASE_URL}/services/export`;

  // Load services with current filters/pagination, optionally overriding some
  async function loadServices(overrides = {}) {
    const params = {
      q: overrides.q !== undefined ? overrides.q : searchTerm,
      city: overrides.city !== undefined ? overrides.city : cityFilter,
      category:
        overrides.category !== undefined ? overrides.category : categoryFilter,
      sortBy: overrides.sortBy !== undefined ? overrides.sortBy : sortBy,
      sortDirection:
        overrides.sortDirection !== undefined
          ? overrides.sortDirection
          : sortDirection,
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

  // On first render: restore token (if any) and load initial services
  useEffect(() => {
    const stored = localStorage.getItem("authToken");
    if (stored) {
      setAuthTokenState(stored);
      setAuthToken(stored);
    }

    // Initial load with no filters, page 1
    loadServices({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    localStorage.setItem("favoriteServiceIds", JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  function handleToggleFavorite(id) {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSave(formData) {
    if (editingService) {
      await updateService(editingService.id, formData);
      setEditingService(null);
    } else {
      await createService(formData);
    }
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
    setSortBy("createdAt");
    setSortDirection("desc");
    setViewFavoritesOnly(false);
    await loadServices({
      q: "",
      city: "",
      category: "",
      sortBy: "createdAt",
      sortDirection: "desc",
      page: 1,
    });
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");

    try {
      const result = await apiLogin(loginEmail.trim(), loginPassword);
      setAuthTokenState(result.token);
      setAuthToken(result.token);
      localStorage.setItem("authToken", result.token);
      setLoginPassword("");
    } catch (err) {
      setLoginError(err.message || "Login failed");
    }
  }

  function handleLogout() {
    setAuthTokenState(null);
    setAuthToken(null);
    localStorage.removeItem("authToken");
    setEditingService(null);
  }

  return (
    <div style={styles.app}>
      <h1>Ontario Service & Facility Finder</h1>

      <div style={styles.authPanel}>
        {isAdmin ? (
          <>
            <span>Logged in as admin</span>
            <button
              type="button"
              style={styles.filterButtonSecondary}
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <form onSubmit={handleLogin} style={styles.authForm}>
              <div style={styles.authField}>
                <label style={styles.filterLabel}>Admin email</label>
                <input
                  style={styles.filterInput}
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="admin@example.com"
                />
              </div>
              <div style={styles.authField}>
                <label style={styles.filterLabel}>Password</label>
                <input
                  style={styles.filterInput}
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <button type="submit" style={styles.filterButtonPrimary}>
                Admin login
              </button>
            </form>
            {loginError && <p style={styles.error}>{loginError}</p>}
          </>
        )}
      </div>

      {error && <p style={styles.error}>{error}</p>}
      
      {isAdmin && <AdminStats visible={isAdmin} />}

      {isAdmin ? (
        <ServiceForm
          mode={editingService ? "edit" : "create"}
          initialValues={editingService}
          onSave={handleSave}
          onCancel={() => setEditingService(null)}
        />
      ) : (
        <p style={styles.info}>Admin login required to add or edit services.</p>
      )}

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

        <div style={styles.filterField}>
          <label style={styles.filterLabel}>Sort by</label>
          <select
            style={styles.filterInput}
            value={`${sortBy}:${sortDirection}`}
            onChange={(e) => {
              const [sb, sd] = e.target.value.split(":");
              setSortBy(sb);
              setSortDirection(sd);
              // If you want immediate reload on sort change:
              loadServices({ sortBy: sb, sortDirection: sd, page: 1 });
            }}
          >
            <option value="createdAt:desc">Newest first</option>
            <option value="createdAt:asc">Oldest first</option>
            <option value="name:asc">Name A–Z</option>
            <option value="name:desc">Name Z–A</option>
            <option value="city:asc">City A–Z</option>
            <option value="city:desc">City Z–A</option>
            <option value="category:asc">Category A–Z</option>
            <option value="category:desc">Category Z–A</option>
          </select>
        </div>

        <div style={styles.filterField}>
          <label style={styles.filterLabel}>Favorites</label>
          <label style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="checkbox"
              checked={viewFavoritesOnly}
              onChange={(e) => setViewFavoritesOnly(e.target.checked)}
            />
            <span>Show favorites only</span>
          </label>
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
          <a
            href={exportUrl}
            style={styles.filterButtonSecondary}
            download="services.csv"
          >
            Export CSV
          </a>
        </div>
      </form>

      {loading ? (
        <p>Loading services...</p>
      ) : (
        <>
          <div style={styles.viewToggle}>
            <span>View:</span>
            <button
              type="button"
              style={
                viewMode === "list"
                  ? styles.viewToggleButtonActive
                  : styles.viewToggleButton
              }
              onClick={() => setViewMode("list")}
            >
              List
            </button>
            <button
              type="button"
              style={
                viewMode === "map"
                  ? styles.viewToggleButtonActive
                  : styles.viewToggleButton
              }
              onClick={() => setViewMode("map")}
            >
              Map
            </button>
          </div>

          {viewMode === "list" && total > 0 && (
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

          {viewMode === "list" ? (
            <>
              <ServiceList
                services={visibleServices}
                onDelete={isAdmin ? handleDelete : undefined}
                onEdit={
                  isAdmin
                    ? (service) => {
                        setEditingService(service);
                        setSelectedService(null);
                      }
                    : undefined
                }
                onView={(service) => setSelectedService(service)}
                isAdmin={isAdmin}
                favoriteIds={favoriteIds}
                onToggleFavorite={handleToggleFavorite}
              />

              {selectedService && (
                <ServiceDetails
                  service={selectedService}
                  onClose={() => setSelectedService(null)}
                  isFavorite={favoriteIds.includes(selectedService.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
            </>
          ) : (
            <>
              <ServiceMap
                services={visibleServices}
                onSelect={(service) => setSelectedService(service)}
              />
              {selectedService && (
                <ServiceDetails
                  service={selectedService}
                  onClose={() => setSelectedService(null)}
                  isFavorite={favoriteIds.includes(selectedService.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
            </>
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
  info: {
    marginBottom: 16,
    fontStyle: "italic",
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
  authPanel: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  authForm: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "flex-end",
  },
  authField: {
    display: "flex",
    flexDirection: "column",
    minWidth: 200,
  },
  viewToggle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  viewToggleButton: {
    padding: "6px 12px",
    borderRadius: 4,
    border: "1px solid #ccc",
    backgroundColor: "#fff",
    cursor: "pointer",
  },
  viewToggleButtonActive: {
    padding: "6px 12px",
    borderRadius: 4,
    border: "1px solid #007bff",
    backgroundColor: "#007bff",
    color: "#fff",
    cursor: "pointer",
  },
};

export default App;
