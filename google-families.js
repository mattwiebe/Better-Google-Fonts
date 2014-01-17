(function($){

	// API URL with my own key. Please get your own if you want to use it.
	var api = 'https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBUK3PeqSEzwPNIyg94dBQpziFOPvm7-aA&sort=style';
	// Will hold the font data returned by the API for future filtering operations
	var fontData;
	// Cached reference
	var head = $("head");
	// Minimum font variants to show a font
	var minVariants = 4;
	// Template for a single font
	var template = _.template($("#font-template").html());
	// Manually exclude these stupid fonts
	var manualExcludes = ['Averia Libre', 'Averia Sans Libre', 'Averia Serif Libre'];

	var Font = Backbone.Model.extend({
		extUrlRoot: 'http://www.google.com/webfonts/specimen/',
		// normalize our font data a bit
		getFontData: function() {
			var fontData = this.toJSON();
			fontData.extlink = this.extUrlRoot + encodeURIComponent(fontData.family);
			fontData.variants = _.map(fontData.variants, function(val){
				return val.replace(/italic$/, ' italic');
			});
			return fontData;
		}
	});

	var FontView = Backbone.View.extend({
		className: 'font',
		template: template,
		apiBase: 'http://fonts.googleapis.com/css?family=',
		render: function() {
			var fontData = this.model.getFontData(),
				family = '"' + fontData.family + '"';
			this.getFont();
			this.$el.html(this.template(fontData)).css({fontFamily: family });
		},
		getFont: function() {
			var fontData = this.model.toJSON(),
				tail = fontData.family + ':' + fontData.variants.join(',') + '&text=' + fontData.family + 'Iitalic1234567890',
				url = this.apiBase + tail;
			$('<link rel="stylesheet" href="'+url+'" >').appendTo(head);
		}
	});

	var Fonts = Backbone.Collection.extend({
		model: Font
	});
	var fonts = new Fonts();

	var FontsView = Backbone.View.extend({
		collection: fonts,
		render: function() {
			$("h1").prepend(this.collection.length + ' ');
			this.collection.forEach(this.addOne, this);
		},
		addOne: function(font) {
			var fontView = new FontView({model: font});
			fontView.render();
			this.$el.append(fontView.el);
		}
	});
	var fontsView = new FontsView();

	var renderFonts = function(data) {
		if ( data.kind !== "webfonts#webfontList" )
			return;

		var items = _.filter(data.items, function(item){
			return item.variants.length >= minVariants && manualExcludes.indexOf(item.family) == -1;
		});
		fontData = items;
		fonts.reset(items);
		fontsView.render();
		$("#fonts").html(fontsView.el);
	}

	jQuery(document).ready(function() {
		$.ajax(api, {
			dataType: 'jsonp',
			jsonpCallback: 'callback',
			success: renderFonts
		});
	});

})(jQuery);