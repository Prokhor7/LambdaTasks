import axios from "axios";

export const makeTinyLink = async (link) => {
  const response = await axios.post(
    `https://api.tinyurl.com/create?api_token=${process.env.TINYURL_TOKEN}`,
    { url: link }
  );

  return response.data.data.tiny_url;
};
