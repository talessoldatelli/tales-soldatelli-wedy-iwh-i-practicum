const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();

const PORT = process.env.PORT || 3000;
const HUBSPOT_TOKEN = process.env.HS_PRIVATE_APP_TOKEN;
const OBJECT_TYPE_ID = process.env.OBJECT_TYPE_ID;

const CUSTOM_PROPERTIES = ['name', 'description', 'level'];

const hubspotClient = axios.create({
  baseURL: 'https://api.hubapi.com',
  headers: {
    Authorization: `Bearer ${HUBSPOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

app.set('view engine', 'pug');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Homepage route
app.get('/', async (req, res) => {
  try {
    const response = await hubspotClient.get(`/crm/v3/objects/${OBJECT_TYPE_ID}`, {
      params: {
        properties: CUSTOM_PROPERTIES.join(','),
        limit: 100,
      },
    });

    res.render('homepage', {
      pageTitle: 'Custom Object Table | Integrating With HubSpot I Practicum',
      records: response.data.results,
    });
  } catch (error) {
    console.error(error.response?.data || error.message);

    res.render('homepage', {
      pageTitle: 'Custom Object Table | Integrating With HubSpot I Practicum',
      records: [],
      error: 'Could not load custom object records.',
    });
  }
});

// Form route
app.get('/update-cobj', (req, res) => {
  res.render('updates', {
    pageTitle: 'Update Custom Object Form | Integrating With HubSpot I Practicum',
  });
});

// Create custom object record route
app.post('/update-cobj', async (req, res) => {
  try {
    const { name, description, level } = req.body;

    await hubspotClient.post(`/crm/v3/objects/${OBJECT_TYPE_ID}`, {
      properties: {
        name,
        description,
        level,
      },
    });

    res.redirect('/');
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).send('Could not create custom object record.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});