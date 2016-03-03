Older changes
=============

This is truncated from the readme file to keep down the size

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


#### 0.1.5
+ added 'seen' to _val core
+ added 'food' alias for 4sq
+ changed nico module command from man to person
+ folded guys module into core
+ aliased ++y to ++yell
+ changes to core
+ bug fixes

####  0.1.4
+ added cards against humanity module
+ added donation wallets
+ added support for username prefixes (@username, etc)
+ added 4sq-range and foursquare module tweaks
+ added admin:yell
+ added admin:down
+ added module guys.js
+ aliased doge:soak to doge:makeitrain

####  0.1.3
+ added twitch module
+ added admin module
+ words and anagramm both can reward in Doge!
+ added /games directory for league and online game info
+ admin module now supports timed, repeating broadcasts
+ word and anagramm now recalculate newWord active numbers each time, even for people that have already voted
+ added wallet command to doge
+ plainText additions


####  0.1.2
+ reorganized module loading and introduced config/_val.modules.js for enhanced dynamic module loading
+ cleaned lots of code
+ new plaintext commands \o/
+ plaintext reorganization
+ dodge moved to plaintext
+ pool becomes its own modules
+ all modules passed as _modules to each for dynamic interconnectedness
+ awaybot updated
+ active moved to core functionality
+ refactored basic module building and commands for better dynamics
+ disabled all pm commands ahead of refactoring


####  0.1.1
+ added nico module with dynamic nicoing
+ added version command
+ awaybot exists