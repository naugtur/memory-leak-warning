// @ts-check
"use strict";
const { PerformanceObserver } = require("perf_hooks");
const { getHeapSpaceStatistics } = require("node:v8");

const defaultLogger = process._rawDebug;

const saveHistory = (data, length, evaluate) => ({
  add(key, value) {
    if (!data[key]) {
      data[key] = [];
    }
    data[key].push(value);
    if (data[key].length > length) {
      data[key].shift();
      evaluate(key, data[key]);
    }
  },
});

module.exports = {
  observe: ({
    logger = defaultLogger,
    historyLength = 5,
    roundToBytes = 1024,
  } = {}) => {
    const data = {};

    const heapHistory = saveHistory(data, historyLength, (key, history) => {
      let prev = 0;
      let isGrowing = true;
      history.some((size) => {
        if (size <= prev) {
          isGrowing = false;
          prev = size;
          return true;
        }
        prev = size;
      });
      if (isGrowing) {
        logger(
          `Heap '${key}' was growing for ${historyLength} consecutive GCs, ${history}`
        );
      }
    });
    const obs = new PerformanceObserver((list) => {
      if (list.getEntries().length > 0) {
        const stats = getHeapSpaceStatistics();

        stats.forEach((stat) => {
          heapHistory.add(
            stat.space_name,
            Math.round(stat.space_used_size / roundToBytes)
          );
        });
      }
    });
    obs.observe({ entryTypes: ["gc"], buffered: false });
  },
};
