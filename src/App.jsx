import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;

  useEffect(() => {
    console.log('Component Mounted - API Key (first 5 chars):', apiKey ? apiKey.substring(0, 5) + '...' : 'undefined');
    if (!apiKey) {
      setError('Hugging Face API key is missing. Please contact the app administrator.');
      console.error('API key missing in Vercel environment variables.');
    }
  }, []);

  const generateImage = async () => {
    console.log('Generate Clicked - API Key (first 5 chars):', apiKey ? apiKey.substring(0, 5) + '...' : 'undefined');
    if (!apiKey) {
      setError('Hugging Face API key is missing. Please contact the app administrator.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      if (!prompt || prompt.length > 500) {
        throw new Error('Prompt must be non-empty and under 500 characters.');
      }
      const unsafeWords = ['illegal', 'harm', 'explicit'];
      if (unsafeWords.some(word => prompt.toLowerCase().includes(word))) {
        throw new Error('Prompt contains restricted content.');
      }

      console.log('Sending API request with prompt:', prompt);
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3.5-large',
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );

      console.log('API Response Received:', response);
      const imageBlob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
    } catch (err) {
      console.error('API Error:', err);
      setError('Failed to generate image: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Image Generator</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <p>Enter a prompt below to generate an image using Hugging Face AI.</p>
      )}
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt (e.g., 'A cat in a spacesuit')"
      />
      <button onClick={generateImage} disabled={loading || !apiKey}>
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {imageUrl && <img src={imageUrl} alt="Generated" style={{ maxWidth: '500px' }} />}
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
