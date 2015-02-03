
module.exports  = function Admin( _bot, _modules, userConfig )
{
    var adminMessage            = userConfig.adminMessage,
        adminMessageInterval    = userConfig.adminMessageInterval,
        adminMessageChannels    = userConfig.adminMessageChannels || userConfig.channels,
        currentMessageInterval;

    return {


        /**
         * displays info on the current message
         *
         * @return {str}                                message info
         */
        displayMessageInfo : function()
        {
            if ( adminMessage === '' )
            {
                return 'Broadcast message disabled';
            }

            var _text = '"' + adminMessage + '" - sent to:';

            for ( var i = 0, lenI = adminMessageChannels.length; i < lenI; i++ )
            {
                _text += ' ' + adminMessageChannels[ i ];
            }

            _text += ' - every ' + adminMessageInterval + 'ms (' + ( ( adminMessageInterval / 1000 ) / 60 ) + 'min)';

            return  _text;
        },


        /**
         * clears (if necessary) and sets the interval timer
         *
         * @return {void}
         */
        setBroadcastMessage : function()
        {
            var sayTheThing = function()
            {
                for ( var i = 0, lenI = adminMessageChannels.length; i < lenI; i++ )
                {
                    _bot.say( adminMessageChannels[ i ], adminMessage );
                }
            };

            if ( currentMessageInterval )
            {
                clearInterval( currentMessageInterval );
            }

            if ( adminMessage  )
            {
                currentMessageInterval = setInterval( sayTheThing, adminMessageInterval );
            }
        },


        /**
         * sets the initial timer
         *
         * @return {void}
         */
        ini : function()
        {
            this.setBroadcastMessage();
        },


        /**
         * admin responses
         *
         * @param  {str}            from                originating channel
         * @param  {str}            to                  originating user
         * @param  {str}            text                full input string
         * @param  {str}            botText             text to say
         *
         * @return {str}                                changed botText
         */
        responses : function( from, to, text, botText )
        {
            if ( userConfig.admins.indexOf( to.toLowerCase() ) !== -1 )
            {
                var command     = text.split( ' ' );
                var textSplit   = text.split( ' ' ).slice( 1 );
                if ( typeof command !== 'string' )
                {
                    command = command[0];
                }
                command = command.slice( 2 );

                switch ( command )
                {
                    case 'v':
                        botText = 'Well, ' + to + ', thanks for asking!  I\'m currently running version ' + userConfig.version;
                        break;

                    case 'm':
                        botText = this.setMessage( textSplit );
                        break;
                    case 'm-info':
                        botText = this.displayMessageInfo();
                        break;
                    case 'm-interval':
                        botText = this.setMessageRepeat( textSplit );
                        break;
                    case 'm-channels':
                        botText = this.setMessageChannels( textSplit );
                        break;
                    case 'm-cancel':
                    case 'm-clear':
                        botText = botText = this.setMessage( [ '' ] );
                        break;
                }
            }

            return botText;
        },


        /**
         * sets the broadcast message text then resets the interval
         *
         * @param {arr}             _text               new message text
         *
         * @return {str}                                text to say
         */
        setMessage : function( _text )
        {
            _text = _text.join( ' ' );

            adminMessage = _text;
            this.setBroadcastMessage();

            if ( _text === '' )
            {
                return 'Broadcast message cleared';
            }

            return 'Broadcast message set.';
        },


        /**
         * sets the broadcast message channels then resets the interval
         *
         * @param {arr}             _text               new message channels
         *
         * @return {str}                                text to say
         */
        setMessageChannels : function( _text )
        {
            var text, channels = [];

            for ( var i = 0, lenI = _text.length; i < lenI; i++ )
            {
                if ( _text[ i ][ 0 ] === '#' )
                {
                    channels.push( _text[ i ] );
                }
            }

            if ( channels.length === 0  )
            {
                adminMessageChannels = userConfig.adminMessageChannels || userConfig.channels;
                text = 'Messages set back to default';
            }
            else
            {
                adminMessageChannels = channels;
                text = 'New channels set';
            }

            this.setBroadcastMessage();

            return text;
        },


        /**
         * sets the broadcast message interval time then resets the interval
         *
         * @param {arr}             _text               new message time (in ms)
         *
         * @return {str}                                text to say
         */
        setMessageRepeat : function( _text )
        {
            if ( _text )
            {
                _text = parseInt( _text[ 0 ] );
            }
            else
            {
                _text = false;
            }

            if ( ! _text || typeof _text !== 'number'  )
            {
                return 'That\'s not a valid timeout';
            }

            adminMessageInterval = _text;
            this.setBroadcastMessage();

            return 'New Interval set';
        }
    };
};
