import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;

  useEffect(() => {
    console.log('Component Mounted - API Key:', apiKey ? apiKey.substring(0, 5) + '...' : 'undefined');
    if (!apiKey) {
      setError('Hugging Face API key is missing. Please contact the app administrator.');
      console.error('API key missing in Vercel environment variables.');
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImage(file);
      setImageUrl(url);
    }
  };

  const upscaleImage = async () => {
    console.log('Upscale Clicked - API Key:', apiKey ? apiKey.substring(0, 5) + '...' : 'undefined');
    if (!apiKey) {
      setError('Hugging Face API key is missing. Please contact the app administrator.');
      return;
    }
    if (!image) {
      setError('Please upload an image to upscale.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', image);
      // Add an optional prompt if required by the model
      formData.append('prompt', 'Enhance the details of this image'); // Optional, adjust as needed

      console.log('Sending upscale request with image:', image.name, 'Size:', image.size, 'Type:', image.type);
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-x4-upscaler',
        formData,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'multipart/form-data',
          },
          responseType: 'blob',
        }
      );

      console.log('API Response Received:', response);
      const imageBlob = new Blob([response.data], { type: 'image/png' });
      const upscaledUrl = URL.createObjectURL(imageBlob);
      setImageUrl(upscaledUrl);
    } catch (err) {
      console.error('API Error:', err);
      console.error('Error Response:', err.response ? err.response.data : 'No response data');
      setError('Failed to upscale image: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Image Upscaler</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <p>Upload an image below to upscale it using Hugging Face AI.</p>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        style={{ margin: '10px' }}
      />
      {imageUrl && <img src={imageUrl} alt="Preview/Upscaled" style={{ maxWidth: '500px', margin: '10px' }} />}
      <button onClick={upscaleImage} disabled={loading || !apiKey || !image}>
        {loading ? 'Upscaling...' : 'Upscale Image'}
      </button>
      <p>
        Powered by a model under the{' '}
        <a href="https://huggingface.co/spaces/CompVis/stable-diffusion-license">
          CreativeML Open RAIL++-M License
        </a>.
      </p>
      <p>By using this app, you agree to the license terms.</p>
    </div>
  );
}

export default App;
