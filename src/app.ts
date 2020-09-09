import express, { Request, Response, NextFunction } from 'express';
import createDebug from 'debug';
import { bot } from './telegram/bot';
import { TELEGRAM_BOT_API_KEY } from './config';
import { getAccessToken } from './google/auth';
import { saveGoogleAccessToken } from './models/GoogleAccessToken';

const app = express();

const debug = createDebug('app:express');

app.use(bot.webhookCallback(`/${TELEGRAM_BOT_API_KEY}`));

app.use((err: Error, _: Request, res: Response) => {
  debug(err.stack);
  res.status(500).send(`Something went wrong! ${err}`);
});

app.get('/auth/google', async (req: Request, res: Response, next: NextFunction) => {
  const { state, code } = req.query;
  if (!state || !code) {
    return res.status(401).end('Unauthorized');
  }
  const { user } = JSON.parse(state as string);
  try {
    const accessToken = await getAccessToken(code as string);
    await saveGoogleAccessToken(user.id, accessToken);
  } catch (err) {
    return next(err);
  }
  return res.status(200).send(`Hello, ${user.first_name}! You have successfully connected your Google account!`);
});

export function listen(port: string) {
  return new Promise((resolve) => {
    app.listen(port, () => {
      debug(`Listening on port ${port}!`);
      resolve(app);
    });
  });
}
