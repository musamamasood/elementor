var ControlBaseItemView = require( 'elementor-views/controls/base' ),
	ControlFontItemView;

ControlFontItemView = ControlBaseItemView.extend( {
	ui: function() {
		var ui = ControlBaseItemView.prototype.ui.apply( this, arguments );

		ui.fontSelect = '.elementor-control-font-family';

		return ui;
	},
	onReady: function() {
		this.ui.fontSelect.select2( {
			dir: elementor.config.is_rtl ? 'rtl' : 'ltr'
		} );
	},

	onBeforeDestroy: function() {
		if ( this.ui.fontSelect.data( 'select2' ) ) {
			this.ui.fontSelect.select2( 'destroy' );
		}
		this.$el.remove();
	},

	templateHelpers: function() {
		var helpers = ControlBaseItemView.prototype.templateHelpers.apply( this, arguments );

		helpers.getFontsByGroups = _.bind( function( groups ) {
			return _.pick( this.model.get( 'fonts' ), function( fontType, fontName ) {
				return _.isArray( groups ) ? _.contains( groups, fontType ) : fontType === groups;
			} );
		}, this );

		return helpers;
	}
} );

module.exports = ControlFontItemView;
