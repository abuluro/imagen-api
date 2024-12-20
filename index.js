const { GoogleAuth } = require('google-auth-library');
const axios = require('axios');
const express = require('express');
const app = express();
app.use(express.json()); // Ensure body parsing is enabled

const PORT = 3000;

async function generateAccessToken() {
    try {
        const auth = new GoogleAuth({
            keyFile: '../ai-lesson-445209-ad40db5d4f76.json', // Path to the key file
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();
        return accessToken.token;
    } catch (error) {
        console.error('Error generating access token:', error);
        throw error;
    }
}

app.post('/imagen', async (req, res) => {
    try {
        console.log('Request body:', req.body);
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        const token = await generateAccessToken();

        const response = await axios.post(
            'https://europe-west2-aiplatform.googleapis.com/v1/projects/ai-lesson-445209/locations/europe-west2/publishers/google/models/imagen-3.0-generate-001:predict',
            {
                instances: [{ prompt }],
                parameters: { sampleCount: 1 }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json; charset=utf-8',
                },
            }
        );

        console.log('Response from Google API:', response.data);
        res.json(response.data);
    } catch (error) {
        console.error('Error in /imagen route:', error.response?.data || error.message);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
