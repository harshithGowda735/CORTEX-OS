console.log('Test Server is running...');
const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Test OK'));
app.listen(5002, () => console.log('Listening on 5002'));
