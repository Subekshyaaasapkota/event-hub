const logger = (req, res, next) => {
  const startedAt = Date.now();

  res.on("finish", () => {
  // Health checks would otherwise flood the terminal
  if (req.originalUrl === "/api/health") return;

  console.log(
  `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt}ms)`,
  );
  });

  next();
};

export default logger;