var client = new Faye.Client("http://localhost:3000");

client.disable('autodisconnect');

client.subscribe('/online-users', function(users) {
  var onlineUsersContainer = $('#online-users ul');

  onlineUsersContainer.html('');

  for (var id in users) {
    onlineUsersContainer.append($('<li id="'+ id +'">' + users[id] + '</li>'));
  }
});

client.subscribe("/messages", function(message){
  var user_chat = $('<div class="user_chat"><strong>'+message.username+':</strong> '+message.text+'</div>');

  $("#messages-in").append(user_chat);

  $('#chat-messases').scrollTop($('#messages-in').height()+1000);
});

client.on('transport:up', function() {
  var user_chat = $('<div class="user_chat">Seja bem vindo!</div>');

  $("#messages-in").append(user_chat);

  $('#chat-messases').scrollTop($('#messages-in').height()+1000);

  client.publish('/users', {});
});

client.on('transport:down', function() {
  client.publish('/disconect-user', window._user);
});

client.subscribe('/disconected-user', function(user) {
  var user_chat = $('<div class="user_chat"><strong>' + user.name + ':</strong> você está offline....  </div>');

  $("#messages-in").append(user_chat);

  $('#online-users ul li#' + user.id).remove();
});
