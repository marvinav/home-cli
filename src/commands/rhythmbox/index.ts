import { prompt } from "inquirer";
import { addCommand } from "../../utils/command";
import { Options } from "../../utils/command/types";
import { readFile, writeFile } from "fs/promises";
import { parseStringPromise } from "xml2js";
const { logger, command } = addCommand("rhythmbox");

type RhythmboxOptions = Options<{
  destination: string;
}>;

type RhythmboxEntry = {
  $: {
    type: "iradio" | string;
  };
  title: [string];
  genre: [string];
  artist: [string];
  album: [string];
  location: [string];
};

type RhythmboxDB = {
  rhythmdb: {
    $: { version: string };
    entry: RhythmboxEntry[];
  };
};
command
  .description("Parse rhythmbox radio stations to m3u format")
  .requiredOption("-d, --destination <path>", "Input path")
  .action(async (options: RhythmboxOptions) => {
    const rhythmboxDb = (await parseStringPromise(
      await readFile("/home/marvinav/.local/share/rhythmbox/rhythmdb.xml")
    )) as RhythmboxDB;
    const radioStreams = rhythmboxDb.rhythmdb.entry.filter(
      (x) => x.$.type === "iradio"
    );
    logger.log(`Found ${radioStreams.length} streams`);
    const result = ["#EXTM3U"];
    radioStreams.forEach((x, ind) => {
      result.push(entryToM3UEntry(x, ind + 1));
    });
    await writeFile(options.destination, result.join("\n\n"));
    return;
  });

function entryToM3UEntry(entry: RhythmboxEntry, count: number) {
  return `#EXTINF:-1, ${entry.title[0]}\n${entry.location[0]}`;
}
