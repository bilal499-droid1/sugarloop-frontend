import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

/**
 * Mirrors the backend's config where it can, and diverges only where a browser React
 * codebase genuinely differs from a Node one.
 *
 * The rules that earn their place here are the two react-hooks ones. Everything else on
 * this list a careful reader catches; a dependency array missing the one value that
 * actually changed produces a component that renders stale data intermittently, on
 * somebody else's machine, and looks like a caching bug for a day and a half.
 */
export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.browser,
      },
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,

      /**
       * Without this, `no-unused-vars` cannot see a component referenced only from JSX
       * and reports every imported component in the codebase as unused — 180 false
       * positives that would train everyone to ignore the linter on day one.
       */
      'react/jsx-uses-vars': 'error',

      /**
       * Off deliberately. This rule is from the React Compiler era and objects to
       * `setLoading(true)` inside the effect that starts a fetch — the pattern every
       * data-fetching screen here uses, and the one React's own docs used until
       * recently. Turning it on means rewriting every page in the app to satisfy a
       * performance opinion, not fixing a bug; the cascading render it warns about is one
       * extra render on mount.
       *
       * Worth revisiting if this codebase ever adopts the compiler, where it stops being
       * an opinion.
       */
      'react-hooks/set-state-in-effect': 'off',

      // Same reasoning as the backend: `^_` for deliberately unused, and
      // ignoreRestSiblings for `const { [field]: _cleared, ...rest } = obj`, which this
      // codebase uses to drop one key — the named binding exists to be left out.
      'no-unused-vars': [
        'error',
        { args: 'after-used', argsIgnorePattern: '^_', ignoreRestSiblings: true },
      ],

      // A warning rather than an error: it protects fast refresh during development and
      // says nothing about whether the build is correct.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    files: ['**/*.test.{js,jsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
]
