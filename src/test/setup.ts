import "@testing-library/jest-dom";

if (!process.env.NODE_ENV) {
  (process.env as Record<string, string | undefined>).NODE_ENV = "test";
}

if (process.env.TEST_LOGS !== "true") {
  console.debug = () => { };
  console.log = () => { };
  console.info = () => { };
  console.warn = () => { };
  console.error = () => { };
}
