Chats = new Mongo.Collection("chats");

Meteor.methods({
  addChat : function (chat) {
    console.log("Adding a chat object between " + userId1 + " and " + userId2);
    if (this.userId) {
      return Chats.insert(chat);
    }
    return;
  }
})
