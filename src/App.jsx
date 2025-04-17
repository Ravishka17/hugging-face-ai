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
    console.log('Component Mounted - API Key:', apiKey ? apiKey.substring(0, 5) + '...' : 'undefined');
    if (!apiKey) {
      setError('Hugging Face API key is missing. Please contact the app administrator.');
      console.error('API key missing in Vercel environment variables.');
    }
  }, []);

  const generateImage = async () => {
    console.log('Generate Clicked - API Key:', apiKey ? apiKey.substring(0, 5) + '...' : 'undefined');
    if (!apiKey) {
      setError('Hugging Face API key is missing. Please contact the app administrator.');
      return;
    }
    if (!prompt) {
      setError('Please enter a prompt to generate an image.');
      return;
    }

    setLoading(true);
    setError('');
    setImageUrl('');
    try {
      console.log('Sending API request with prompt:', prompt);
      const response = await axios.post(
        'https://router.huggingface.co/fal-ai/fal-ai/hidream-i1-full',
        {
          sync_mode: true,
          prompt: prompt,
        },
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
      const generatedUrl = URL.createObjectURL(imageBlob);
      setImageUrl(generatedUrl);
    } catch (err) {
      console.error('API Error:', err);
      console.error('Error Response:', err.response ? err.response.data : 'No response data');
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
        placeholder="Enter a prompt (e.g., 'Astronaut riding a horse')"
        style={{ margin: '10px', width: '300px' }}
      />
      <button onClick={generateImage} disabled={loading || !apiKey || !prompt}>
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {imageUrl && <img src={imageUrl} alt="Generated" style={{ maxWidth: '500px', margin: '10px' }} />}
      <p>
        Powered by{' '}
        <a href="https://huggingface.co/fal-ai/fal-ai/hidream-i1-full">fal-ai/hidream-i1-full</a>.
      </p>
      <p>By using this app, you agree to the model’s terms of service.</p>
    </div>
  );
}

export default App;
