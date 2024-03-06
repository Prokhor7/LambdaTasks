import * as fs from "fs";
import * as path from "path";

const dataFolder = path.join(__dirname, "2kk_words_400x400");
// const dataFolder = path.join(__dirname, "200k_words_100x100");

const readFiles = (): Map<string, number> => {
  const fileNames = fs.readdirSync(dataFolder);
  const phrases = new Map<string, number>();

  for (const fileName of fileNames) {
    const filePath = path.join(dataFolder, fileName);
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const uniquePhrases = new Set<string>();
    fileContent
      .split("\n")
      .map((line) => line.trim())
      .forEach((phrase) => {
        if (!uniquePhrases.has(phrase)) {
          phrases.set(phrase, (phrases.get(phrase)! || 0) + 1);
        } else if (!uniquePhrases.has(phrase)) {
          uniquePhrases.add(phrase);
        }
      });
  }

  return phrases;
};

const uniqueValues = (phrases: Map<string, number>): void => {
  console.log(`Unique phrases: ${phrases.size}`);
};

const existInAllFiles = (phrases: Map<string, number>): void => {
  let phrasesAppearedInAll20files = 0;

  phrases.forEach((value) => {
    if (value === 20) {
      phrasesAppearedInAll20files++;
    }
  });

  console.log(
    `Phrases present in all 20 files: ${phrasesAppearedInAll20files}`
  );
};

const existInAtLeastTen = (phrases: Map<string, number>): void => {
  let phrasesAppearedInAtLeast10files = 0;

  phrases.forEach((value) => {
    if (value >= 10) {
      phrasesAppearedInAtLeast10files++;
    }
  });

  console.log(
    `Phrases present in at least ten files: ${phrasesAppearedInAtLeast10files}`
  );
};

const main = () => {
  const phrases = readFiles();

  uniqueValues(phrases);
  existInAllFiles(phrases);
  existInAtLeastTen(phrases);
};

console.time("Execution time");
main();
console.timeEnd("Execution time");
