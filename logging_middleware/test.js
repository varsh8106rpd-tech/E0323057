const { Log } = require("./src/logger");

async function test() {

    const result = await Log(
        "backend",
        "info",
        "middleware",
        "Logging middleware initialized successfully"
    );

    console.log(result);
}

test();