#!/usr/bin/env node

const childProcess = require("child_process");
const os = require("os");

[
  // Make sure our native modules are androidX-happy
  { command: "jetify" },

  // on iOS, make sure our native modules are installed
  {
    command: "arch -x86_64 pod install --repo-update",
    cwd: "ios",
    onlyPlatforms: ["darwin"],
  },
]
  .filter(
    ({ onlyPlatforms }) =>
      !onlyPlatforms || onlyPlatforms.includes(os.platform())
  )
  .forEach((commandAndOptions) => {
    const { command, onlyPlatform: _, ...options } = commandAndOptions;
    try {
      childProcess.execSync(command, {
        stdio: "inherit",
        ...options,
      });
    } catch (error) {
      process.exit(error.status);
    }
  });
