const express = require('express');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 3000;
const login = require('./modules/login');

app.use(express.json());
app.use('/login', login);

app.get('/', (req, res) => {
    res.send({msg: 'success'});
});

app.listen(port, () => console.log(`Listening on Port: ${port}`));