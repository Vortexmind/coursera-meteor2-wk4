Chats = new Mongo.Collection("chats");

Meteor.methods({
  addChat : function (chat) {
    console.log("Adding a chat");
    if (this.userId) {
      chat.dateUpdated = new Date();
      return Chats.insert(chat);
    }
    return;
  },
  updateChat : function(chat) {
    console.log("Updating a chat");
    if (this.userId) {
      chat.dateUpdated = new Date();
      return Chats.update(chat._id, chat);
    }
    return;
  }
})
