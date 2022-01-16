import { Command } from "commander";
import { Logger } from "../logger";
import { DefaultOptions } from "./types";
import inquirer from "inquirer";

const program = new Command();

const addCommand = (name: string) => {
  const newCommand = new Command(name);
  newCommand.copyInheritedSettings(program);
  newCommand
    .option("-v, --verbose", "Output additional information")
    .option("-y, --yes", "Don`t ask verification", false)
    .hook("preAction", (option) => {
      Logger.verbose = option.opts<DefaultOptions>().verbose ?? false;
    });

  program.addCommand(newCommand);

  const logger = new Logger(name);

  return {
    command: newCommand,
    logger,
  };
};

export { program, addCommand };
