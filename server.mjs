import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const videosPath = `${__dirname}/files`;

// This also reads subdirs and may cause issues if there is one
let videos = fs.readdirSync(videosPath);
let nVideos = videos.length;

setInterval(()=>{
  let oVideos = nVideos;
  console.log(`Updating videos..`);

  videos = fs.readdirSync(videosPath);
  nVideos = videos.length;

  if (oVideos == nVideos) {
    console.log("Nothing changed");
    return;
  }

  console.log(`Updated videos [${oVideos} before, ${nVideos} now]`)
},1000*60*30); // 1/2 hours

app.get("/", (req, res) => {
  let n = Math.floor(Math.random() * nVideos);

  // maybe could redirect to non-existent video
  // if one is removed while the server is running
  // or if it's trying to get a subdir 

  const vid = videos[n].split('.')[0]; 
  
  res.redirect(`/video/${vid}`);
});

app.get("/video/:vid", (req, res) => {
  const vid = req.params.vid;

  if (!fs.existsSync(`${videosPath}/${vid}.mp4`)) {
    res.status(404).send(`nope that doesnt exist go back to / >:(`);
    return;
  }

  res.sendFile(`${videosPath}/${vid}.mp4`, (err) => {if(err){console.error(`Error sending video: ${err.message}`);}});
});


// quite simple health check
app.get("/jollycheck",(req,res)=>{res.status(200).send("very jolly");});

// redirect to 404
app.use(function(req, res, next){
  res.status(404).send("wat");
});

app.listen(process.env.PORT || 8080, () => {
  if (!process.env.PORT) {
    console.log("I didn't find a PORT environment variable, listening to 8080 instead.");
  } else {
    console.log(`Found a PORT environment variable, listening to ${process.env.PORT}`);
  }
})

