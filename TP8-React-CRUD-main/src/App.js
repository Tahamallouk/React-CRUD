import "bootstrap/dist/css/bootstrap.css";
import api from "./api/axiosConfig";
import { useEffect, useState } from "react";
import "./App.css";
import CustomerComponent from "./components/CustomerComponent";

function App() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, []);

  async function load() {
    try {
      setError("");
      setLoading(true);
      const result = await api.get("/all");
      setCustomers(result.data || []);
    } catch (e) {
      setError("Impossible de charger les clients. Vérifie que le backend tourne sur :8080.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-bg">
      <div className="container py-4">
        <div className="app-header mb-4">
          <div>
            <h1 className="app-title mb-1">Customer Manager</h1>
            <div className="app-subtitle">React CRUD • Axios • Bootstrap</div>
          </div>

          <button className="btn btn-outline-primary" onClick={load} disabled={loading}>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="alert alert-danger shadow-sm" role="alert">
            {error}
          </div>
        )}

        <CustomerComponent load={load} customers={customers} loading={loading} />
      </div>
    </div>
  );
}

export default App;
