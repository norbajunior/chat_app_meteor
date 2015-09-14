var http = require('http'),
    faye = require('faye'),
    redis = require('redis');

var server = http.createServer(),
    bayeux = new faye.NodeAdapter({mount: '/'}),
    redisClient = redis.createClient();

bayeux.attach(server);
server.listen(3000);

var client = new faye.Client('http://localhost:3000');

process.stdin.resume();

client.subscribe('/messages', function(message) {
  console.log('Got a message: ' + message.text);
});

client.subscribe('/users', function(user) {
  if (Object.keys(user).length != 0) {
    redisClient.hset("users", user.id, user.name);
  }

  redisClient.hgetall("users", function (error, users) {
    client.publish('/online-users', users);
  });
});

client.subscribe('/disconect-user', function(user) {
  redisClient.hdel('users', user.id);

  console.log(user.name + ' está offline');

  client.publish('/disconected-user', user);
});

process.on('SIGINT', function() {
  redisClient.del('users');
  console.log('Chat desconectado ...');
  process.exit(2);
});
