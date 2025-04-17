import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
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

  const sendMessage = async () => {
    console.log('Send Clicked - API Key:', apiKey ? apiKey.substring(0, 5) + '...' : 'undefined');
    if (!apiKey) {
      setError('Hugging Face API key is missing. Please contact the app administrator.');
      return;
    }
    if (!message) {
      setError('Please enter a message to send.');
      return;
    }

    // Add user's message to the conversation
    const updatedConversation = [...conversation, { role: 'user', content: message }];
    setConversation(updatedConversation);
    setLoading(true);
    setError('');
    setMessage('');

    try {
      console.log('Sending API request with message:', message);
      const response = await axios.post(
        'https://api-inference.huggingface.co/models/mixtralai/Mistral-7B-Instruct-v0.3',
        {
          messages: updatedConversation,
          max_tokens: 512,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('API Response Received:', response);
      const botResponse = response.data.choices[0].message.content;
      setConversation([...updatedConversation, { role: 'assistant', content: botResponse }]);
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = err.response
        ? `API Error: ${err.response.status} - ${
            err.response.data.message || err.response.data.error || 'Unknown error'
          }`
        : `Failed to get response: ${err.message || 'Unknown error'}`;
      setError(errorMessage);
      console.error('Error Response:', err.response ? err.response.data : 'No response data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Chatbot</h1>
      {error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <p>Chat with the bot below using Hugging Face AI.</p>
      )}
      <div
        style={{
          border: '1px solid #ccc',
          padding: '10px',
          height: '300px',
          overflowY: 'scroll',
          margin: '10px 0',
        }}
      >
        {conversation.map((msg, index) => (
          <div
            key={index}
            style={{
              textAlign: msg.role === 'user' ? 'right' : 'left',
              margin: '5px 0',
            }}
          >
            <p
              style={{
                display: 'inline-block',
                backgroundColor: msg.role === 'user' ? '#007bff' : '#e9ecef',
                color: msg.role === 'user' ? 'white' : 'black',
                padding: '5px 10px',
                borderRadius: '10px',
                maxWidth: '70%',
              }}
            >
              {msg.content}
            </p>
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message here..."
        style={{ margin: '10px', width: '300px' }}
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
      />
      <button onClick={sendMessage} disabled={loading || !apiKey || !message}>
        {loading ? 'Sending...' : 'Send Message'}
      </button>
      <p>
        Powered by{' '}
        <a href="https://huggingface.co/mixtralai/Mistral-7B-Instruct-v0.3">
          mixtralai/Mistral-7B-Instruct-v0.3
        </a>.
      </p>
      <p>By using this app, you agree to the model’s terms of service.</p>
    </div>
  );
}

export default App;
