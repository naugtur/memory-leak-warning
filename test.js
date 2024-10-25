const assert = require("node:assert");
const { observe } = require("./index");

const produceLeak = (done) => {
  function preventsOptimizingUnusedVariableAway(arg) {
    arg.i = 3;
    return { ...arg };
  }
  const leakyleaky = [];
  const t = setInterval(() => {
    const somethingToGarbageCollect = {
      someWeight:
        "This object will get garbage collected, so the more we create, the sooner GC runs, which means less waiting for the leak detection.",
      [Math.random().toFixed(5)]:
        "Let's make it a different object shape every time",
    };
    preventsOptimizingUnusedVariableAway(somethingToGarbageCollect);
    leakyleaky.push("hello, I'm leaking");
    leakyleaky.push({ yeah: "me too" });
  }, 0);
  setTimeout(() => {
    clearInterval(t);
    done();
  }, 10000);
};

let leakDetected = false;
observe({
  roundToBytes: 1,
  logger: (message) => {
    console.error(message);
    leakDetected = true;
  },
});

produceLeak(() => {
  assert(leakDetected, "Expected a leak to be detected");
});
