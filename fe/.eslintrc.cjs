module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es2021: true,
    },
    ignorePatterns: ["dist", ".eslintrc.cjs", "vite.config.ts"],
    parser: '@typescript-eslint/parser',
    extends: [
        'airbnb',
        'airbnb/hooks',
        'plugin:@typescript-eslint/recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:prettier/recommended',
        'prettier',
    ],
    plugins: ["react-refresh", "prettier", "simple-import-sort"],
    // parserOptions: {
    //     ecmaVersion: 2020,
    //     ecmaVersion: 'latest',
    //     sourceType: 'module',
    //     ecmaFeatures: { jsx: true },
    // },
    // settings: {
    //     react: { version: 'detect' },
    // },
    rules: {
        "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
        "prettier/prettier": [
            "warn",
            {
                arrowParens: "always",
                bracketSameLine: false,
                bracketSpacing: true,
                embeddedLanguageFormatting: "auto",
                htmlWhitespaceSensitivity: "css",
                insertPragma: false,
                jsxSingleQuote: false,
                printWidth: 120,
                proseWrap: "preserve",
                quoteProps: "as-needed",
                requirePragma: false,
                semi: true,
                tabWidth: 2,
                useTabs: false,
                endOfLine: "auto",
            },
        ],
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error",
    },
    overrides: [
        {
            files: ["**/*.js", "**/*.ts", "**/*.tsx"],
            rules: {
                "simple-import-sort/imports": [
                    "error",
                    {
                        groups: [
                            // `react` first, `next` second, then packages starting with a character
                            ["^react$", "^next", "^[a-z]"],
                            // Packages starting with `@`
                            ["^@"],
                            // Packages starting with `~`
                            ["^~"],
                            // Imports starting with `../`
                            ["^\\.\\.(?!/?$)", "^\\.\\./?$"],
                            // Imports starting with `./`
                            ["^\\./(?=.*/)(?!/?$)", "^\\.(?!/?$)", "^\\./?$"],
                            // Style imports
                            ["^.+\\.s?css$"],
                            // Side effect imports
                            ["^\\u0000"],
                        ],
                    },
                ],
            },
        },
    ],

}
