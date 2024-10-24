module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.spec.ts'], // Match your test files
    collectCoverage: true,
    coverageDirectory: 'coverage',
    verbose: true,
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
};
