import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import pool from '../../lib/db';
import fs from 'fs';

const upload = multer({
  storage: multer.diskStorage({
    destination: './public/videos/',
    filename: (req, file, cb) => cb(null, `${Date.now()}_${file.originalname}`),
  }),
});

export const config = {
  api: {
    bodyParser: false,
  },
};

const handler = async (req, res) => {
  if (req.method === 'POST') {
    upload.single('video')(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const { filename } = req.file;
      const videoPath = `/videos/${filename}`;
      const inputPath = `./public${videoPath}`;
      const compressedFilename = `compressed_${filename}`;
      const compressedPath = `./public/videos/${compressedFilename}`;

      try {
        await new Promise((resolve, reject) => {
          ffmpeg(inputPath)
            .output(compressedPath)
            .setFfmpegPath('C:/ffmpeg-7.0-essentials_build/bin/ffmpeg.exe')
            .videoCodec('libx265')
            .on('end', resolve)
            .on('error', reject)
            .run();
        });
        const stats = fs.statSync(compressedPath);
        const sizeInBytes = stats.size;
        const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);
        const result = await pool.query(
          'INSERT INTO videos (path, compressed_path, compressed_name, compressed_size, created_at) VALUES ($1, $2, $3, $4, NOW()) RETURNING id',
          [videoPath, `/videos/${compressedFilename}`, compressedFilename, sizeInMB]
        );        

        const videoId = result.rows[0].id;
        res.status(200).json({ 
          videoId, 
          videoDetails: { 
            path: `/videos/${compressedFilename}`, 
            name: compressedFilename, 
            size: sizeInMB 
          } 
        });
      } catch (error) {
        console.error('Error processing video:', error);
        res.status(500).json({ error: 'Error processing video' });
      }
    });
  } else {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
};

export default handler;
