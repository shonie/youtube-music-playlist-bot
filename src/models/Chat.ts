import * as mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  id: Number,
  _id: Number,
});

const Chat = mongoose.model('Chat', chatSchema);

export async function saveChat({ id }: { id: number }) {
  await Chat.findOneAndUpdate(
    { _id: id },
    {
      id,
    },
    {
      upsert: true,
    }
  );
}

export async function deleteChatById(id: number) {
  await Chat.deleteOne({ _id: id });
}

export async function getAllChats() {
  return Chat.find({}).exec();
}
