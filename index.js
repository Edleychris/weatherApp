const express = require("express");
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use((req, res, next) => {
    req.clientIp = req.headers['x-forwarded-for'] || req.ip;
    next();
  });
app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Dear';
    const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.headers['cf-connecting-ip'] || req.connection.remoteAddress || req.ip;

    try {
        const response = await axios.get(`http://ip-api.com/json/${clientIp}`);

        const location = response.data.city || 'Unknown City';
        const latitude = response.data.lat;

        const longitude = response.data.lon;

        const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
        const temp = weatherResponse.data.current_weather.temperature || 'Unkonwn';

        return res.json({
            client_ip: clientIp,
            location: location,
            greeting: `Hello, ${visitorName}!, the temperature is ${temp} degree celsius in ${location}`
        })

    } catch(error) {
        res.status(500).json({error: 'Failed to fetch data'})
    }
})

app.listen(PORT, () => {
    console.log(`Server is listening at port ${PORT}`)
})