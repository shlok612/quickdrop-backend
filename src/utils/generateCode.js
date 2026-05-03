const crypto = require("crypto");

const generateCode = () => {
  return crypto.randomBytes(3).toString("hex").toUpperCase();
};

module.exports = generateCode;