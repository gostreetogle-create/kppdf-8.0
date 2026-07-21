module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:4200/',
        'http://localhost:4200/materials',
        'http://localhost:4200/orders',
        'http://localhost:4200/products',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.85 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
