const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
      specPattern: 'cypress/**/*.cy.{js,jsx,ts,tsx}',
      baseUrl: 'http://127.0.0.1:3000',
      supportFile: false

    
  },
});
