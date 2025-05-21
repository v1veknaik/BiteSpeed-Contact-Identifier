import express from 'express';
import identifyRoute from './controllers/identify';

const app = express();
app.use(express.json());

app.use('/identify', identifyRoute);

app.get('/', (req, res) => res.send('Bitespeed contact identifier is running'));
app.listen(3000, () => console.log("Server running on port 3000"));