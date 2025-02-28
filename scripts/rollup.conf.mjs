// import babel from 'rollup-plugin-babel'
import terser from "@rollup/plugin-terser";

process.env.BABEL_ENV = "es5";

export default [
  {
    input: "src/index.js",
    output: [
      {
        file: "./dist/index.es.js",
        format: "es",
      },
      {
        file: "./dist/index.cjs",
        format: "cjs",
        exports: "named",
      },
    ],
    plugins: [],
  },
  {
    input: "src/index.js",
    output: [
      {
        file: "./dist/index.min.cjs",
        format: "cjs",
        exports: "named",
      },
      {
        file: "./dist/index.es.min.js",
        format: "es",
      },
    ],
    plugins: [terser()],
  },
];
