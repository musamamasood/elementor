( function( $, window ) {
	'use strict';

	// The closest window
	var scopeWindow = window;

	var elementorBindUI = ( function() {
		var _registeredBindEvent = {},
			_flagEditorMode = false,

			_setEditorMode = function( mode ) {
				_flagEditorMode = mode;
			},

			_setScopeWindow = function( window ) {
				scopeWindow = window;
			},

			_isEditorMode = function() {
				return _flagEditorMode;
			},

			_addBindEvent = function( widgetType, callback ) {
				_registeredBindEvent[ widgetType ] = callback;
			},

			_runReadyTrigger = function( $scope ) {
				var elementType = $scope.data( 'element_type' );

				if ( ! elementType ) {
					return;
				}

				if ( ! _registeredBindEvent[ elementType ] ) {
					return;
				}

				_registeredBindEvent[ elementType ].call( $scope );
			};

		// Public Members
		return {
			isEditorMode: _isEditorMode,
			setEditorMode: _setEditorMode,
			setScopeWindow: _setScopeWindow,
			addBindEvent: _addBindEvent,
			runReadyTrigger: _runReadyTrigger
		};
	} )();

	var onYoutubeApiReady = function( callback ) {
		if ( window.YT && YT.loaded ) {
			callback( YT );
		} else {
			// If not ready check again by timeout..
			setTimeout( function() {
				onYoutubeApiReady( callback );
			}, 350 );
		}
	};

	/**
	 * Add JS widgets here
	 */
	elementorBindUI.addBindEvent( 'counter', function() {
		this.find( '.elementor-counter-number' ).waypoint( function() {
			var $number = $( this );

			$number.numerator( {
				duration: $number.data( 'duration' )
			} );
		}, { offset: '90%' } );
	} );

	// Progress Bar Widget
	elementorBindUI.addBindEvent( 'progress', function() {
		var interval = 80;

		$( this ).find( '.elementor-progress-bar' ).waypoint( function() {
			var $progressbar = $( this ),
				max = parseInt( $progressbar.data( 'max' ), 10 ),
				$inner = $progressbar.next(),
				$percent = $inner.find( '.elementor-progress-percentage' ),
				innerText = $inner.data( 'inner' ) ? $inner.data( 'inner' ) : '';

			$progressbar.css( 'width', max + '%' );
			$inner.css( 'width', max + '%' );
			$inner.prepend( innerText + ' ' );
			$percent.html(  max + '%' );

		}, { offset: '90%' } );
	} );

	// Tabs Widget
	elementorBindUI.addBindEvent( 'tabs', function() {
		var $this = $( this ),
			defaultActiveTab = $this.find( '.elementor-tabs' ).data( 'active-tab' ),
			$tabsTitles = $this.find( '.elementor-tab-title' ),
			$tabs = $this.find( '.elementor-tab-content' ),
			$active,
			$content;

		if ( ! defaultActiveTab ) {
			defaultActiveTab = 0;
		}

		var activateTab = function( tabIndex ) {
			if ( $active ) {
				$active.removeClass( 'active' );

				$content.hide();
			}

			$active = $tabsTitles.eq( tabIndex );

			$active.addClass( 'active' );

			$content = $tabs.filter( '[data-tab="' + $active.data( 'tab' ) + '"]' );

			$content.show();
		};

		activateTab( defaultActiveTab );

		$tabsTitles.on( 'click', function() {
			var clickedTabIndex = $( this ).index( $tabsTitles );

			activateTab( clickedTabIndex );
		} );
	} );

	// Accordion Widget
	elementorBindUI.addBindEvent( 'accordion', function() {
		var $this = $( this ),
			defaultActiveSection = $this.find( '.elementor-accordion' ).data( 'active-section' ),
			$accordionTitles = $this.find( '.elementor-accordion-title' ),
			$activeTitle = $accordionTitles.filter( '.active' );

		var activateSection = function( sectionIndex ) {
			var $requestedTitle = $accordionTitles.eq( sectionIndex ),
				isRequestedActive = $requestedTitle.hasClass( 'active' );

			$activeTitle
				.removeClass( 'active' )
				.next()
				.slideUp();

			if ( ! isRequestedActive ) {
				$requestedTitle
					.addClass( 'active' )
					.next()
					.slideDown();

				$activeTitle = $requestedTitle;
			}
		};

		if ( ! defaultActiveSection ) {
			defaultActiveSection = 0;
		}

		activateSection( defaultActiveSection );

		$accordionTitles.on( 'click', function() {
			var clickedTitleIndex = $( this ).index( $accordionTitles );

			activateSection( clickedTitleIndex );
		} );
	} );

	// Toggle Widget
	elementorBindUI.addBindEvent( 'toggle', function() {
		var $toggleTitles = $( this ).find( '.elementor-toggle-title' );

		$toggleTitles.on( 'click', function() {
			var $active = $( this ),
				$content = $active.next();

			if ( $active.hasClass( 'active' ) ) {
				$active.removeClass( 'active' );
				$content.slideUp();
			} else {
				$active.addClass( 'active' );
				$content.slideDown();
			}
		} );
	} );

	// Carousel Widget
	elementorBindUI.addBindEvent( 'carousel', function() {
		var $wrapper = $( this ).find( '.elementor-carousel-wrapper' ),
			$forNav = $wrapper.children( '.elementor-carousel-for' ),
			$nav = $wrapper.children( '.elementor-carousel-nav' ),
			data = $nav.data();

		$forNav.slick( {
			slidesToShow: 1,
			slidesToScroll: 1,
			arrows: false,
			fade: true,
			asNavFor: $nav
		} );

		$nav.slick( {
			slidesToShow: data.slideToShow,
			slidesToScroll: data.slideToScroll,
			asNavFor: $forNav,
			dots: true,
			arrows: true,
			focusOnSelect: true,
			autoplay: data.autoPlay
		} );
	} );

	// Slider Widget
	elementorBindUI.addBindEvent( 'slider', function() {
		var $wrapper = $( this ).find( '.elementor-slider-wrapper' ),
			$slider = $wrapper.children( '.elementor-slider' ),
			$data = $slider.data();

		$slider.slick( $data );
	} );

	// Alert Widget
	elementorBindUI.addBindEvent( 'alert', function() {
		$( this ).find( '.elementor-alert-dismiss' ).on( 'click', function() {
			$( this ).parent().fadeOut();
		});
	} );

	// Section
	elementorBindUI.addBindEvent( 'section', function() {
		var player,
			ui = {
				backgroundVideoContainer: this.find( '.elementor-background-video-container' )
			},
			isYTVideo = false;

		if ( ! ui.backgroundVideoContainer.length ) {
			return;
		}

		ui.backgroundVideo = ui.backgroundVideoContainer.children( '.elementor-background-video' );

		var changeVideoSize = function() {
			var $video = isYTVideo ? $( player.getIframe() ) : ui.backgroundVideo,
				size = calcVideosSize();

			$video.width( size.width ).height( size.height );
		};

		var calcVideosSize = function() {
			var containerWidth = ui.backgroundVideoContainer.outerWidth(),
				containerHeight = ui.backgroundVideoContainer.outerHeight(),
				aspectRatioSetting = '16:9', //TEMP
				aspectRatioArray = aspectRatioSetting.split( ':' ),
				aspectRatio = aspectRatioArray[0] / aspectRatioArray[1],
				ratioWidth = containerWidth / aspectRatio,
				ratioHeight = containerHeight * aspectRatio,
				isWidthFixed = containerWidth / containerHeight > aspectRatio;

			return {
				width: isWidthFixed ? containerWidth : ratioHeight,
				height: isWidthFixed ? ratioWidth : containerHeight
			};
		};

		var prepareYTVideo = function( YT, videoID ) {

			player = new YT.Player( ui.backgroundVideo[0], {
				videoId: videoID,
				events: {
					onReady: function() {
						player.mute();

						changeVideoSize();

						player.playVideo();
					},
					onStateChange: function( event ) {
						if ( event.data === YT.PlayerState.ENDED ) {
							player.seekTo( 0 );
						}
					}
				},
				playerVars: {
					controls: 0,
					showinfo: 0
				}
			} );

		};

		var videoID = ui.backgroundVideo.data( 'video-id' );

		if ( videoID ) {
			isYTVideo = true;

			onYoutubeApiReady( function( YT ) {
				setTimeout( function() {
					prepareYTVideo( YT, videoID );
				}, 1 );
			} );
		} else {
			ui.backgroundVideo.one( 'canplay', changeVideoSize );
		}

		$( scopeWindow ).on( 'resize', changeVideoSize );
	} );

	// Video Widget
	elementorBindUI.addBindEvent( 'video', function() {
		var $this = $( this ),
			$imageOverlay = $this.find( '.elementor-custom-embed-image-overlay' ),
			$videoFrame = $this.find( 'iframe' );

		if ( ! $imageOverlay.length ) {
			return;
		}

		$imageOverlay.on( 'click', function() {
			$imageOverlay.remove();

			$videoFrame[0].src = $videoFrame[0].src + '&autoplay=1';
		} );
	} );

	// Make sure it's a global variable
	window.elementorBindUI = elementorBindUI;
} )( jQuery, window );

jQuery( function( $ ) {
	$( '.elementor-element' ).each( function() {
		elementorBindUI.runReadyTrigger( $( this ) );
	} );
} );
