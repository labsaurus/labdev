import express from 'express';
import cors from 'cors';
import * as gplay from 'google-play-scraper';
<<<<<<< HEAD

=======
import { Request, Response } from 'express';
>>>>>>> 07633a1 (Initial commit)
const app = express();
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
app.get('/api/playstore-data', async (req, res) => {
=======
app.get("/api/playstore-data", async (req: Request, res: Response): Promise<Response> => {
>>>>>>> 07633a1 (Initial commit)
  try {
    const { app } = req.query;
    
    // Search for the app
    const searchResults = await gplay.search({
      term: app as string,
      num: 1
    });

    if (searchResults.length === 0) {
      return res.status(404).json({ error: 'App not found' });
    }

    // Get detailed app information
    const appId = searchResults[0].appId;
    const appDetails = await gplay.app({ appId });

    const appData = {
      title: appDetails.title,
      icon: appDetails.icon,
      developer: appDetails.developer,
      category: appDetails.genre,
      rating: appDetails.score.toFixed(1),
      downloads: appDetails.installs,
      description: appDetails.description,
      screenshots: appDetails.screenshots
    };

    res.json(appData);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to fetch app data' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});