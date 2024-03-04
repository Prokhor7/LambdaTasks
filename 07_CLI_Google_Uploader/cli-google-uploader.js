import inquirer from "inquirer";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { uploadFile } from "./utils/upload-util.js";
import { makeTinyLink } from "./utils/tinyurl-util.js";

dotenv.config();

const main = async () => {
  let file;

  await inquirer
    .prompt({
      message:
        "Enter the path to your image file (or just drag and drop it) and press Enter to upload: ",
      type: "input",
      name: "filePath",
      filter: (input) => input.trim().replace(/^['"]+|['"]+$/g, ""),
      validate: (filePath) =>
        fs.existsSync(filePath) ||
        "File does not exist. Please enter a valid file path.",
    })
    .then(({ filePath }) => {
      file = filePath;
    });

  console.log(`Path to file: ${file}`);
  console.log(`Filename: ${path.basename(file)}`);
  console.log(`File extention ${path.extname(file).slice(1)}`);

  let renamed = false;

  await inquirer
    .prompt({
      type: "confirm",
      name: "isChanged",
      message: `You're uploading the file with the name: ${path.basename(file)}\nWould you like to change it?`,
    })
    .then(({ isChanged }) => {
      if (isChanged) {
        renamed = true;
      }
    });

  let link;

  if (renamed) {
    await inquirer
      .prompt({
        message:
          "Enter new filename (WITHOUT extentions aka .jpg, .png, etc.):",
        type: "input",
        name: "newFilename",
        validate: (filename) => {
          if (filename && !filename.includes(".")) {
            return true;
          }

          return "Please enter search new file (WITHOUT extentions aka .jpg, .png, etc.)";
        },
      })
      .then(async ({ newFilename }) => {
        link = await uploadFile({ filePath: file, newName: newFilename + path.extname(file) });
      });
  } else {
    link = await uploadFile({ filePath: file });
  }

  console.log("Successfully uploaded!");

  let wasShorted = false;

  await inquirer
    .prompt({
      type: "confirm",
      name: "isShorted",
      message: "Woud you like to shorten your link?",
    })
    .then(async ({ isShorted }) => {
      if (isShorted) {
        link = await makeTinyLink(link);
        wasShorted = true;
      }
    });

  if (wasShorted) {
    console.log(`Your short link is: ${link}`);
  } else {
    console.log(`Your link: ${link}`);
  }
};

main();
