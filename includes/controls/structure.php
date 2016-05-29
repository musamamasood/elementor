<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

class Control_Structure extends Control_Base {

	public function get_type() {
		return 'structure';
	}

	public function content_template() {
		?>
		<div class="elementor-control-field">
			<div class="elementor-control-input-wrapper">
				<% var currentPreset = getPresetByStructure( data.controlValue ); %>
				<div class="elementor-control-structure-preset elementor-control-structure-current-preset">
					<i class="eicon-<%- currentPreset.icon %>"></i>
				</div>
				<%
				var morePresets = getMorePresets();

				if ( morePresets.length > 1 ) { %>
					<div class="elementor-control-structure-more-presets-title"><?php _e( 'More Structures' ); ?></div>
					<div class="elementor-control-structure-more-presets">
						<% _.each( morePresets, function( preset ) { %>
							<div class="elementor-control-structure-preset-wrapper">
								<input id="elementor-control-structure-preset-<%- data._cid %>-<%- preset.key %>" type="radio" name="elementor-control-structure-preset-<%- data._cid %>" data-setting="structure" value="<%- preset.key %>">
								<label class="elementor-control-structure-preset" for="elementor-control-structure-preset-<%- data._cid %>-<%- preset.key %>">
									<i class="eicon-<%- preset.icon %>"></i>
								</label>
								<div class="elementor-control-structure-preset-title"><%= preset.preset.join( ', ' ) %></div>
							</div>
						<% } ); %>
					</div>
				<% } %>
			</div>
		</div>
		
		<% if ( data.description ) { %>
		<div class="elementor-control-description"><%= data.description %></div>
		<% } %>
		<?php
	}
}