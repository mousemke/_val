 # _val an irc bot, dogecoin tip bot, and all around good person.

erm.... bot.

v. 1.1.0

`requires node 10+`

## install

```
npm i val-bot
```

if you hit issues on mac with `node-icu-charset-detector` you may need xcode command line developer tools

`xcode-select --install`.

## Running val

+ Change the `_val.config.js` and `_val.modules.js` in `./config` where appropriate
+ `npm run serve`

Use `${trigger}help` for a list of commands.


## scripts


| `script` | description |
|----------|-------------|
| `npm run serve` | starts _val in Xvfb mode (recommended) |
| `npm run serveAlt` | starts _val in simple mode. nightmare commands may not work |
| `npm run away` | starts awaybot as a placeholder |



 If you would like to have _val running on your irc/slack/twitch/whatever in our hosting pool let us know.  The hosting pool is run on an EC2 instance and is funded only by donations.  It's a good way to have your bots running without having to worry about it.

All json configuration files are missing.  Be sure to copy the example files to the correct name.

 Feel free to donate to keep _val's hosting server up and running!

DOGE `D5tq8KaqQJjoeQJUG7CDy5NAWaEyjibrDo`

This project adheres to the [Contributor Covenant](http://contributor-covenant.org/). By participating, you are expected to honor this code.

 [_val - Code of Conduct](https://github.com/mousemke/_val/blob/master/CODE_OF_CONDUCT.md)

Need to report something? [mouse@knoblau.ch](mailto:mouse@knoblau.ch)


Change log
==========

#### 1.1.0

+ major updates to slack head
+ crypto markeets api update
+ admin updates
+ added support welcome messages
+ added CoC module
+ added a web api example
+ hipchat core module removed

#### 1.0.4

+ required node version updated


#### 1.0.3

+ Added dnd characters
+ Fish!
+ fish now triggers from a language parser
+ crypto ticker improvements
+ heads changed to disabled if not enabled: true,
+ ticker interval removal fixed …
+ BGG module created
+ bgg encoding fix
+ safety fix in bgg
+ (dev) added prettier
+ mtg api updates
+ gif api re-added
+ MTG module : better multiple and partial hit reporting
+ MTG : prices are float 2
+ More mtg tweaks
+ bgg module bugfix


#### 1.0.2

+ fixed a bug in doge tipping
+ added some plaintext commands
+ updated mtg card fetch formatting
+ updated slack interface
+ fixed a bug in trophy
+ removed harmony flag from server
+ made dnd die rolls case-insensitive


Older Changes
=============

To keep the length of this file down, [older changes are here](./older_changes.md)

