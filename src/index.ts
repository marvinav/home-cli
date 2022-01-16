import { program } from "./utils/command";
import "./commands";

async function main() {
  await program.parseAsync(process.argv);
}

main();
