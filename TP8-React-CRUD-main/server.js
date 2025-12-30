const jsonServer = require("json-server");

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

// CORS pour React (localhost:3000)
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Helpers
function getAllCustomers() {
  return router.db.get("customers").value();
}

// ====== Endpoints EXACT du TP ======

// GET /api/rest/customer/all
server.get("/api/rest/customer/all", (req, res) => {
  res.json(getAllCustomers());
});

// POST /api/rest/customer/create
server.post("/api/rest/customer/create", (req, res) => {
  const { firstname, lastname, identityRef, username } = req.body;

  if (!identityRef) {
    return res.status(400).json({ message: "identityRef is required" });
  }

  const exists = router.db.get("customers").find({ identityRef }).value();
  if (exists) {
    return res.status(409).json({ message: "identityRef already exists" });
  }

  const newCustomer = {
    id: identityRef,        // IMPORTANT: id = identityRef
    firstname,
    lastname,
    identityRef,
    username,
  };

  router.db.get("customers").push(newCustomer).write();
  return res.status(201).json(newCustomer);
});

// PUT /api/rest/customer/update/:identityRef
server.put("/api/rest/customer/update/:identityRef", (req, res) => {
  const identityRef = req.params.identityRef;

  const existing = router.db.get("customers").find({ identityRef }).value();
  if (!existing) {
    return res.status(404).json({ message: "Customer not found" });
  }

  const updated = {
    ...existing,
    ...req.body,
    id: identityRef,
    identityRef,
  };

  router.db.get("customers").find({ identityRef }).assign(updated).write();
  return res.json(updated);
});

// DELETE /api/rest/customer/delete/:identityRef
server.delete("/api/rest/customer/delete/:identityRef", (req, res) => {
  const identityRef = req.params.identityRef;

  const existing = router.db.get("customers").find({ identityRef }).value();
  if (!existing) {
    return res.status(404).json({ message: "Customer not found" });
  }

  router.db.get("customers").remove({ identityRef }).write();
  return res.sendStatus(204);
});

// (optionnel) route json-server brute
server.use(router);

server.listen(8080, () => {
  console.log("Mock backend running on http://localhost:8080");
});
