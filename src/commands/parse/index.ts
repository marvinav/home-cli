import { prompt } from "inquirer";
import { addCommand } from "../../utils/command";
import { Options } from "../../utils/command/types";
import { getDirectories } from "./getDirectories";

const { logger, command } = addCommand("parse");

type ParseOptions = Options<{
  input: string[];
  recursively: boolean;
  pattern: string[];
}>;

command
  .description("Parse files in input folder to outpat path")
  .option("-r, --recursively", "Should recursively parse files", false)
  .option("-d, --delete", "Delete origin files", false)
  .requiredOption("-i, --input <paths...>", "Input path")
  .requiredOption(
    "-p, --pattern <regex ...>",
    "Regex pattern, apply in order provided in options"
  )
  .action(async (options: ParseOptions) => {
    const paths = await getDirectories(options.input);
    if (paths.resolved.length < 1) {
      logger.fatal(`Provide at least one input`);
      return;
    }
    paths.unresolved.length > 0 &&
      logger.table({
        message: "Folders to skip",
        data: paths.unresolved,
        important: true,
        level: "error",
      });
    logger.table({
      message: "Folders to proccess",
      data: paths.resolved,
      important: true,
    });
    if (!options.yes) {
      const response = await prompt<{ continue: boolean }>([
        { name: "continue", message: "Do you want continue?", type: "confirm" },
      ]);
      if (!response.continue) {
        return;
      }
    }
  });
