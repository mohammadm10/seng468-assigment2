import express, { json, Request, Response } from 'express';
import { errorHandler } from './middleware/error';
import { NotFoundHandler } from './middleware/notFound';
import { connect } from './database/schema';
import client from './redis/client';
import UsersRouter from './routes/user'
import PostsRouter from './routes/post'
const bodyParser = require('body-parser');

const app = express();

// parse application/json
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
  res.json('Hello, World!');
});

app.use('/users', UsersRouter);
app.use('/posts', PostsRouter);

app.use(NotFoundHandler);
app.use(errorHandler);

const port = 4000;
app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
  connect().then(() => console.log('Connected to MongoDB!'));
});
