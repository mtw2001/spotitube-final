import { nodeResolve } from "@rollup/plugin-node-resolve";
import copy from "rollup-plugin-copy";

module.exports = {
  input: "index.js",
  output: {
    dir: "dist",
  },
  plugins: [
    copy({
      targets: [{ src: "index.html", dest: "dist" }],
    }),
    nodeResolve(),
  ],
};