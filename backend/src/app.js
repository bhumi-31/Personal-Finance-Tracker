import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {notFound, errorHandler} from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({
    origin : process.env.CLIENT_URL
}));
app.use(express.json({limit : '10kb'}));

app.get("/api/health", (req, res) => {
    res.json({ status: 'ok' });
})

app.use(notFound);
app.use(errorHandler);

export default app;