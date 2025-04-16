import { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateImage = async () => {
    setLoading(true);
    setError('');
    try {
      // Basic prompt validation
      if (!prompt || prompt.length > 500) {
        throw new Error('Prompt must be non-empty and under 500 characters.');
      }
      // Simple content filter (extend as needed)
      const unsafeWords = ['illegal', 'harm', 'explicit'];
      if (unsafeWords.some(word => prompt.toLowerCase().includes(word))) {
        throw new Error('Prompt contains restricted content.');
      }

      // Call Hugging Face API
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
        { inputs: prompt },
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          responseType: 'blob',
        }
      );

      // Display image
      const imageBlob = new Blob([response.data], { type: 'image/png' });
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
    } catch (err) {
      setError('Failed to generate image. Check your prompt or try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Image Generator</h1>
      <input
        type="text"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter a prompt (e.g., 'A cat in a spacesuit')"
      />
      <button onClick={generateImage} disabled={loading}>
        {loading ? 'Generating...' : 'Generate Image'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {imageUrl && <img src={imageUrl} alt="Generated" style={{ maxWidth: '500px' }} />}
      <p>
        Powered by a model under the{' '}
        <a href="https://huggingface.co/spaces/CompVis/stable-diffusion-license">
          CreativeML Open RAIL++-M License
        </a>.
      </p>
    </div>
  );
}

export default App;
