export default {
  parser: "typescript",
  overrides: [
    {
      files: ["*.css", "*.scss"],
      options: {
        parser: "css",
      },
    },
    {
      files: "*.json",
      options: {
        parser: "json",
      },
    },
    {
      files: ["*.md", "*.markdown"],
      options: {
        parser: "markdown",
      },
    },
    {
      files: ["*.js", "*.jsx"],
      options: {
        parser: "babel",
        semi: true,
        trailingComma: "es5",
      },
    },
    {
      files: ["*.ts", "*.tsx"],
      options: {
        parser: "typescript",
        semi: true,
        trailingComma: "es5",
      },
    },
  ],
  singleQuote: true,
  useTabs: false,
  printWidth: 90,
  tabWidth: 2,
  semi: true,
  htmlWhitespaceSensitivity: 'strict',
  arrowParens: 'avoid',
  bracketSpacing: true,
  proseWrap: 'preserve',
  trailingComma: 'all',
  endOfLine: 'lf',
  importOrder: ["^react$", "^next", "^@/(.*)$", "^[./]"],
  importOrderSeparation: false,
  importOrderSortSpecifiers: true,
  plugins: ["@trivago/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss", 'prettier-plugin-organize-imports'],
};


