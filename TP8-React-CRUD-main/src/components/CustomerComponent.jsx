import { useMemo, useState } from "react";
import api from "../api/axiosConfig";
import CustomerList from "./CustomerList";

const CustomerComponent = ({ load, customers, loading }) => {
  // form state
  const [id, setId] = useState(""); // (sert juste à savoir si on est en mode edit)
  const [identityRef, setIdentityRef] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [username, setUsername] = useState("");

  // ui state
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState("id"); // id | firstname | lastname | identityRef | username
  const [sortDir, setSortDir] = useState("asc"); // asc | desc

  const isEditMode = Boolean(id);

  function resetForm() {
    setId("");
    setFirstname("");
    setLastname("");
    setIdentityRef("");
    setUsername("");
  }

  function showMsg(type, text) {
    setMsg({ type, text });
    // auto-hide
    setTimeout(() => setMsg({ type: "", text: "" }), 2500);
  }

  function validate() {
    if (!lastname.trim()) return "Lastname est obligatoire.";
    if (!firstname.trim()) return "Firstname est obligatoire.";
    if (!identityRef.trim()) return "Identity Ref est obligatoire.";
    if (!username.trim()) return "Username est obligatoire.";
    // optionnel: petite règle
    if (identityRef.trim().length > 20) return "Identity Ref trop long (max 20).";
    return "";
  }

  async function save(event) {
    event.preventDefault();

    const error = validate();
    if (error) {
      showMsg("danger", error);
      return;
    }

    try {
      setSaving(true);
      setMsg({ type: "", text: "" });

      if (isEditMode) {
        await api.put("/update/" + identityRef, {
          lastname: lastname.trim(),
          firstname: firstname.trim(),
          identityRef: identityRef.trim(),
          username: username.trim(),
        });
        showMsg("success", "Client mis à jour ✅");
      } else {
        await api.post("/create", {
          // IMPORTANT pour ton mock: id = identityRef (pour delete/update par identityRef)
          id: identityRef.trim(),
          firstname: firstname.trim(),
          lastname: lastname.trim(),
          identityRef: identityRef.trim(),
          username: username.trim(),
        });
        showMsg("success", "Client ajouté ✅");
      }

      resetForm();
      await load();
    } catch (e) {
      showMsg("danger", "Erreur réseau / backend. Vérifie :8080 et les endpoints.");
    } finally {
      setSaving(false);
    }
  }

  function editCustomer(customer) {
    setFirstname(customer.firstname ?? "");
    setLastname(customer.lastname ?? "");
    setIdentityRef(String(customer.identityRef ?? ""));
    setUsername(customer.username ?? "");
    setId(String(customer.id ?? "1"));
    showMsg("info", "Mode édition activé ✏️");
  }

  async function deleteCustomer(identityRefToDelete) {
    const ok = window.confirm(`Supprimer le client identityRef = ${identityRefToDelete} ?`);
    if (!ok) return;

    try {
      await api.delete("/delete/" + identityRefToDelete);
      showMsg("success", "Client supprimé ✅");
      await load();
    } catch (e) {
      showMsg("danger", "Suppression impossible. Vérifie backend / id.");
    }
  }

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();

    const filtered = (customers || []).filter((c) => {
      if (!q) return true;
      const blob = `${c.id} ${c.firstname} ${c.lastname} ${c.identityRef} ${c.username}`.toLowerCase();
      return blob.includes(q);
    });

    const sorted = [...filtered].sort((a, b) => {
      const va = String(a?.[sortKey] ?? "").toLowerCase();
      const vb = String(b?.[sortKey] ?? "").toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [customers, query, sortKey, sortDir]);

  return (
    <div className="row g-4">
      {/* Form */}
      <div className="col-12 col-lg-5">
        <div className="card app-card shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-start mb-2">
              <div>
                <h5 className="mb-0">{isEditMode ? "Edit customer" : "Add customer"}</h5>
                <small className="text-muted">
                  {isEditMode ? "Modifie puis sauvegarde." : "Remplis le formulaire puis sauvegarde."}
                </small>
              </div>

              {isEditMode && (
                <span className="badge text-bg-warning">EDIT MODE</span>
              )}
            </div>

            {msg.text && (
              <div className={`alert alert-${msg.type} py-2 small mb-3`} role="alert">
                {msg.text}
              </div>
            )}

            <form onSubmit={save}>
              <input hidden value={id} onChange={(e) => setId(e.target.value)} />

              <div className="mb-3">
                <label className="form-label">Lastname</label>
                <input
                  type="text"
                  className="form-control"
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                  placeholder="Ex: KRIR"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Firstname</label>
                <input
                  type="text"
                  className="form-control"
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                  placeholder="Ex: Anas"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Identity Ref</label>
                <input
                  type="text"
                  className="form-control"
                  value={identityRef}
                  onChange={(e) => setIdentityRef(e.target.value)}
                  placeholder="Ex: 1 / C001"
                  disabled={isEditMode} // important: si tu changes identityRef en edit, ça casse update/delete
                />
                {isEditMode && (
                  <small className="text-muted">
                    Identity Ref est verrouillé en édition.
                  </small>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ex: ESPARTA"
                />
              </div>

              <div className="d-flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? "Saving..." : "Save"}
                </button>

                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    resetForm();
                    showMsg("info", "Formulaire réinitialisé.");
                  }}
                  disabled={saving}
                >
                  Reset
                </button>

                {isEditMode && (
                  <button
                    className="btn btn-outline-dark ms-auto"
                    type="button"
                    onClick={() => {
                      resetForm();
                      showMsg("info", "Mode édition annulé.");
                    }}
                    disabled={saving}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="col-12 col-lg-7">
        <div className="card app-card shadow-sm">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
              <div>
                <h5 className="mb-0">Customers</h5>
                <small className="text-muted">
                  {loading ? "Loading..." : `${filteredSorted.length} item(s)`}
                </small>
              </div>

              <input
                className="form-control app-search"
                placeholder="Search (name, ref, username...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <CustomerList
              customers={filteredSorted}
              editCustomer={editCustomer}
              deleteCustomer={deleteCustomer}
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerComponent;
