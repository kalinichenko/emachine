!function e(t,n,o){function i(s,r){if(!n[s]){if(!t[s]){var c="function"==typeof require&&require;if(!r&&c)return c(s,!0);if(a)return a(s,!0);var l=new Error("Cannot find module '"+s+"'");throw l.code="MODULE_NOT_FOUND",l}var u=n[s]={exports:{}};t[s][0].call(u.exports,function(e){var n=t[s][1][e];return i(n?n:e)},u,u.exports,e,t,n,o)}return n[s].exports}for(var a="function"==typeof require&&require,s=0;s<o.length;s++)i(o[s]);return i}({1:[function(e){"use strict";window.$=window.jQuery=e("jquery"),e("bootstrap");var t=e("rivets"),n=e("howler").Howl;new n({}),t.adapters[":"]={observe:function(e,t,n){e.on("change:"+t,n)},unobserve:function(e,t,n){e.off("change:"+t,n)},get:function(e,t){return e.get(t)},set:function(e,t,n){e.set(t,n)}},document.addEventListener("DOMContentLoaded",function(){var t=e("backbone"),n=e("./app");e("./apps/search"),e("./apps/favorites"),e("./apps/player"),e("./apps/menu"),n.start(),t.history.start()})},{"./app":2,"./apps/favorites":3,"./apps/menu":4,"./apps/player":5,"./apps/search":6,backbone:"backbone",bootstrap:"bootstrap",howler:"howler",jquery:"jquery",rivets:"rivets"}],2:[function(e,t){"use strict";var n,o;o=n=e("jquery");var i=e("backbone");i.$=n;var a=e("backbone.marionette"),s=new a.Application({regions:{menu:"#menu",content:"#content"}});s.navigate=function(e,t){t||(t={}),i.history.navigate(e,t)},s.commands.execute("menu:show"),t.exports=s},{backbone:"backbone","backbone.marionette":"backbone.marionette",jquery:"jquery"}],3:[function(e){"use strict";var t=e("../app"),n=e("backbone.marionette"),o=e("underscore"),i=e("../entities/favorites"),a=e("swipeout"),s=n.AppRouter.extend({appRoutes:{"":"list",favorites:"list"}}),r=n.ItemView.extend({tagName:"tr",template:"#favorite-tr-template",triggers:{"click .del":"favorite:del","click .play":"favorite:play"}}),c=n.CompositeView.extend({template:"#favorite-table-template",childView:r,childViewContainer:"tbody"}),l=n.ItemView.extend({tagName:"li",className:"fixed-height clipping-text",template:o.template("<%= sentence_eng %>"),triggers:{"delete":"favorite:del",click:"favorite:play"}}),u=n.CollectionView.extend({tagName:"ul",className:"list-unstyled list-bordered nav-stick row",childView:l,onShow:function(){new a(this.el)}}),d=n.ItemView.extend({template:"#favorites-empty-template",triggers:{"click .add":"search:show"}}),f={list:function(){t.commands.execute("menu:set-active",".favorites"),i.list().then(function(e){if(e.length>0){var n;n=/iPhone/i.test(navigator.userAgent)?new u({collection:e}):new c({collection:e}),n.on("childview:favorite:del",function(e){i.del(e.model.id)}),n.on("childview:favorite:play",function(e){t.trigger("player:show",e.model.id)}),t.content.show(n)}else{var o=new d;o.on("search:show",function(){t.trigger("search:show")}),t.content.show(o)}})}};t.on("favorite:list",function(){t.navigate("favorites"),f.list()}),t.addInitializer(function(){new s({controller:f})})},{"../app":2,"../entities/favorites":7,"backbone.marionette":"backbone.marionette",swipeout:"swipeout",underscore:"underscore"}],4:[function(e){"use strict";var t,n=e("../app"),o=e("backbone.marionette"),i=e("backbone"),a=e("jquery"),s=e("rivets"),r=e("../entities/favorites"),c=o.ItemView.extend({template:"#menu-template",tagName:"nav",className:"navbar navbar-default",attributes:{role:"navigation"},triggers:{"click .search":{event:"search:show",stopPropagation:!1},"click .player":{event:"player:show",stopPropagation:!1},"click .favorites":{event:"favorite:list",stopPropagation:!1}},events:{"click .collapse.in":"collapseMenu"},onShow:function(){this.binding=s.bind(this.$el,{model:this.model})},onDestroy:function(){this.binding.unbind()},collapseMenu:function(e){a(e.currentTarget).collapse("toggle")},setActive:function(e){this.$el.find(".active").removeClass("active"),this.$el.find(e).parent().addClass("active")}}),l={show:function(){n.menu.show(t)},setActive:function(e){t.setActive(e)}};r.list().then(function(e){function o(){a.set("favoriteCnt",e.length)}var a=new i.Model;o(),e.on("add remove",o),t=new c({model:a}),t.on("search:show",function(){n.trigger("search:show")}),t.on("player:show",function(){n.trigger("player:show")}),t.on("favorite:list",function(){n.trigger("favorite:list")}),n.commands.setHandler("menu:show",function(){l.show()}),n.commands.setHandler("menu:set-active",function(e){l.setActive(e)})})},{"../app":2,"../entities/favorites":7,backbone:"backbone","backbone.marionette":"backbone.marionette",jquery:"jquery",rivets:"rivets"}],5:[function(e){"use strict";var t=e("../app"),n=e("backbone.marionette"),o=e("../entities/favorites"),i=e("../entities/player"),a=e("rivets"),s=n.AppRouter.extend({appRoutes:{"player/:id":"show",player:"show"}}),r=n.ItemView.extend({template:"#player-template",ui:{playPause:".play-pause"},triggers:{"click .paused":"player:play","click .playing":"player:pause"},modelEvents:{"change:statusLoaded":"onLoaded","change:statusLoading":"onLoading","change:statusPlaying":"onPlaying","change:statusPaused":"onPaused"},onRender:function(){this.binding=a.bind(this.$el,{model:this.model})},onDestroy:function(){this.binding.unbind()},onPlaying:function(){this.model.get("statusPlaying")&&this.model.set("action","Pause")},onPaused:function(){this.model.get("statusPaused")&&this.model.set("action","Play")},onLoaded:function(){this.model.get("statusLoaded")&&this.ui.playPause.button("reset")},onLoading:function(){this.model.get("statusLoading")&&this.ui.playPause.button("loading")}}),c={show:function(e){t.commands.execute("menu:set-active",".player"),o.list().then(function(n){var o=new r({model:i.viewModel()});o.on("player:play",function(){i.play()}),o.on("player:pause",function(){i.pause()}),t.content.show(o);var a;e?a=n.get(e):i.viewModel().has("data")||(a=n.at(0)),a&&i.play(a)})}};t.on("player:show",function(e){t.navigate("player"+(e?"/"+e:"")),c.show(e)}),t.addInitializer(function(){new s({controller:c})})},{"../app":2,"../entities/favorites":7,"../entities/player":8,"backbone.marionette":"backbone.marionette",rivets:"rivets"}],6:[function(e){"use strict";var t=e("../app"),n=e("backbone.marionette"),o=e("backbone"),i=e("rivets"),a=e("underscore"),s=e("swipeout"),r=e("../entities/favorites"),c=e("../entities/search"),l=n.AppRouter.extend({appRoutes:{search:"show"}}),u=o.Marionette.LayoutView.extend({className:"finder",template:"#finder-layout-view-template",regions:{filter:".finder-filter",list:".finder-content"}}),d=n.ItemView.extend({className:"sentences-filter",template:"#filter-template",ui:{findButton:".sentences_filter-find"},events:{"click .sentences_filter-find":"onFind","keyup .sentences_filter-criteria":"onEnter"},loaded:function(){this.ui.findButton.button("reset")},onFind:function(){this.ui.findButton.button("loading"),this.trigger("sentences:find")},onEnter:function(e){13===e.keyCode&&this.onFind()},onShow:function(){this.binding=i.bind(this.$el,{model:this.model})},onDestroy:function(){this.binding.unbind()}}),f=n.ItemView.extend({template:"#sentences-empty-template"}),p=n.ItemView.extend({template:"#sentences-error-template",serializeData:function(){return this.model}}),h=n.ItemView.extend({tagName:"tr",template:"#sentence-template",triggers:{"click .sentence-add":"sentence:add"}}),m=n.CompositeView.extend({emptyView:f,childView:h,childViewContainer:"tbody",collectionEvents:{remove:"render"},template:"#sentence-list-template"}),v=n.ItemView.extend({tagName:"li",className:"fixed-height clipping-text",template:a.template("<%= sentence_eng %>"),triggers:{"delete":"sentence:add"}}),w=n.CollectionView.extend({tagName:"ul",className:"list-unstyled list-bordered row",childView:v,onShow:function(){new s(this.el,{btnText:"Add"})}}),b={show:function(){function e(){if(c.dataModel().has("sentences")){var e,t=c.dataModel().get("sentences");e=/iPhone/i.test(navigator.userAgent)?new w({collection:t}):new m({collection:t}),e.on("childview:sentence:add",function(e){r.add(e.model.attributes),t.remove(e.model)}),n.list.show(e)}}t.commands.execute("menu:set-active",".search");var n=new u;t.content.show(n);var o=new d({model:c.dataModel()});o.on("sentences:find",function(){c.list({success:function(t){o.loaded(),c.dataModel().set("sentences",t),e()},error:function(e,t){o.loaded();var i=new p({model:{status:t.status,statusText:t.statusText}});n.list.show(i)}})}),n.filter.show(o),e()}};t.on("search:show",function(){t.navigate("search"),b.show()}),t.addInitializer(function(){new l({controller:b})})},{"../app":2,"../entities/favorites":7,"../entities/search":9,backbone:"backbone","backbone.marionette":"backbone.marionette",rivets:"rivets",swipeout:"swipeout",underscore:"underscore"}],7:[function(e,t){"use strict";var n=e("jquery"),o=e("backbone");o.$=n,o.LocalStorage=e("backbone.localstorage");var i=e("underscore"),a=o.Model.extend({save:function(e,t){t||(t={}),e||(e=i.clone(this.attributes)),delete e.howl,t.data=JSON.stringify(e),o.Model.prototype.save.call(this,e,t)}}),s=o.Collection.extend({model:a,localStorage:new o.LocalStorage("emachine")}),r=function(){var e=new s,t=n.Deferred();return e.fetch({success:t.resolve,error:t.reject}),function(){return t.promise()}}();t.exports={list:function(){return r()},add:function(e){r().then(function(t){t.create(e)})},del:function(e){r().then(function(t){t.get(e).destroy()})}}},{backbone:"backbone","backbone.localstorage":"backbone.localstorage",jquery:"jquery",underscore:"underscore"}],8:[function(e,t){"use strict";function n(e){w.set(e,!0);for(var t in w.attributes)t!==e&&0===t.indexOf("status")&&w.set(t,!1)}function o(){n(m.PLAYING),l.howl.play()}function i(){n(m.PAUSED),l.timeoutId?(clearTimeout(l.timeoutId),delete l.timeoutId):l.howl.pause()}function a(){l.timeoutId?(clearTimeout(l.timeoutId),delete l.timeoutId):l.howl.stop()}function s(){var e=l.collection.indexOf(l),t=e+1<l.collection.length?e+1:0;return l.collection.at(t)}function r(){var e=1.25*l.howl._duration*1e3,t=setTimeout(function(){delete l.timeoutId,p>=2?(l=s(),u=s(),w.set("data",l.attributes),p=0):p++,l.howl.play()},e>h?e:h);l.timeoutId=t}function c(e,t){e.howl=new d({urls:["audio/"+e.id+".mp3"],onend:r,onload:function(){t&&t()},onloaderror:function(e){n(m.ERROR),w.set("errorType",e?e.type:"unknown")},onplay:function(){u.howl||c(u)}})}var l,u,d=e("howler").Howl,f=e("backbone"),p=0,h=3e3,m={ERROR:"statusError",LOADING:"statusLoading",LOADED:"statusLoaded",PLAYING:"statusPlaying",PAUSED:"statusPaused"},v=f.Model.extend({defaults:{action:"Pause"}}),w=new v;t.exports={remove:function(){},play:function(e){e?(w.has("data")&&w.get("data").id!==e.id&&a(),w.has("data")&&w.get("data").id===e.id||(l=e,u=s(),w.set({data:l.attributes}),l.howl?o():(n(m.LOADING),c(e,function(){n(m.LOADED),o()})))):o()},pause:function(){i()},viewModel:function(){return w}}},{backbone:"backbone",howler:"howler"}],9:[function(e,t){"use strict";var n=e("jquery"),o=e("backbone");o.$=n;var i=o.Model.extend({defaults:{searchCriteria:""}}),a=o.Model.extend({}),s=o.Collection.extend({model:a,url:"/sentences"}),r=new s,c=new i;t.exports={list:function(e){c.get("searchCriteria")&&(e.data={like:c.get("searchCriteria")}),r.fetch(e)},dataModel:function(){return c}}},{backbone:"backbone",jquery:"jquery"}]},{},[1]);