import * as fs from "fs";
import * as csv from "fast-csv";
import Fuse from "fuse.js";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

const options = {
  // isCaseSensitive: false,
  // includeScore: true,
  // shouldSort: true,
  // includeMatches: false,
  // findAllMatches: false,
  // minMatchCharLength: 1,
  // location: 0,
  // threshold: 0.6,
  // distance: 100,
  // useExtendedSearch: false,
  // ignoreLocation: false,
  // ignoreFieldNorm: false,
  // fieldNormWeight: 1,
  keys: ["key"],
};

const getCSVData = (callback) => {
  const data = [];
  fs.createReadStream("./gpu.csv")
    .pipe(csv.parse({ headers: true }))
    .on("error", (error) => console.error(error))
    .on("data", (row) => data.push(row))
    .on("end", () => {
      callback(data);
    });
};

app.use(bodyParser.json());
app.get("/:query", (req, res) => {
  const { query } = req.params;
  getCSVData((data) => {
    const fuse = new Fuse(data, options);
    const result = fuse.search(query);
    res.send(result?.[0]?.item);
  });
});

app.post("/", (req, res) => {
  const { keys } = req.body;

  getCSVData((data) => {
    const fuse = new Fuse(data, options);

    res.send(
      keys.map((key) => ({
        key,
        result: fuse.search(key)?.[0]?.item,
      }))
    );
  });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
