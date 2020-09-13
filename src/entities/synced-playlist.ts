import mongoose from 'mongoose';

export interface SyncedPlaylistInterface {
  playlistId: string;
  chatId: number;
  userId: number;
}

const syncedPlaylistSchema = new mongoose.Schema({
  playlistId: String,
  chatId: Number,
  userId: Number,
});

const SyncedPlaylist = mongoose.model('SyncedPlaylist', syncedPlaylistSchema);

export async function saveSyncedPlaylist({ chatId, playlistId, userId }: SyncedPlaylistInterface) {
  await SyncedPlaylist.findOneAndUpdate(
    { chatId, playlistId, userId },
    { chatId, playlistId, userId },
    {
      upsert: true,
      useFindAndModify: true,
    }
  );
}

export async function deleteSyncedPlaylist({ chatId, playlistId, userId }: SyncedPlaylistInterface) {
  await SyncedPlaylist.deleteOne({ chatId, playlistId, userId });
}

export async function getSyncedPlaylist({ chatId, playlistId, userId }: SyncedPlaylistInterface) {
  return SyncedPlaylist.findOne({
    chatId,
    playlistId,
    userId,
  }).exec();
}

export async function getSyncedPlaylistsByChatId(chatId: number): Promise<SyncedPlaylistInterface[]> {
  const playlists = (await SyncedPlaylist.find({
    chatId,
  }).exec()) as unknown[];
  return playlists as SyncedPlaylistInterface[];
}
