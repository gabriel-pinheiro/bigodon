const fs = require("fs");
const Lab = require("@hapi/lab");
const Code = require("@hapi/code");

const { default: Bigodon } = require("../dist");

const { describe, it } = (exports.lab = Lab.script());
const { expect } = Code;

const SKIPPED_SPECS = [];

const SKIPPED_FEATURES = [].map((feature) => feature.toLowerCase());

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
          const data = Object.assign({}, test.data); // Shallow copy
          if (data.lambda) {
            /* eslint-disable-next-line no-eval */
            data.lambda = eval("(" + data.lambda.js + ")");
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
