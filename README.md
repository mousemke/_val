# _val an irc bot, dogecoin tip bot, and all around good person.

erm.... bot.

v. 1.0.0

`requires node 6.2.2+`

install

```
npm i val-bot
```

Go to `http://knoblau.ch/_val` for a list of commands.

If you would like to have _val running on your irc/slack/twitch/whatever in our hosting pool let us know.  The hosting pool is run on an EC2 instance and is funded only by donations.  It's a good way to have your bots running without having to worry about it.

All json configuration files are missing.  Be sure to copy the example files to the correct name.

Feel free to donate to keep _val's hosting server up and running!

DOGE `DQiQ8e62CQGqx378EuS8i8gUW2mLkfBuXu`

This project adheres to the [Contributor Covenant](http://contributor-covenant.org/). By participating, you are expected to honor this code.

[_val - Code of Conduct](https://github.com/mousemke/_val/blob/master/CODE_OF_CONDUCT.md)

Need to report something? [val@knoblau.ch](mailto:val@knoblau.ch)


Change log
==========

#### 1.0.0

+ complete rebuild of how commands and responses are handled
+ module ini removed, now handled in the constructor
+ added help mode
+ modules are now classes
+ made syntax help available


#### 0.4.0

+ added music module
+ expanded guys module
+ botNames are now different across different bots
+ guys module switched to regex
+ added some plain text options
+ added board game geek search
+ nico now rights whoever was flipped before someone else can be tagged
+ 8ball no longer checks case


#### 0.3.0

+ botText now supports promises
+ added dnd module
+ removed seen - given expansion into other command modules, this presents a security risk
+ seperated command modules
+ added the u conversations
+ slight xkcd organizatonial fixes
+ removed _bot.say when promises would be a better fit
+ added slack command module
+ added sayNow to command modules
+ started es6ification.  node requirements bumped to 6.2.2
+ all responses now get confObj passed from onMessage to say for the sake of switching between readable and programatic channel and user names
+ unscramble scoring removed.  doge can still be earned
+ comment updates everywhere


#### 0.2.13

+ fixed a blacklist bug
+ twitter module now accepts '*' as all users
+ twitter module now accepts '*' as all rooms
+ tweets limited to 140 characters
+ t-stream-filter now aliased to +t-stream
+ twitter streams now filter out retweets



Older Changes
=============

To keep the length of this file down, [older changes are here](./older_changes.md)

