module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/tests/**/test.spec.ts'], // Match your test files
    collectCoverage: true,
    coverageDirectory: 'coverage',
    verbose: true,
    globals: {
        'ts-jest': {
           tsconfig: 'tsconfig.test.json', // Point to your test config
        },
    },
};
