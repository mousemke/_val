
module.exports  = function Admin( _bot, _modules, userConfig )
{
    var adminMessage            = userConfig.adminMessage,
        adminMessageInterval    = userConfig.adminMessageInterval,
        adminMessageChannels    = userConfig.adminMessageChannels || userConfig.channels,
        currentMessageInterval;

    return {

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


        ini : function()
        {
            this.setBroadcastMessage();
        },


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


        setMessageChannels : function( _text )
        {
            var channels = [];

            for ( var i = 0, lenI = _text.length; i < lenI; i++ )
            {
                if ( _text[ i ][ 0 ] === '#' )
                {
                    channels.push( _text[ i ] );
                }
            }

            if ( channels.length === 0  )
            {
                return 'No channels provided';
            }

            adminMessageChannels = channels;
            this.setBroadcastMessage();

            return 'New channels set';
        },


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
