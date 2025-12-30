import React from "react";

const SortIcon = ({ active, dir }) => {
  if (!active) return <span className="ms-1 text-muted">↕</span>;
  return <span className="ms-1">{dir === "asc" ? "↑" : "↓"}</span>;
};

const Th = ({ label, colKey, sortKey, sortDir, onSort }) => (
  <th
    className="th-sort"
    role="button"
    onClick={() => onSort(colKey)}
    title="Click to sort"
  >
    {label}
    <SortIcon active={sortKey === colKey} dir={sortDir} />
  </th>
);

const CustomerList = ({
  customers,
  editCustomer,
  deleteCustomer,
  sortKey,
  sortDir,
  onSort,
  loading,
}) => {
  if (loading) {
    return (
      <div className="py-5 text-center text-muted">
        <div className="spinner-border" role="status" />
        <div className="mt-2">Loading customers...</div>
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="py-5 text-center text-muted">
        <div className="display-6">🗂️</div>
        <div className="mt-2">Aucun client trouvé.</div>
        <small>Ajoute un client depuis le formulaire.</small>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle mb-0">
        <thead className="table-light">
          <tr>
            <Th label="Nº" colKey="id" sortKey={sortKey} sortDir={sortDir} onSort={onSort} />
            <Th
              label="Firstname"
              colKey="firstname"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
            <Th
              label="Lastname"
              colKey="lastname"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
            <Th
              label="Identity Ref"
              colKey="identityRef"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
            <Th
              label="Username"
              colKey="username"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={onSort}
            />
            <th>Option</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => (
            <tr key={customer.identityRef ?? customer.id}>
              <td className="fw-semibold">{customer.id}</td>
              <td>{customer.firstname}</td>
              <td className="text-uppercase">{customer.lastname}</td>
              <td>
                <span className="badge text-bg-secondary">{customer.identityRef}</span>
              </td>
              <td>
                <span className="badge text-bg-dark">{customer.username}</span>
              </td>
              <td>
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-warning btn-sm"
                    onClick={() => editCustomer(customer)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={() => deleteCustomer(customer.identityRef)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;
