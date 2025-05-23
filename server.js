const express = require("express");
const ytdl = require("@distube/ytdl-core");
const cors = require("cors");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const { PassThrough } = require("stream");

const app = express();
const port = 3000;

app.use(cors());

app.get("/", (req, res) => {
  console.log("server is running");
  res.send("server is running");
});
app.get("/download/mp4", async (req, res) => {
  const videoUrl = req.query.url;
  console.log(videoUrl);

  if (!ytdl.validateURL(videoUrl)) return res.status(400).send("Invalid URL");

  res.setHeader("Content-Disposition", 'attachment; filename="video.mp4"');

  ytdl(videoUrl, { filter: "audioandvideo", quality: "highest" }).pipe(res);
});

app.get("/download/mp3", async (req, res) => {
  const videoUrl = req.query.url;
  if (!ytdl.validateURL(videoUrl)) return res.status(400).send("Invalid URL");

  res.setHeader("Content-Disposition", 'attachment; filename="audio.mp3"');
  res.setHeader("Content-Type", "audio/mpeg");

  const stream = new PassThrough();
  ffmpeg(ytdl(videoUrl, { quality: "highestaudio" }))
    .audioBitrate(128)
    .toFormat("mp3")
    .on("error", (err) => {
      console.error(err);
      res.status(500).send("Error processing audio");
    })
    .pipe(stream);

  stream.pipe(res);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
