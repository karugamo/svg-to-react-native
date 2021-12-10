#!/usr/bin/env node

const clipboardy = require("clipboardy");
const prompts = require("prompts");
const fs = require("fs");
const svgr = require("@svgr/core").default;
const { join } = require("path");
const createSpinner = require("ora");

if (require.main === module) {
  main();
}

async function main() {
  const clipboard = clipboardy.readSync();
  const isXML = clipboard.trim()[0] === "<";

  if (!isXML) {
    console.error("🙅‍ You need an SVG in the clipbord. 🙅");
    return;
  }
  const { componentName } = await prompts({
    type: "text",
    name: "componentName",
    message: "What should the component be called?",
  });

  await importSvg({
    svg: clipboard,
    componentName,
  });
}

exports.importSvg = importSvg;

async function importSvg({ svg, componentName }) {
  const svgSpinner = createSpinner("Importing SVG").start();
  const code = await svgr(
    svg,
    {
      native: true,
      template,
    },
    { componentName }
  );

  clipboardy.writeSync(code);

  svgSpinner.stop();
  console.log("📋 SVG copied to clipboard");
}

function template(
  { template },
  opts,
  { imports, componentName, props, jsx, exports }
) {
  return template.ast`${imports}
export default function ${componentName} (props) { return (${jsx}) }
`;
}
