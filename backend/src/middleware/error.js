export function notFoundHandler(req, res) {
  return res.status(404).json({ message: "Not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // eslint-disable-next-line no-console
  console.error(err);

  // MySQL duplicate key (unique constraints for SKU / barcode / RFID / username / etc.)
  if (err?.code === "ER_DUP_ENTRY") {
    return res.status(400).json({ message: "Duplicate value detected (must be unique)." });
  }

  const status = err.statusCode || 500;
  const message = err.expose ? err.message : "Server error";
  return res.status(status).json({ message });
}
