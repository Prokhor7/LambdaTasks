import express from "express";
import fs from "fs";

const app = express();

const PORT = 3000;

type IPInfo = {
  ip?: string;
  ipInt?: number;
  from: number;
  to: number;
  countryCode: string;
  country: string;
};

const ipToLocationData: IPInfo[] = fs
  .readFileSync("IP2LOCATION-LITE-DB1.CSV", "utf8")
  .split("\n")
  .map((row) => {
    const [from, to, countryCode, country] = row.split(",").map((value) => {
      const trimmedValue = value.trim().replace(/"/g, "");

      if (trimmedValue === "-") {
        return null;
      } else if (!isNaN(Number(trimmedValue))) {
        return Number(trimmedValue);
      } else {
        return trimmedValue;
      }
    });

    return {
      from: from as number,
      to: to as number,
      countryCode: countryCode as string,
      country: country as string,
    };
  });

const ipToDecimal = (ip: string): number => {
  return (
    ip
      .split(".")
      .reduce((result, octet) => (result << 8) + parseInt(octet, 10), 0) >>> 0
  );
};

const getLocationByIp = (ip: string): IPInfo | null => {
  const ipInt = ipToDecimal(ip);

  let low = 0;
  let high = ipToLocationData.length - 1;
  let location: IPInfo | undefined = undefined;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const row = ipToLocationData[mid];

    if (ipInt >= row.from && ipInt <= row.to) {
      location = row;
      break;
    } else if (ipInt < row.from) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  if (location) {
    location.ip = ip;
    location.ipInt = ipInt;
  }

  return location ? location : null;
};

app.set("trust proxy", true);

app.get("/my-location", (req, res) => {
  if (req.ip) {
    res.json(getLocationByIp(req.ip));
  }
});

type TestIP = {
  country: string;
  ip: string;
  result?: IPInfo | null;
};

app.get("/test", (req, res) => {
  let IPs: TestIP[] = [
    { country: "Chile", ip: "45.232.208.143" },
    { country: "Armenia", ip: "185.182.120.34" },
    { country: "Mexico", ip: "45.177.176.23" },
    { country: "Turkey", ip: "5.44.80.51" },
    { country: "Norway", ip: "91.149.48.22" },
    { country: "Spain", ip: "83.229.33.3" },
    { country: "Cyprus", ip: "203.24.108.65" },
    { country: "UK", ip: "23.43.23.15" },
    { country: "Ireland", ip: "89.28.176.5" },
    { country: "Romania", ip: "77.83.248.211" },
  ];
  IPs.forEach((IP) => {
    IP.result = getLocationByIp(IP.ip);
    console.log(`For ip: ${IP.ip} from: ${IP.country} result is: ${JSON.stringify(IP.result)}`);
  });
  res.json(IPs);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
