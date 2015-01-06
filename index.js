'use strict';

var http = require('http');
var https = require('https');
var url = require('url');
var minimist = require('minimist');
var argv;
var port = 3000;
var host = '127.0.0.1';
var slackToken;
var groupRestrict;
var slackHost;

function startRollServer(port, ip, slackToken, slackHost, groupRestrict){
  var server = http.createServer(function(req, res){
    var parsed = url.parse(req.url, true);
    
    if(typeof groupRestrict !== 'undefined'  && parsed.query.team_id !== groupRestrict){
      return res.end('');
    }

    if(parsed.pathname === '/roll'){
      var echoChannel = parsed.query.channel_id;
      var roll = require("./roll");

      console.log('request', req.url);
      var rollResult = roll.roll(parsed.query.text);

      var output = JSON.stringify({
        text: parsed.query.user_name + rollResult,
        username: 'dungeonmaster',
        icon_emoji: ':dm:',
        channel: echoChannel
      });

      console.log('sending to webhook', output);
      
      var post = https.request({
        host: slackHost,
        path: '/services/hooks/incoming-webhook?token='+slackToken,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': output.length
        }
      }, function(res){
        res.setEncoding('utf8');
        res.on('data', function(chunk){
          console.log('response', chunk);
        });
      });

      post.write(output);
      post.end();

      res.end('');

    } else {
      res.end('nope');
    }
  });
  server.listen(port, ip);
  console.log('listening on', ip+':'+port)
}

if(!module.parent){
  argv = minimist(process.argv.slice(2));
  host = argv.host || host;
  port = argv.port || port;
  groupRestrict = argv.group || groupRestrict;
  slackHost = argv.slack || slackHost;
  slackToken = argv.token || slackToken;

  if(typeof slackToken === 'undefined' || typeof slackHost === 'undefined'){
    console.log('You need a slack token and a slack hostname to continue');
  }

  startRollServer(port, host, slackToken, slackHost, groupRestrict);
}
