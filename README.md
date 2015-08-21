# _val an irc bot, dogecoin tip bot, and all around good person.

erm.... bot.

v. 0.2.0

Go to http://knoblau.ch/_val for a list of commands.

If you would like to have _val running on your irc/slack/twitch/whatever in our hosting pool let us know.  The hosting pool is run on an EC2 instance and is funded only by donations.  It's a good way to have your bots running without having to worry about it.

All json files are missing.  Be sure to copy the example files to the correct name.

Feel free to donate to keep _val's hosting server up and running!

BTC  17KYpA1dL32nwwRE47Xj2V5Pb9GNEcByan

DOGE DQiQ8e62CQGqx378EuS8i8gUW2mLkfBuXu


**Change log**

0.2.0 -
+ fixed a bug inactive where bots registered
+ all command can now be passed as whispers
+ whispers now accept triggered input as well
+ added autojoin for Slack
+ completely rebuilt the internal structure
+ added safeties to apiGet for before the bot is running
+ added +test

0.1.5 -
+ added 'seen' to _val core
+ added 'food' alias for 4sq
+ changed nico module command from man to person
+ folded guys module into core
+ aliased ++y to ++yell
+ changes to core
+ bug fixes

0.1.4 -
+ added cards against humanity module
+ added donation wallets
+ added support for username prefixes (@username, etc)
+ added 4sq-range and foursquare module tweaks
+ added admin:yell
+ added admin:down
+ added module guys.js
+ aliased doge:soak to doge:makeitrain

0.1.3 -
+ added twitch module
+ added admin module
+ words and anagramm both can reward in Doge!
+ added /games directory for league and online game info
+ admin module now supports timed, repeating broadcasts
+ word and anagramm now recalculate newWord active numbers each time, even for people that have already voted
+ added wallet command to doge
+ plainText additions


0.1.2 -
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


0.1.1 -
+ added nico module with dynamic nicoing
+ added version command
+ awaybot exists
