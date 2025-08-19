import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import 'dotenv/config';

// Replicate __dirname functionality in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;
const CLOUD_FUNCTION_URL = process.env.VITE_CLOUD_FUNCTION_REDIRECT_URL;
const FUNCTIONS_ORIGIN = process.env.VITE_FUNCTIONS_ORIGIN || 'http://127.0.0.1:5001/lady-qr/us-central1';

// Add basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// QR Code Redirect - proxy to cloud function when available, else error
app.get('/r/:shortId', async (req, res) => {
  const { shortId } = req.params;

  try {
    if (!CLOUD_FUNCTION_URL) {
      console.error('Cloud function URL is not configured.');
      return res.status(500).send('Redirection service is not configured.');
    }

    const functionUrl = `${CLOUD_FUNCTION_URL}/${shortId}`;

    const headers = {
      'User-Agent': req.get('User-Agent'),
      'x-forwarded-for': req.ip,
      'Referer': req.get('Referer')
    };

    const response = await fetch(functionUrl, {
      headers,
      redirect: 'manual'
    });

    if (response.status === 302) {
      const destinationUrl = response.headers.get('Location');
      if (destinationUrl) {
        return res.redirect(302, destinationUrl);
      }
    }

    const body = await response.text();
    return res.status(response.status).send(body);
  } catch (error) {
    console.error('Error proxying to cloud function:', error);
    return res.status(500).send('Error processing your request.');
  }
});

// QR Code Redirect Handler (when cloud function is available)
app.get('/redirect/:shortId', async (req, res) => {
  const { shortId } = req.params;

  if (!CLOUD_FUNCTION_URL) {
    console.error('Cloud function URL is not configured.');
    return res.status(500).send('Redirection service is not configured.');
  }

  try {
    const functionUrl = `${CLOUD_FUNCTION_URL}/${shortId}`;

    // Pass on headers
    const headers = {
      'User-Agent': req.get('User-Agent'),
      'x-forwarded-for': req.ip,
      'Referer': req.get('Referer')
    };

    const response = await fetch(functionUrl, {
      headers: headers,
      redirect: 'manual' // We want to handle the redirect ourselves
    });

    // The cloud function will return a 302 redirect with the destination in the Location header
    if (response.status === 302) {
      const destinationUrl = response.headers.get('Location');
      if (destinationUrl) {
        return res.redirect(302, destinationUrl);
      }
    }

    // Handle other statuses from the function (404, 500 etc)
    const body = await response.text();
    return res.status(response.status).send(body);

  } catch (error) {
    console.error('Error proxying to cloud function:', error);
    return res.status(500).send('Error processing your request.');
  }
});

// Proxy for analytics API to Cloud Functions
app.get('/api/analytics', async (req, res) => {
  try {
    const url = new URL(`${FUNCTIONS_ORIGIN}/getAnalytics`);
    // Forward query params
    for (const [key, value] of Object.entries(req.query)) {
      url.searchParams.append(key, String(value));
    }

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': req.get('Authorization') || ''
      },
    });

    const text = await response.text();
    res.status(response.status);
    // Try to pass through JSON if possible
    try {
      const json = JSON.parse(text);
      return res.json(json);
    } catch {
      return res.send(text);
    }
  } catch (error) {
    console.error('Error proxying analytics:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle client-side routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is listening on port ${PORT}`);
  console.log(`Health check available at http://0.0.0.0:${PORT}/health`);
});