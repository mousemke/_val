

function JL_Ranking(e){var t=this,o=t.init(e);t.logToConsoleCookieName="JL_Ranking_log_to_console",t.logToConsole=JL_UTIL._isConsoleCookieExists(t.logToConsoleCookieName),t.log("initialized with "+o+" params."),t.log("Ranker initialized with "+o+" parameters\n     - cid        :"+t.params.cid+"\n    - user id    :"+t.params.id+"\n     - limit      :"+t.params.limit+"\n  - campaign   :"+t.params.campaign+"\n   - feed id    :"+t.params.feed+"\n   - type       :"+t.type)}JL_RANKER={init:function(e){JL_RANKER.ranker=new JL_Ranking(e),JL_RANKER.get_products=JL_RANKER.ranker.get_products.bind(JL_RANKER.ranker),JL_RANKER.get_promos=JL_RANKER.ranker.get_promos.bind(JL_RANKER.ranker),JL_RANKER.get_catalogs=JL_RANKER.ranker.get_catalogs.bind(JL_RANKER.ranker),JL_RANKER.get_layout=JL_RANKER.ranker.get_layout.bind(JL_RANKER.ranker),JL_RANKER.rank_products=JL_RANKER.ranker.rank_products.bind(JL_RANKER.ranker)},id:0},JL_Ranking.prototype.init=function(e){var t=this;t.params=t.params?t.params:{},t.client_callback=t.client_callback?t.client_callback:{};var o=0,n=!1;return JL_UTIL._traverseObject(e,function(e,r){switch(o++,e){case"callback":n=r;break;case"type":t.type=r;break;case"feed":t.params.feed=r;break;case"mode":t.params.mode=r;break;case"data":break;case"jl_context":break;case"product_id":var i=r.toString();i&&(t.params[e]=i,t.params.mode||(t.params.mode="product_specific"));break;default:t.params[e]=r}}),t.type="undefined"==typeof t.type?"json":t.type,t.params.id=""!==t.params.id?t.params.id:"undefined",n.constructor==Function&&t._set_callback(n),o},JL_Ranking.prototype.get_products=function(e,t){var o=this;o._get_response(o._buildOffersUrl,e,t)},JL_Ranking.prototype.rank_products=function(e,t){var o=this,n="undefined"!=typeof e&&e.constructor==Function?e:t,r="undefined"!=typeof t&&t.constructor==Object?t:e,i="undefined"!=typeof n&&n.constructor==Function?n:function(){},a="undefined"!=typeof r&&r.constructor==Object?r:{};a.type="rank_json",a.mode="sort_by_relevance",a.limit=a.product_ids.length,a.product_id=a.product_ids.slice(0,150),delete a.product_ids,o._get_response(o._buildOffersUrl,i,a)},JL_Ranking.prototype.get_promos=function(e,t){var o=this,n="undefined"!=typeof e&&e.constructor==Function?e:t,r="undefined"!=typeof t&&t.constructor==Object?t:e,i="undefined"!=typeof n&&n.constructor==Function?n:function(){},a="undefined"!=typeof r&&r.constructor==Object?r:{};a.type="promos_json";var s=a.feed?a.feed:o.params.feed;a.layout=o._get_layout_config(a.collection,a.dimension,a.limit,s),o.log("get promos params",a),o._get_response(o._buildLayoutUrl,i,a)},JL_Ranking.prototype.get_catalogs=function(e,t){var o=this,n="undefined"!=typeof e&&e.constructor==Function?e:t,r="undefined"!=typeof t&&t.constructor==Object?t:e,i="undefined"!=typeof n&&n.constructor==Function?n:function(){},a="undefined"!=typeof r&&r.constructor==Object?r:{};a.type="promos_json";var s=a.feed?a.feed:o.params.feed;a.layout=o._get_layout_config(a.layer,a.tile,a.limit,s),o.log("get promos params",a),o._get_response(o._buildLayoutUrl,i,a)},JL_Ranking.prototype.get_layout=function(e,t){var o=this,n="undefined"!=typeof e&&e.constructor==Function?e:t,r="undefined"!=typeof t&&t.constructor==Object?t:e,i="undefined"!=typeof n&&n.constructor==Function?n:function(){},a="undefined"!=typeof r&&r.constructor==Object?r:{};a.type="layout_json",o.log("get layout params",a),o._get_response(o._buildLayoutUrl,i,a)},JL_Ranking.prototype._get_response=function(e,t,o){var n=this,r="undefined"!=typeof t&&t.constructor==Function?t:o,i="undefined"!=typeof o&&o.constructor==Object?o:t;"undefined"!=typeof i&&i.constructor==Object&&n.init(i),"undefined"!=typeof r&&r.constructor==Function&&n._set_callback(r);var a=e(n,JL_RANKER.id);JL_UTIL._jsonp(n,a)},JL_Ranking.prototype._get_layout_config=function(e,t,o,n){var r={feed:n,sections:[{id:-1,type:"promo",collection:e,tile:t,limit:o}]};return JSON.stringify(r)},JL_Ranking.prototype._set_callback=function(e){var t=this;JL_RANKER.id=JL_RANKER.id+1;var o=t._get_callback_name(JL_RANKER.id);JL_RANKER[o]=t[t._get_callback_name("")](e)},JL_Ranking.prototype._callback_json=function(e){var t=this;return function(o){t.log("received api response, sending json response");var n=o.deals.map(function(e){var t=e;return t.current_price=t.current_price/100,t.original_price=t.original_price/100,t});e(n)}},JL_Ranking.prototype._callback_layout_json=function(e){var t=this;return function(o){t.log("received layout api response, sending json response"),e(o)}},JL_Ranking.prototype._callback_promos_json=function(e){var t=this;return function(o){t.log("received layout api response, sending json response"),e({data:o.sections[0].promos})}},JL_Ranking.prototype._callback_rank_json=function(e){var t=this;return function(o){t.log("received rank api response, sending json response");var n=o.deals.map(function(e){return e.id});e(n)}},JL_Ranking.prototype._callback_html=function(e){var t=this;return function(o){var n=t._build_dom(o,t._build_img_object);e(n),t.log("received api response, building dom response")}},JL_Ranking.prototype._build_dom=function(e,t){var o=[];for(var n in e.deals)o.push(t(e.deals[n]));return o},JL_Ranking.prototype._build_img_object=function(e){var t=document.createElement("a");t.setAttribute("class","jl-product-link"),t.setAttribute("href",e.url);var o=document.createElement("img");return o.setAttribute("class","jl-product-img"),o.setAttribute("id","jl-on-site-"+e.id),o.setAttribute("alt",e.title),o.setAttribute("src",e.img),t.appendChild(o),t},JL_Ranking.prototype._get_callback_name=function(e){var t=this;return"_callback_"+t.type+e},JL_Ranking.prototype._buildUrl=function(e,t,o){var n=JL_UTIL._objectToQueryString(e.params),r="callback=JL_RANKER."+e._get_callback_name(t);return o+"?"+n+r},JL_Ranking.prototype._buildOffersUrl=function(e,t){return e._buildUrl(e,t,e.offersEndpoint)},JL_Ranking.prototype._buildLayoutUrl=function(e,t){return e._buildUrl(e,t,e.layoutEndpoint)},JL_Ranking.prototype.enableLog=function(){var e=this;e.logToConsole=!0,e.log("Stored enable log to console 'marker' cookie. Will expire in 1800000 milliseconds"),JL_UTIL._setCookie(e.logToConsoleCookieName,(new Date).getTime(),18e5),e.log("JL logging Enabled")},JL_Ranking.prototype.disableLog=function(){var e=this;e.log("Removed enable log to console 'marker' cookie"),e.logToConsole=!1,e.log("Stored enable log to console 'marker' cookie. Will expire in -1800000 milliseconds"),JL_UTIL._setCookie(e.logToConsoleCookieName,(new Date).getTime(),-18e5),e.log("JL logging Disabled")},JL_Ranking.prototype.log=function(e){var t=this;t.logToConsole&&window.console&&window.console.log&&console.log(e)},JL_UTIL={_traverseObject:function(e,t){for(var o in e)e.hasOwnProperty(o)&&t(o,e[o])},_objectToQueryString:function(e){var t="";return this._traverseObject(e,function(e,o){"object"==typeof o?JSON.stringify(o):o;t+=encodeURIComponent(e)+"="+encodeURIComponent(o)+"&"}),t},_jsonp:function(e,t){var o=document.createElement("script");o.type="text/javascript",o.src=t,o.async=!0,document.getElementsByTagName("head")[0].appendChild(o),e.log("SENT JSONP request: "+t)},_getUTCTime:function(){return new Date(this.getUTCFullYear(),this.getUTCMonth(),this.getUTCDate(),this.getUTCHours(),this.getUTCMinutes(),this.getUTCSeconds()).getTime()},_getCookie:function(e){for(var t=e+"=",o=document.cookie.split(";"),n=0;n<o.length;n++){for(var r=o[n];" "===r.charAt(0);)r=r.substring(1);if(0===r.indexOf(t))return r.substring(t.length,r.length)}return""},_setCookie:function(e,t,o){var n=new Date;n.setTime(n.getTime()+o);var r="expires="+n.toUTCString();document.cookie=e+"="+t+"; Path=/; "+r},_isConsoleCookieExists:function(e){return""!==JL_UTIL._getCookie(e)}},JL_Ranking.prototype.offersEndpoint="https://api.jetlore.com/offers/offers.json",JL_Ranking.prototype.layoutEndpoint="https://api.jetlore.com/layouts/layout.json"; // eslint-ignore-line

