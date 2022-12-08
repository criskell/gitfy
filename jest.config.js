/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.(ts|js)"],
  setupFilesAfterEnv: ["<rootDir>/__tests__/__support__/setup.ts"],
};
