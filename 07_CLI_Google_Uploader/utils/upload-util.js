import fs from "fs";
import path from "path";
import { google } from "googleapis";
import apikey from "../apikey.json" with { type: "json" };

const FOLDER = "1l4ShxZsa7D8CV63Jml-aMjj9p8hIVa0K";
const SCOPE = ["https://www.googleapis.com/auth/drive"];

const authorize = async () => {
  const jwtClient = new google.auth.JWT(
    apikey.client_email,
    null,
    apikey.private_key,
    SCOPE
  );

  await jwtClient.authorize();

  return jwtClient;
};

const getMimeType = (extension) => {
  switch (extension.toLowerCase()) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".pdf":
      return "application/pdf";
    default:
      return "application/octet-stream";
  }
};

const getFileObject = (filePath) => {
  const fileStats = fs.statSync(filePath);
  const fileExtension = path.extname(filePath);

  return {
    originalname: path.basename(filePath),
    mimeType: getMimeType(fileExtension),
    path: filePath,
    size: fileStats.size,
  };
};

export const uploadFile = async ({ filePath, newName }) => {
  const file = getFileObject(filePath);

  const auth = await authorize();

  const { data } = await google.drive({ version: "v3", auth }).files.create({
    media: { mimeType: file.mimeType, body: fs.createReadStream(filePath) },
    requestBody: {
      name: newName ? newName : file.originalname,
      parents: [FOLDER],
    },
    fields: "id, name, webViewLink",
  });

  return data.webViewLink;
};
