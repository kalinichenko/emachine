!function e(t,n,o){function i(a,s){if(!n[a]){if(!t[a]){var c="function"==typeof require&&require;if(!s&&c)return c(a,!0);if(r)return r(a,!0);var l=new Error("Cannot find module '"+a+"'");throw l.code="MODULE_NOT_FOUND",l}var u=n[a]={exports:{}};t[a][0].call(u.exports,function(e){var n=t[a][1][e];return i(n?n:e)},u,u.exports,e,t,n,o)}return n[a].exports}for(var r="function"==typeof require&&require,a=0;a<o.length;a++)i(o[a]);return i}({1:[function(e){"use strict";window.$=window.jQuery=e("jquery");e("bootstrap");document.addEventListener("DOMContentLoaded",function(){var t=e("backbone"),n=e("./app");e("./entities/favorites"),e("./entities/sentences"),e("./entities/player"),e("./apps/search"),e("./apps/favorites"),e("./apps/player"),e("./apps/menu"),n.start(),t.history.start()})},{"./app":2,"./apps/favorites":3,"./apps/menu":4,"./apps/player":5,"./apps/search":6,"./entities/favorites":7,"./entities/player":8,"./entities/sentences":9,backbone:"backbone",bootstrap:"bootstrap",jquery:"jquery"}],2:[function(e,t){"use strict";var n,o;o=n=e("jquery");var i=e("backbone");i.$=n;var r=e("backbone.marionette"),a=new r.Application({regions:{menu:"#menu",content:"#content"}});a.navigate=function(e,t){t||(t={}),i.history.navigate(e,t)},a.commands.execute("menu:show"),t.exports=a},{backbone:"backbone","backbone.marionette":"backbone.marionette",jquery:"jquery"}],3:[function(e){"use strict";var t=e("../app"),n=e("backbone.marionette"),o=e("underscore"),i=e("jquery"),r=e("../entities/favorites"),a=n.AppRouter.extend({appRoutes:{"":"list",favorites:"list"}}),s=n.ItemView.extend({tagName:"tr",template:o.template(i("#favorite-template").html()),triggers:{"click @ui.del":"favorite:del","click .play":"favorite:play"},ui:{$del:".del"},events:{swipe:"swipeMe",swipeleft:"showDel",swiperight:"hideDel"},swipeMe:function(e){alert("swiped "+e.direction)},showDel:function(){this.ui.$del.show()},hideDel:function(){this.ui.$del.hide()}}),c=n.CompositeView.extend({className:"favorites",childView:s,childViewContainer:"tbody",template:o.template(i("#favorites-template").html())}),l=n.ItemView.extend({template:o.template(i("#favorites-empty-template").html()),triggers:{"click #add":"search:show"}}),u={list:function(){t.commands.execute("menu:set-active",".favorites"),r.list().then(function(e){var n;e.length>0?(n=new c({collection:e}),n.on("childview:favorite:del",function(e){r.del(e.model.id)}),n.on("childview:favorite:play",function(e){t.trigger("player:show",e.model.id)})):(n=new l,n.on("search:show",function(){t.trigger("search:show")})),t.content.show(n)})}};t.on("favorite:list",function(){t.navigate("favorites"),u.list()}),t.addInitializer(function(){new a({controller:u})})},{"../app":2,"../entities/favorites":7,"backbone.marionette":"backbone.marionette",jquery:"jquery",underscore:"underscore"}],4:[function(e){"use strict";var t=e("../app"),n=e("backbone.marionette"),o=e("jquery"),i=n.ItemView.extend({template:"#menu-template",triggers:{"click .search":"search:show","click .player":"player:show","click .favorites":"favorite:list"},events:{"click .nav a":"onClick"},onClick:function(e){this.$el.find(".active").removeClass("active"),o(e.target).parent().addClass("active"),this.$el.find(".collapse.in").collapse("toggle")},setActive:function(e){this.$el.find(".active").removeClass("active"),this.$el.find(e).parent().addClass("active")}}),r=new i,a={show:function(){r.on("search:show",function(){t.trigger("search:show")}),r.on("player:show",function(){t.trigger("player:show")}),r.on("favorite:list",function(){t.trigger("favorite:list")}),t.menu.show(r)},setActive:function(e){r.setActive(e)}};t.commands.setHandler("menu:show",function(){a.show()}),t.commands.setHandler("menu:set-active",function(e){a.setActive(e)})},{"../app":2,"backbone.marionette":"backbone.marionette",jquery:"jquery"}],5:[function(e){"use strict";var t=e("../app"),n=e("backbone.marionette"),o=e("underscore"),i=e("jquery"),r=e("../entities/favorites"),a=e("../entities/player"),s=n.AppRouter.extend({appRoutes:{"player/:id":"show",player:"show"}}),c=n.ItemView.extend({template:o.template(i("#player-template").html()),modelEvents:{change:"fieldsChanged"},triggers:{"click .play-pause":"player:play-pause"},fieldsChanged:function(){this.render()}}),l={show:function(e){t.commands.execute("menu:set-active",".player"),r.list().then(function(n){var o;e?o=n.get(e):a.viewModel().has("id")||(o=n.at(0)),o&&a.play(o);var i=new c({model:a.viewModel()});i.on("player:play-pause",function(){"playing"===i.model.get("status")?a.pause():a.play()}),t.content.show(i)})}};t.on("player:show",function(e){t.navigate("player"+(e?"/"+e:"")),l.show(e)}),t.addInitializer(function(){new s({controller:l})})},{"../app":2,"../entities/favorites":7,"../entities/player":8,"backbone.marionette":"backbone.marionette",jquery:"jquery",underscore:"underscore"}],6:[function(e){"use strict";var t=e("../app"),n=e("backbone.marionette"),o=e("backbone"),i=e("underscore"),r=e("jquery"),a=e("../entities/favorites"),s=e("../entities/sentences"),c=(n.ItemView.extend({template:"#search-header-template",triggers:{"click a.favorites":"favorite:list"}}),n.AppRouter.extend({appRoutes:{search:"show"}})),l=o.Marionette.LayoutView.extend({className:"finder",template:"#finder-layout-view-template",regions:{filter:".finder-filter",list:".finder-content"}}),u=n.ItemView.extend({className:"sentences-filter",template:i.template(r("#filter-template").html()),ui:{criteria:".sentences_filter-criteria"},events:{"click .sentences_filter-find":"onFind","keyup .sentences_filter-criteria":"onEnter"},onFind:function(){this.trigger("sentences:find",this.ui.criteria.val())},onEnter:function(e){13===e.keyCode&&this.onFind()}}),d=n.ItemView.extend({tagName:"tr",template:i.template(r("#sentence-template").html()),triggers:{"click .sentence-add":"sentence:add"}}),f=n.CompositeView.extend({childView:d,childViewContainer:"tbody",collectionEvents:{remove:"render"},template:i.template(r("#sentence-list-template").html())}),p=n.ItemView.extend({template:i.template(r("#sentences-empty-template").html())}),h={show:function(){t.commands.execute("menu:set-active",".search");var e=new l,n=new u;n.on("sentences:find",function(t){s.list({data:{like:t},success:function(t){var n;t.length>0?(n=new f({collection:t}),n.on("childview:sentence:add",function(e){a.add(e.model.attributes),t.remove(e.model)})):n=new p,e.list.show(n)}})}),t.content.show(e),e.filter.show(n)}};t.on("search:show",function(){t.navigate("search"),h.show()}),t.addInitializer(function(){new c({controller:h})})},{"../app":2,"../entities/favorites":7,"../entities/sentences":9,backbone:"backbone","backbone.marionette":"backbone.marionette",jquery:"jquery",underscore:"underscore"}],7:[function(e,t){"use strict";var n=e("jquery"),o=e("backbone");o.$=n,o.LocalStorage=e("backbone.localstorage");var i=e("underscore"),r=o.Model.extend({save:function(e,t){t||(t={}),e||(e=i.clone(this.attributes)),delete e.howl,t.data=JSON.stringify(e),o.Model.prototype.save.call(this,e,t)}}),a=o.Collection.extend({model:r,localStorage:new o.LocalStorage("emachine")}),s=function(){var e=new a,t=n.Deferred();return e.fetch({success:t.resolve,error:t.reject}),function(){return t.promise()}}();t.exports={list:function(){return s()},add:function(e){s().then(function(t){t.create(e)})},del:function(e){s().then(function(t){t.get(e).destroy()})}}},{backbone:"backbone","backbone.localstorage":10,jquery:"jquery",underscore:"underscore"}],8:[function(e,t){"use strict";function n(){h.set({status:"playing"}),c.howl.play(),console.log("play: "+h.get("sentence_eng"))}function o(){h.set({status:"paused"}),c.timeoutId?(console.log("paused: clearTimeout: "+c.timeoutId),clearTimeout(c.timeoutId),delete c.timeoutId):(c.howl.pause(),console.log("audio.pause: "+h.get("sentence_eng")))}function i(){c.timeoutId?(console.log("stop: clearTimeout"+c.timeoutId),clearTimeout(c.timeoutId),delete c.timeoutId):(c.howl.stop(),console.log("stop: audio.stop"+h.get("sentence_eng")))}function r(){var e=c.collection.indexOf(c),t=e+1<c.collection.length?e+1:0;return c.collection.at(t)}function a(){console.log("onend: start :"+h.get("sentence_eng"));var e=1.25*c.howl._duration*1e3,t=setTimeout(function(){console.log("onend: woken up:"+h.get("sentence_eng")),delete c.timeoutId,console.log("onend: delete timeoutId: "+t),f>=2?(c=r(),l=r(),h.set(c.attributes),f=0):f++,n()},e>p?e:p);console.log("onend: create timeoutId: "+t),c.timeoutId=t}function s(e,t){e.howl=new u({urls:["http://nodejs-emachine.rhcloud.com/audio/"+e.id+".mp3"],onend:a,onload:function(){t&&t()},onplay:function(){l.howl||s(l),console.log("preload: "+h.get("sentence_eng"))}})}var c,l,u=e("howler").Howl,d=e("backbone"),f=0,p=3e3,h=new d.Model;t.exports={remove:function(){},play:function(e,t){e?(h.has("id")&&h.get("id")!==e.id&&i(),c=e,l=r(),h.set(c.attributes),c.howl?n():s(e,function(){t&&t(),console.log("onload: "+h.get("sentence_eng")),n()})):n()},pause:function(){o()},viewModel:function(){return h}}},{backbone:"backbone",howler:"howler"}],9:[function(e,t){"use strict";var n=e("jquery"),o=e("backbone");o.$=n;var i=o.Model.extend({}),r=o.Collection.extend({model:i,url:"/sentences"}),a=new r;t.exports={list:function(e){a.fetch(e)}}},{backbone:"backbone",jquery:"jquery"}],10:[function(e,t,n){!function(o,i){"object"==typeof n&&"function"==typeof e?t.exports=i(e("backbone")):"function"==typeof define&&define.amd?define(["backbone"],function(e){return i(e||o.Backbone)}):i(Backbone)}(this,function(e){function t(){return(65536*(1+Math.random())|0).toString(16).substring(1)}function n(){return t()+t()+"-"+t()+"-"+t()+"-"+t()+"-"+t()+t()+t()}function o(e){return e===Object(e)}function i(e,t){for(var n=e.length;n--;)if(e[n]===t)return!0;return!1}function r(e,t){for(var n in t)e[n]=t[n];return e}function a(e,t){if(null==e)return void 0;var n=e[t];return"function"==typeof n?e[t]():n}return e.LocalStorage=window.Store=function(e,t){if(!this.localStorage)throw"Backbone.localStorage: Environment does not support localStorage.";this.name=e,this.serializer=t||{serialize:function(e){return o(e)?JSON.stringify(e):e},deserialize:function(e){return e&&JSON.parse(e)}};var n=this.localStorage().getItem(this.name);this.records=n&&n.split(",")||[]},r(e.LocalStorage.prototype,{save:function(){this.localStorage().setItem(this.name,this.records.join(","))},create:function(e){return e.id||0===e.id||(e.id=n(),e.set(e.idAttribute,e.id)),this.localStorage().setItem(this._itemName(e.id),this.serializer.serialize(e)),this.records.push(e.id.toString()),this.save(),this.find(e)},update:function(e){this.localStorage().setItem(this._itemName(e.id),this.serializer.serialize(e));var t=e.id.toString();return i(this.records,t)||(this.records.push(t),this.save()),this.find(e)},find:function(e){return this.serializer.deserialize(this.localStorage().getItem(this._itemName(e.id)))},findAll:function(){for(var e,t,n=[],o=0;o<this.records.length;o++)e=this.records[o],t=this.serializer.deserialize(this.localStorage().getItem(this._itemName(e))),null!=t&&n.push(t);return n},destroy:function(e){this.localStorage().removeItem(this._itemName(e.id));for(var t=e.id.toString(),n=0;n<this.records.length;n++)this.records[n]===t&&this.records.splice(n,1);return this.save(),e},localStorage:function(){return localStorage},_clear:function(){var e=this.localStorage(),t=new RegExp("^"+this.name+"-");e.removeItem(this.name);for(var n in e)t.test(n)&&e.removeItem(n);this.records.length=0},_storageSize:function(){return this.localStorage().length},_itemName:function(e){return this.name+"-"+e}}),e.LocalStorage.sync=window.Store.sync=e.localSync=function(t,n,o){var i,r,s=a(n,"localStorage")||a(n.collection,"localStorage"),c=e.$?e.$.Deferred&&e.$.Deferred():e.Deferred&&e.Deferred();try{switch(t){case"read":i=void 0!=n.id?s.find(n):s.findAll();break;case"create":i=s.create(n);break;case"update":i=s.update(n);break;case"delete":i=s.destroy(n)}}catch(l){r=22===l.code&&0===s._storageSize()?"Private browsing is unsupported":l.message}return i?(o&&o.success&&("0.9.10"===e.VERSION?o.success(n,i,o):o.success(i)),c&&c.resolve(i)):(r=r?r:"Record Not Found",o&&o.error&&("0.9.10"===e.VERSION?o.error(n,r,o):o.error(r)),c&&c.reject(r)),o&&o.complete&&o.complete(i),c&&c.promise()},e.ajaxSync=e.sync,e.getSyncMethod=function(t){return t.localStorage||t.collection&&t.collection.localStorage?e.localSync:e.ajaxSync},e.sync=function(t,n,o){return e.getSyncMethod(n).apply(this,[t,n,o])},e.LocalStorage})},{backbone:"backbone"}]},{},[1]);