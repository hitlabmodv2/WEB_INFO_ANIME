import express from "express";
import os from "os";
import {
  getNew,
  getAnimeList,
  getMovie,
  getPopular,
  getSchedule,
  getGenres,
  getAnimeByGenre,
  getSearch,
  getAnimeDetail,
  getEpisode,
  getAZList,
  getStreamLink,
  getMALGenres,
  getMALAnimeByGenre
} from "../controllers/scrapingController.js";

const router = express.Router();

router.get("/new/page/:pageNumber", getNew);
router.get("/anime/page/:pageNumber", getAnimeList);
router.get("/movie/page/:pageNumber", getMovie);
router.get("/popular/page/:pageNumber", getPopular);
router.get("/schedule", getSchedule);
router.get("/azlist", getAZList);
router.get("/genres", getGenres);
router.get("/genre/:genreId", getAnimeByGenre);
router.get("/genre/:genreId/page/:pageNumber", getAnimeByGenre);
router.get("/mal-genres-scrape", getMALGenres);
router.get("/mal-genres-scrape/:genreId", getMALAnimeByGenre);
router.get("/search/:keyword", getSearch);
router.get("/search/:keyword/page/:pageNumber", getSearch);
router.get("/detail/:animeId", getAnimeDetail);
router.get("/watch/:episodeId", getEpisode); 
router.get("/stream/:streamId", getStreamLink);

router.get("/server-stats", (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);
    
    const cpus = os.cpus();
    const cpuModel = cpus[0]?.model || "Unknown";
    const cpuCount = cpus.length;
    
    const uptimeSeconds = os.uptime();
    const uptimeHours = Math.floor(uptimeSeconds / 3600);
    const uptimeMinutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptimeDays = Math.floor(uptimeHours / 24);
    
    let uptimeString;
    if (uptimeDays > 0) {
      uptimeString = `${uptimeDays}d ${uptimeHours % 24}h ${uptimeMinutes}m`;
    } else if (uptimeHours > 0) {
      uptimeString = `${uptimeHours}h ${uptimeMinutes}m`;
    } else {
      uptimeString = `${uptimeMinutes}m`;
    }
    
    const formatBytes = (bytes) => {
      if (bytes < 1024) return bytes + ' B';
      const kb = bytes / 1024;
      if (kb < 1024) return kb.toFixed(2) + ' KB';
      const mb = kb / 1024;
      if (mb < 1024) return mb.toFixed(2) + ' MB';
      const gb = mb / 1024;
      return gb.toFixed(2) + ' GB';
    };
    
    res.json({
      success: true,
      data: {
        memory: {
          total: formatBytes(totalMem),
          used: formatBytes(usedMem),
          free: formatBytes(freeMem),
          usagePercent: parseFloat(memUsagePercent)
        },
        cpu: {
          model: cpuModel,
          cores: cpuCount
        },
        uptime: uptimeString,
        platform: `${os.type()} ${os.release()}`,
        hostname: os.hostname()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to get server stats",
      error: error.message
    });
  }
}); 

export default router;
