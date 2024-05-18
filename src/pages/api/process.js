import pool from '../../lib/db';
import { processVideo } from '../../lib/videoProcessing.js';

export default async (req, res) => {
  const { videoId } = req.body;

  try {
    const result = await pool.query('SELECT path FROM videos WHERE id = $1', [videoId]);
    const videoPath = result.rows[0].path;
    const inputPath = `./public${videoPath}`;
    const outputPath = `./public/processed/${videoPath.split('/').pop()}`;

    await processVideo(inputPath, outputPath);

    res.status(200).json({ processedVideoPath: outputPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
