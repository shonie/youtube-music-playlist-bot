import mongoose from 'mongoose';

const googleAccessTokenSchema = new mongoose.Schema({
  scope: String,
  access_token: String,
  token_type: String,
  expiry_date: Number,
  id: String,
  _id: String,
});

const GoogleAccessToken = mongoose.model('GoogleAccessToken', googleAccessTokenSchema);

export async function saveGoogleAccessToken(id, token) {
  await GoogleAccessToken.findOneAndUpdate(
    { _id: id },
    { ...token, id },
    {
      upsert: true,
    }
  );
}
