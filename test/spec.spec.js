const fs = require("fs");
const Lab = require("@hapi/lab");
const Code = require("@hapi/code");

const { default: Bigodon } = require("../dist");

const { describe, it } = (exports.lab = Lab.script());
const { expect } = Code;

const SKIPPED_SPECS = [
  "partials.json",
  "~dynamic-names.json",
  "delimiters.json",
  "~inheritance.json",
  "~lambdas.json",
];

// Bigodon does not auto-walk the context stack on missing keys (deliberate
// Handlebars-style strict scoping; users opt in via $parent/$root). The
// spec tests below assert Mustache's auto-walk behavior.
const SKIPPED_FEATURES = [
  "Parent contexts",
  "List Contexts",
  "Deeply Nested Contexts",
  "Variable test",
  "HTML Escaping", // Bigodon does not auto-escape HTML by default;
].map((feature) => feature.toLowerCase());

describe("spec", () => {
  // NOP Under non-node environments
  if (typeof process === "undefined") {
    return;
  }

  const specDir = __dirname + "/mustache/specs/";
  const specs = fs
    .readdirSync(specDir)
    .filter((name) => /.*\.json$/.test(name));

  specs.forEach((name) => {
    const spec = require(specDir + name);
    if (SKIPPED_SPECS.some((spec) => name.includes(spec))) {
      describe.skip(name, () => {});
      return;
    }
    describe(name, () => {
      spec.tests.forEach((test) => {
        if (
          SKIPPED_FEATURES.some((feature) =>
            test.name.toLowerCase().includes(feature),
          )
        ) {
          it.skip(test.name, () => {});
          return;
        }

        it(test.name, async () => {
          let data;
          if (Array.isArray(test.data)) {
            data = test.data.slice();
          } else if (test.data && typeof test.data === "object") {
            data = Object.assign({}, test.data);
            if (data.lambda) {
              /* eslint-disable-next-line no-eval */
              data.lambda = eval("(" + data.lambda.js + ")");
            }
          } else {
            data = test.data;
          }

          const bigodon = new Bigodon();

          const template = bigodon.compile(test.template);
          const result = await template(data);

          expect(result, test.desc).to.equal(test.expected);
        });
      });
    });
  });
});
