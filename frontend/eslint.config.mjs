import ts from '@typescript-eslint/eslint-plugin';
import parser from '@typescript-eslint/parser';
import hooks from 'eslint-plugin-react-hooks';
import refresh from 'eslint-plugin-react-refresh';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';

// ESLint 8時点の実効ルールを維持し、新recommendedの追加ルールは別途判断する。
export default [
  { ignores: ['**/dist/**', '**/.*', '**/*.{js,cjs,mjs,jsx}'] },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.es2020 },
    },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
    plugins: {
      '@typescript-eslint': ts,
      'react-hooks': hooks,
      'react-refresh': refresh,
      storybook,
    },
    // 削除されたban-typesは、旧禁止型と修正候補をno-restricted-typesへ引き継ぐ。
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        {
          allowConstantExport: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'none',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-hooks/exhaustive-deps': 'off',
      'no-console': [
        'error',
        {
          allow: ['error'],
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',
      'no-array-constructor': 'off',
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-duplicate-enum-values': 'error',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      'no-loss-of-precision': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-unnecessary-type-constraint': 'error',
      '@typescript-eslint/no-unsafe-declaration-merging': 'error',
      'no-unused-vars': 'off',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/triple-slash-reference': 'error',
      'constructor-super': 'off',
      'getter-return': 'off',
      'no-const-assign': 'off',
      'no-dupe-args': 'off',
      'no-dupe-class-members': 'off',
      'no-dupe-keys': 'off',
      'no-func-assign': 'off',
      'no-import-assign': 'off',
      'no-new-symbol': 'off',
      'no-obj-calls': 'off',
      'no-redeclare': 'off',
      'no-setter-return': 'off',
      'no-this-before-super': 'off',
      'no-undef': 'off',
      'no-unreachable': 'off',
      'no-unsafe-negation': 'off',
      'no-var': 'error',
      'prefer-const': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',
      'for-direction': 'error',
      'no-async-promise-executor': 'error',
      'no-case-declarations': 'error',
      'no-class-assign': 'error',
      'no-compare-neg-zero': 'error',
      'no-cond-assign': 'error',
      'no-constant-condition': [
        'error',
        {
          checkLoops: 'all',
        },
      ],
      'no-control-regex': 'error',
      'no-debugger': 'error',
      'no-delete-var': 'error',
      'no-dupe-else-if': 'error',
      'no-duplicate-case': 'error',
      'no-empty': 'error',
      'no-empty-character-class': 'error',
      'no-empty-pattern': 'error',
      'no-ex-assign': 'error',
      'no-extra-boolean-cast': 'error',
      'no-extra-semi': 'error',
      'no-fallthrough': 'error',
      'no-global-assign': 'error',
      'no-inner-declarations': [
        'error',
        'functions',
        {
          blockScopedFunctions: 'disallow',
        },
      ],
      'no-invalid-regexp': 'error',
      'no-irregular-whitespace': 'error',
      'no-misleading-character-class': 'error',
      'no-mixed-spaces-and-tabs': 'error',
      'no-nonoctal-decimal-escape': 'error',
      'no-octal': 'error',
      'no-prototype-builtins': 'error',
      'no-regex-spaces': 'error',
      'no-self-assign': 'error',
      'no-shadow-restricted-names': [
        'error',
        {
          reportGlobalThis: false,
        },
      ],
      'no-sparse-arrays': 'error',
      'no-unexpected-multiline': 'error',
      'no-unsafe-finally': 'error',
      'no-unsafe-optional-chaining': 'error',
      'no-unused-labels': 'error',
      'no-useless-backreference': 'error',
      'no-useless-catch': 'error',
      'no-useless-escape': 'error',
      'no-with': 'error',
      'require-yield': 'error',
      'use-isnan': 'error',
      'valid-typeof': 'error',
      '@typescript-eslint/no-restricted-types': [
        'error',
        {
          types: {
            String: {
              message: 'Use string instead',
              fixWith: 'string',
            },
            Boolean: {
              message: 'Use boolean instead',
              fixWith: 'boolean',
            },
            Number: {
              message: 'Use number instead',
              fixWith: 'number',
            },
            Symbol: {
              message: 'Use symbol instead',
              fixWith: 'symbol',
            },
            BigInt: {
              message: 'Use bigint instead',
              fixWith: 'bigint',
            },
            Function: {
              message: 'The `Function` type accepts any function-like value.\nIt provides no type safety when calling the function, which can be a common source of bugs.\nIt also accepts things like class declarations, which will throw at runtime as they will not be called with `new`.\nIf you are expecting the function to accept certain arguments, you should explicitly define the function shape.',
            },
            Object: {
              message: 'The `Object` type actually means "any non-nullish value", so it is marginally better than `unknown`.\n- If you want a type meaning "any object", you probably want `object` instead.\n- If you want a type meaning "any value", you probably want `unknown` instead.\n- If you really want a type meaning "any non-nullish value", you probably want `NonNullable<unknown>` instead.',
              suggest: ['object', 'unknown', 'NonNullable<unknown>'],
            },
            '{}': {
              message: '`{}` actually means "any non-nullish value".\n- If you want a type meaning "any object", you probably want `object` instead.\n- If you want a type meaning "any value", you probably want `unknown` instead.\n- If you want a type meaning "empty object", you probably want `Record<string, never>` instead.\n- If you really want a type meaning "any non-nullish value", you probably want `NonNullable<unknown>` instead.',
              suggest: ['object', 'unknown', 'Record<string, never>', 'NonNullable<unknown>'],
            },
          },
        },
      ],
    },
  },
  {
    files: ['**/*.stories.{ts,tsx}', '**/*.story.{ts,tsx}'],
    // 共通のunused-vars設定（caughtErrors: none）を継承する。
    rules: {
      'react-hooks/rules-of-hooks': 'off',
      'import-x/no-anonymous-default-export': 'off',
      'storybook/await-interactions': 'error',
      'storybook/context-in-play-function': 'error',
      'storybook/default-exports': 'error',
      'storybook/hierarchy-separator': 'warn',
      'storybook/no-redundant-story-name': 'warn',
      'storybook/no-renderer-packages': 'error',
      'storybook/prefer-pascal-case': 'warn',
      'storybook/story-exports': 'error',
      'storybook/use-storybook-expect': 'error',
      'storybook/use-storybook-testing-library': 'error',
    },
  },
];
