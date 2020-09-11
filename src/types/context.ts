import { Context } from 'telegraf';
import { Dictionary } from './dictionary';

export interface TelegrafContext extends Context {
  session: {
    channels: Dictionary<boolean>;
  };
}
