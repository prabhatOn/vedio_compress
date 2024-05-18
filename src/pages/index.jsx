import { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'tailwindcss/tailwind.css';
import 'react-toastify/dist/ReactToastify.css';
import '../../public/bg-a352b7ab2e3b.png'
import { BackgroundBeams } from '@/components/background-beams';
const Home = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [videoDetails, setVideoDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadClicked, setDownloadClicked] = useState(false);
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = event.dataTransfer.files[0];
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('video', selectedFile);

    setLoading(true);

    try {
      const response = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setVideoDetails(response.data.videoDetails);
      toast.success('Video uploaded and compressed successfully!');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Error uploading video.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    setDownloadClicked(true);
    setTimeout(() => {
      setSelectedFile(null);
      setVideoDetails(null);
      setDownloadClicked(false);
    }, 2000);
  };

  return (
    <div>
    <BackgroundBeams/>
      <div className=" relative mx-[20%] my-52 h-3/5 z-50 w-2/3 bg-black shadow-md rounded-md p-8">
        <h1 className="text-3xl font-semibold mb-4 bg-gradient-to-r from-[#4e51e8] via-[#590da5] to-[#0f0f62] bg-clip-text text-transparent">Upload and Compress Video</h1>
        {selectedFile ? (
          <div className="border-2 border-gray-300 p-4 mb-4">
            <p className="text-gray-500 text-center mb-2">Selected File:</p>
            <p className="text-gray-800 font-semibold">{selectedFile.name}</p>
            <p className="text-gray-800">{`${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`}</p>
          </div>
        ) : (
          <div
            className="border-dashed border-2 border-gray-300 p-8 mb-4 cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(event) => event.preventDefault()}
          >
            <p className="text-gray-500 text-center">Drag & drop your video file here</p>
            <span className="text-gray-700 block text-center">OR</span>
            <label htmlFor="fileInput" className="block text-blue-500 text-center cursor-pointer">
              Click to browse
            </label>
            <input type="file" id="fileInput" accept="video/*" onChange={handleFileChange} className="hidden" />
          </div>
        )}
        {selectedFile && (
          <button
            onClick={handleUpload}
            className={`bg-blue-500 text-white px-6 py-3 rounded-md transition duration-300 ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
            }`}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
        )}
        {videoDetails && (
          <div className="mt-4">
            <h2 className="text-xl text-red-500 font-semibold mb-2">Compressed Video</h2>
            <div className=" border-x border-y border-gray-300 p-4 mb-4">
              <p className="text-gray-500 text-center mb-2">Selected File:</p>
              <p className="text-gray-800 font-semibold">{videoDetails.name}</p>
              <p className="text-gray-800">{`${videoDetails.size} MB`}</p>
            </div>
            <button
              onClick={handleDownload}
              disabled={downloadClicked}
              className="bg-blue-500 text-white px-6 py-3 rounded-md transition duration-300"
            >
              <a href={videoDetails.path} download className="text-white-500 ">
                Download Compressed Video
              </a>
            </button>
          </div>
        )}
      </div>
      <ToastContainer />
      </div>
  );
};

export default Home;
