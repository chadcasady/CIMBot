var Botkit = require('botkit')

var token = process.env.SLACK_TOKEN

var controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

// Assume single team mode if we have a SLACK_TOKEN
if (token) {
  console.log('Starting in single-team mode')
  controller.spawn({
    token: token
  }).startRTM(function (err, bot, payload) {
    if (err) {
      throw new Error(err)
    }

    console.log('Connected to Slack RTM')
  })
// Otherwise assume multi-team mode - setup beep boop resourcer connection
} else {
  console.log('Starting in Beep Boop multi-team mode')
  require('beepboop-botkit').start(controller, { debug: true })
}

controller.on('bot_channel_join', function (bot, message) {
  bot.reply(message, "I'm here!")
})

controller.hears(['hipaa', 'phi'], ['direct_mention', 'direct_message', 'mention'], function (bot, message) {
  bot.reply(message, 'HIPAA (with one P and two A\'s), is not really an issue here since I\'m not sharing PHI.')
  bot.reply(message, 'Don\'t be so paranoid. Sheesh.')
})

controller.hears(['hello', 'hi'], ['direct_mention', 'mention'], function (bot, message) {
  bot.reply(message, 'Hola amigo!')
  bot.reply(message, 'Or is it amiga? I\'m not smart enough to know just yet.')
})

controller.hears(['amiga', 'amigo'], ['direct_mention', 'mention'], function (bot, message) {
  bot.reply(message, 'Good to know. Moving on now.')
})

controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Well hi there!')
  bot.reply(message, 'It\'s nice to talk to you directly.')
})

controller.hears(['thanks', 'thank you'], ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  bot.reply(message, 'Don\'t mention it. :thumbsup:')
})

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You really do care about me. :heart:')
})

controller.hears('help', ['direct_message', 'direct_mention', 'mention'], function (bot, message) {
  bot.reply(message, 'Helping is exactly what I\'m here to do! :sunglasses: :thumbsup:')
  bot.reply(message, 'If you want me to find a referral, just ask. Otherwise, I\'m just here to look pretty.')
})

controller.hears(['eligibility', 'member', 'claim'], ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sounds complex. I\'m afraid I don\'t know how to deal with that stuff yet.')
})

controller.hears(['referral'], ['direct_message', 'direct_mention'], function(bot,message) {
    askReferral = function(response, convo) {
      convo.ask('Do you want me to find a referral for you?', [
        {
          pattern: bot.utterances.yes,
          callback: function(response, convo) {
            convo.say('Great!');
            askWhichRef(response, convo);
            convo.next();
          }
        },
        {
          pattern: bot.utterances.no,
          callback: function(response, convo) {
            convo.say('No problem. Let me know if you change your mind.');
            convo.next();
          }
        }
        ]);
      };
    askWhichRef = function(response, convo) {
      convo.ask('What\'s the referral number you want me to find?', function(response, convo) {
        convo.say('Searching...')
        askWhereDeliver(response, convo);
        convo.next();
      }, {'key': 'referralID'});
    }
    askWhereDeliver = function(response, convo) {
      convo.ask('Do you want referral # ' + convo.extractResponse('referralID') + ' delivered by email, or just include a link to it here?', [
        {
          pattern: 'email',
          callback: function(response, convo) {
            convo.say('Ha! I\'m not that smart yet. Here\'s a fake link instead:');
            reflinkmsg = 'https://cimdemo.phtech.com?referral_id=' + convo.extractResponse('referralID');
            convo.say(reflinkmsg);
            convo.say('My work here is done. :raised_hands:');
            convo.next();
          }
        },
        {
          pattern: 'link',
          callback: function(response, convo) {
            convo.say('Here\'s the fake link to your referral:');
            reflinkmsg = 'https://cimdemo.phtech.com?referral_id=' + convo.extractResponse('referralID');
            convo.say(reflinkmsg);
            convo.say('My work here is done. :raised_hands:');
            convo.next();
          }
        },
        {
          default: true,
          callback: function(response, convo) {
            convo.say('Here\'s the fake link anyway:');
            reflinkmsg = 'https://cimdemo.phtech.com?referral_id=' + convo.extractResponse('referralID');
            convo.say(reflinkmsg);
            convo.say('My work here is done. :raised_hands:');
            convo.next();
          }
        }
        ]);
    }

    bot.startConversation(message, askReferral);
});

controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
  var text = 'CIM Bot is a silly bot that doesn\'t do much really.'
  var attachments = [{
    fallback: text,
    pretext: 'I ain\'t that smart. :sunglasses: :thumbsup:',
    title: 'Obligatory link to the PH Tech web site here.',
    image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
    title_link: 'https://phtech.com/',
    text: text,
    color: '#7CD197'
  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
})

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
})
