function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.name === "MulterError" || err.message?.startsWith("Tipo de arquivo")) {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "SequelizeValidationError") {
    return res.status(422).json({
      error: "Erro de validação",
      details: err.errors?.map((e) => e.message),
    });
  }

  res.status(err.status || 500).json({
    error: err.message || "Erro interno do servidor",
  });
}

module.exports = errorHandler;
