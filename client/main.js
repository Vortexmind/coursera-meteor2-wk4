  Meteor.subscribe("chats");
  Meteor.subscribe("chatUsers");

  // set up the main template the the router will use to build pages
  Router.configure({
    layoutTemplate: 'ApplicationLayout'
  });
  // specify the top level route, the page users see when they arrive at the site
  Router.route('/', function () {
    console.log("rendering root /");
    this.render("navbar", {to:"header"});
    this.render("lobby_page", {to:"main"});
  });

  // specify a route that allows the current user to chat to another users
  Router.route('/chat/:_id', function () {
    // the user they want to chat to has id equal to
    // the id sent in after /chat/...
    var otherUserId = this.params._id;
    Session.set("otherUser",otherUserId);

    console.log("User " +Meteor.userId()+ " chatting to "+ otherUserId);

    // find a chat that has two users that match current user id
    // and the requested user id
    var filter = {$or:[
                {user1Id:Meteor.userId(), user2Id:otherUserId},
                {user2Id:Meteor.userId(), user1Id:otherUserId}
              ]};
    var chat = Chats.findOne(filter);
    console.log("Search the chat returned +++ ");
    console.log(chat);
    if (!chat){// no chat matching the filter - need to insert a new one
      chat = {
        user1Id:Meteor.userId(),
        user2Id:otherUserId,
      };
      Meteor.call("addChat", chat, function(err,res){
        if (!err) {
          console.log("Addchat callback returned " + res);
          Session.set("chatId",chatId);
        } else {
          console.log("Error inserting chat: " + err);
        }
      })
      console.log("Created a new chat");
    }
    else {// there is a chat going already - use that.
      console.log("Using existing chat: " + chat._id);
      chatId = chat._id;
      Session.set("chatId",chatId);
    }

    this.render("navbar", {to:"header"});
    this.render("chat_page", {to:"main"});
  });

  ///
  // helper functions
  ///
  Template.available_user_list.helpers({
    users:function(){
      return Meteor.users.find();
    }
  })
  Template.available_user.helpers({
    getUsername:function(userId){
      user = Meteor.users.findOne({_id:userId});
      return user.profile.username;
    },
    isMyUser:function(userId){
      if (userId == Meteor.userId()){
        return true;
      }
      else {
        return false;
      }
    }
  })


  Template.chat_page.helpers({
    messages:function(){
      var chat = Chats.findOne({_id:Session.get("chatId")});
      return chat.messages;
    },
    other_user:function(user_id){
      user = Meteor.users.findOne({_id:Session.get("otherUser")});
      return user.profile.username;
    },

  })

  Template.chat_message.helpers({
    getUserName:function(user_id){
      user = Meteor.users.findOne({_id:user_id});
      return user.profile.username;
    },
    getUserAvatar:function(user_id){
      user = Meteor.users.findOne({_id:user_id});
      return user.profile.avatar;
    },
    userIsSender:function(user_id){
      return user_id == Meteor.userId();
    }



  })

  Template.chat_page.events({
  // this event fires when the user sends a message on the chat page
  'submit .js-send-chat':function(event){
    // stop the form from triggering a page reload
    event.preventDefault();
    // see if we can find a chat object in the database
    // to which we'll add the message
    var chat = Chats.findOne({_id:Session.get("chatId")});
    if (chat){// ok - we have a chat to use
      var msgs = chat.messages; // pull the messages property
      if (!msgs){// no messages yet, create a new array
        msgs = [];
      }
      // is a good idea to insert data straight from the form
      // (i.e. the user) into the database?? certainly not.
      // push adds the message to the end of the array
      msgs.push({
        text: event.target.chat.value,
        from : Meteor.userId()
      });
      // reset the form
      event.target.chat.value = "";
      // put the messages array onto the chat object
      chat.messages = msgs;
      // update the chat object in the database.
      Meteor.call("updateChat",chat,function(err,res){
        if (!err) {
          console.log("updateChat callback returned" + res);
        } else {
          console.log("Error updating chat: " + err);
        }
      });
    }
  },
  'click .js-add-emoji':function(event){
    var emojicode = $(event.target).attr('emojicode');
    $('#chat-input').val($('#chat-input').val() + ' '+emojicode+' ');
    }
  })
