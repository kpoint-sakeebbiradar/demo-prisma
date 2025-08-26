/** @type {import('jest').Config} */
module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1", // allows path alias like @/lib/prisma
    },
    testMatch: ["**/__tests__/**/*.test.ts"],
};