import mongoose from 'mongoose';
import { Credentials } from 'google-auth-library';

const googleAccessTokenSchema = new mongoose.Schema({
  scope: String,
  access_token: String,
  refresh_token: String,
  token_type: String,
  expiry_date: Number,
  id: Number,
  _id: Number,
});

const GoogleAccessToken = mongoose.model('GoogleAccessToken', googleAccessTokenSchema);

export async function saveGoogleAccessToken(id: string, token: Credentials) {
  await GoogleAccessToken.findOneAndUpdate(
    { _id: id },
    { ...token, id },
    {
      upsert: true,
      useFindAndModify: true,
    }
  );
}

export async function getByUserId(id: number): Promise<Credentials> {
  const creds: Credentials = GoogleAccessToken.findById(id).exec() as Credentials;
  return creds;
}

export async function updateToken(accessToken: string, newCredentials: Credentials) {
  await GoogleAccessToken.findOneAndUpdate({ access_token: accessToken }, newCredentials, {
    upsert: true,
    useFindAndModify: true,
  });
}
