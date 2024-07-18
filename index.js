const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");
const settings = require("./configs.json");

let ffmpegs = settings.ffmpeg.path.replace("$root$", __dirname);
ffmpeg.setFfmpegPath(ffmpegs + "/" + settings.ffmpeg.names.ffmpeg);
ffmpeg.setFfprobePath(ffmpegs + "/" + settings.ffmpeg.names.ffprob);

const args = process.argv.slice(2);
const exportExtention = args[0] || "ogg";
let args1 = args[1].replace(/\//g, "\\");
let args2 = args[2].replace(/\//g, "\\");
if (args1 == null || args2 == null) {
  return console.warn(
    "Invalid params. Run like this: convert 'ogg' 'importPath' 'exportPath'"
  );
}
let importPath = args1 + "\\";
let exportPath = args2 + "\\";

const validExtentions = [
  // Uncompressed Audio Formats
  "wav", // Waveform Audio File Format
  "aiff", // Audio Interchange File Format
  "aif", // Audio Interchange File Format

  // Lossy Compressed Audio Formats
  "mp3", // MPEG Audio Layer III
  "aac", // Advanced Audio Coding
  "m4a", // Advanced Audio Coding (container format)
  "ogg", // Ogg Vorbis
  "wma", // Windows Media Audio

  // Lossless Compressed Audio Formats
  "flac", // Free Lossless Audio Codec
  "alac", // Apple Lossless Audio Codec
  "ape", // Monkey's Audio

  // Other Formats
  "mid", // Musical Instrument Digital Interface
  "midi", // Musical Instrument Digital Interface
  "opus", // Opus
  "dsd", // Direct Stream Digital
  "pcm", // Pulse-Code Modulation
];

const main = fs.readdirSync(importPath);
let totalRead = main.length;
let totalExported = 0;
const ffmpegWork = (exportExtention, ePath, child) => {
  return new Promise((resolve, reject) => {
    ffmpeg(importPath + child)
      .toFormat(exportExtention)
      .on("end", () => {
        totalExported += 1;
        console.log(
          "'" +
            __dirname +
            "\\import\\" +
            child +
            "' -> '" +
            __dirname +
            "\\export\\" +
            child.split(".")[0] +
            "." +
            exportExtention +
            "' " +
            totalExported +
            "\\" +
            totalRead
        );
        resolve([true, "added"]);
      })
      .on("error", (err) => {
        console.error("Error: " + err.message);
        reject([false, err]);
      })
      .save(ePath.replace("undefined", ""));
  });
};

const checkIfExists = (array, toFindValue) => {
  let exists = false;
  array.forEach((value) => {
    if (value == toFindValue) exists = true;
  });

  return exists;
};

let i2 = 0;
const run = async () => {
  while (i2 < main.length) {
    const child = main[i2];
    i2 += 1;

    const data = fs.statSync(importPath + child);
    const ext = child.split(".")[1];
    const ePath = exportPath + child.replace("." + ext) + "." + exportExtention;
    if (data.isFile() && checkIfExists(validExtentions, ext) == true) {
      const r = await ffmpegWork(exportExtention, ePath, child);
      if (r[0] == false) {
        console.error(r[1]);
        process.abort();
      }
    }
  }
  console.log("ended: " + totalExported + "/" + totalRead);
};

run();
