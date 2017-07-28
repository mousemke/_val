# _val an irc bot, dogecoin tip bot, and all around good person.

erm.... bot.

v. 1.0.0

`requires node 6.2.2+`

## install

```
npm i val-bot
```

## Running val

+ Change the `_val.config.js` and `_val.modules.js` in `./config` where appropriate
+ `npm run serve`

Use `+help` for a list of commands.


## scripts


| `script` | description |
|----------|-------------|
| `npm run serve` | starts _val in Xvfb mode (recommended) |
| `npm run serveAlt` | starts _val in simple mode. not all commands may work |
| `npm run away` | starts awaybot as a placeholder |



If you would like to have _val running on your irc/slack/twitch/whatever in our hosting pool let us know.  The hosting pool is run on an EC2 instance and is funded only by donations.  It's a good way to have your bots running without having to worry about it.

All json configuration files are missing.  Be sure to copy the example files to the correct name.

Feel free to donate to keep _val's hosting server up and running!

DOGE `DQiQ8e62CQGqx378EuS8i8gUW2mLkfBuXu`

This project adheres to the [Contributor Covenant](http://contributor-covenant.org/). By participating, you are expected to honor this code.

[_val - Code of Conduct](https://github.com/mousemke/_val/blob/master/CODE_OF_CONDUCT.md)

Need to report something? [mouse@knoblau.ch](mailto:mouse@knoblau.ch)


1.0.0 to do!
=========

+ dynamic commands
+ temporarily moved non working modules


Change log
==========

#### 1.0.0

+ val can no longer shoot itself
+ updated scripts to run Xvfb mode by default
+ multiple commanders from each core are now allowed
+ twitter core works
+ added core specific ability to disable modules
+ web api core added
+ updated question words
+ remove doge->tip ability to dm
+ updated 8ball and 4square
+ complete rebuild of how commands and responses are handled
+ module ini removed, now handled in the constructor
+ added imporoved help mode
+ modules are now classes
+ made syntax help available
+ website removed
+ twitter now trims to 140 chars and supports promises
+ listen to pm removed
+ xkcd bug fixed
+ awaybot updated
+ responses altered to support regex and dynamic commands
+ regex responses added
+ language parser module capabilities added
+ added awaybot npm script
+ switched market api
+ fixed plainText list responses
+ updated dnd module regex



Older Changes
=============

To keep the length of this file down, [older changes are here](./older_changes.md)