const Module        = require( './Module.js' );
const DEALS_LIMIT   = 10;


class Jetlore extends Module
{
    /**
     * ## constructor
     *
     * sets a customer id and initializes the jetlore sdk
     */
    constructor()
    {
        super();

        this.customerId = this.getCustomerId();

        JL_RANKER.init(
        {
            cid     : 'b7a4bc084ffec88a2c8fe716ad3297ea',
            id      : this.customerId
        } );
    }


    /**
     * ## getCustomerId
     *
     * retrieves the customer id from the cookies, or returns a blank string
     * for anonymous
     *
     * @return {String} customer id or empty string
     */
    getCustomerId()
    {
        // if ( SE && SE.userId )
        // {
        //     return SE.userId;
        // }

        return '';
    }


    /**
     * ## getBeat
     *
     * if called, this returns the current time converted to beats
     *
     * @return {String} current beat
     */
    getJetloreDeals()
    {
        const productId = null;
        // const productId = SE && SE.saleId ? SE.saleId : null;

        const rankerOptions = {
            limit       : DEALS_LIMIT,
            secure      : true,
            product_id  : productId,
            jl_add_info : 'true',
            filter      : {
                active : true
            }
        };


        return new Promise( ( resolve, reject ) =>
        {
            JL_RANKER.get_products(
                rankerOptions,
                deals =>
                {
                    resolve( this.processJetloreDeals( deals ) );
                }
            );
        } );
    }


    /**
     * ## processJetloreDeals
     *
     * filter we may in the future need to do
     *
     * @param {Object} deals all returned deals from the api
     */
    processJetloreDeals( deals )
    {
        return deals;
    }


    /**
     * ## responses
     */
    responses()
    {
        const { 
            trigger
        } = this.userConfig;

        return {
            travel      : {
                f           : this.getJetloreDeals,
                desc        : 'where would you like to go?',
                syntax      : [
                    `${trigger}travel`
                ]
            }
        };
    }
};

module.exports = Jetlore;
