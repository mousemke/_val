# _val an irc bot, dogecoin tip bot, and all around good person.

erm.... bot.

v. 0.3.0

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

#### 0.3.0

<<<<<<< HEAD
+ botText now supports promises
=======
+ added dnd module
+ removed seen - given expansion into other command modules, this presents a security risk
>>>>>>> cbf5d431726a6a138e0f1b9db25da86944d24fe9
+ seperated command modules
+ added the u conversations
+ slight xkcd organizatonial fixes


#### 0.2.13

+ fixed a blacklist bug
+ twitter module now accepts '*' as all users
+ twitter module now accepts '*' as all rooms
+ tweets limited to 140 characters
+ t-stream-filter now aliased to +t-stream
+ twitter streams now filter out retweets


#### 0.2.11

+ 8ball fixed
+ question words updated


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



Older Changes
=============

To keep the length of this file down, [older changes are here](./older_changes.md)

