# memory-leak-warning
A trick to detect memory leaks in Node.js apps.

To use this package for detecting memory leaks in Node.js apps, follow these steps:

## Installation
    ```
    npm install @naugtur/memory-leak-warning
    ```

## Usage
    ```javascript
    const { observe } = require("@naugtur/memory-leak-warning");
    ```

Call the `observe` function provided by the package to start observing memory usage and detecting memory leaks. You can customize the behavior by passing an options object with the following properties:
    - `logger` (optional): A custom logger function to output the memory leak warnings. By default, it uses the built-in `process._rawDebug` function to synchronously write to stderr.
    - `historyLength` (optional): The number of consecutive garbage collections (GCs) that have to report growth before it's considered a leak. Defaults to 5.
    - `roundToBytes` (optional): The number of bytes to round the memory usage to. Defaults to 1024 bytes (1 kilobyte).

Example usage:
```javascript
observe();

// or with custom options
observe({
    logger: console.warn,
    historyLength: 10,
    roundToBytes: 1024*1024, // only detect fast growing leaks
});
```

The package will start monitoring the memory usage and emit warnings when it detects growing heaps. The warnings will be logged using the provided logger function (or print to stderr if not specified).
