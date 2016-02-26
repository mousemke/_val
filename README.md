# _val an irc bot, dogecoin tip bot, and all around good person.

erm.... bot.

v. 0.2.10

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

#### 0.2.6

+ command is now generated in _val and passed to responses


#### 0.2.5

+ fixed a twitter bug
+ rr can now target people
+ changed the doge/market api
+ removed old CAH json


#### 0.2.4

+ rebuilt words and anagramm
+ version is now loaded from package.json
+ added activeWord object
+ added rr
+ fixed bad country code queries in words
+ added an option to words to enable def and translation
+ reenabled most twitter feeds


#### 0.2.3

+ built safeties around the bot ignore list
+ further abstracted slack connections
+ fixed balance bank
+ added popkey content filter
+ added notice colors
+ bumped node irc version


#### 0.2.2

+ pool module removed
+ verbose mode added
+ admin message broadcast re worked
+ added twitter module
+ fixed +gif to accept apostrophes
+ added emergencyfetti
+ added balance bank
+ fixed unscramble and anagramm doge payout
+ changed package name to val-bot for npm compatability


#### 0.2.1

+ slight changes to apiGet to allow headers
+ added troll word blacklist
+ updated nico module
+ added popkey module to handle gif
+ updated +gif to use a gif api
+ added 8ball


#### 0.2.0

+ fixed a bug inactive where bots registered
+ all command can now be passed as whispers
+ whispers now accept triggered input as well
+ added autojoin for Slack
+ completely rebuilt the internal structure
+ added safeties to apiGet for before the bot is running
+ added +test


Older Changes
=============

To keep the length of this file down, [older changes are here](./older_changes.md)

