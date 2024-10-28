const CracoAlias = require("craco-alias");

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: "tsconfig", // Cấu hình dựa trên tsconfig
        baseUrl: "./src",   // Gốc của alias
        tsConfigPath: "./tsconfig.paths.json" // Đường dẫn tới cấu hình alias
      }
    }
  ]
};
