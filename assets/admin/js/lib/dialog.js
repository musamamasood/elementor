/*!
 * Dialogs Manager v1.0.2
 * https://github.com/cobicarmel/dialogs-manager/
 *
 * Copyright Kobi Zaltzberg
 * Released under the MIT license
 * https://github.com/cobicarmel/dialogs-manager/blob/master/LICENSE.txt
 */

(function ($, global) {
	'use strict';

	var DialogsManager = {
		widgets: {},
		createWidgetType: function (typeName, properties, Parent) {
			if (!Parent) {
				Parent = this.Widget;
			}

			var WidgetType = function () {

				Parent.call(this, typeName);
			};

			var prototype = WidgetType.prototype = new Parent(typeName);

			$.extend(prototype, properties);

			prototype.constructor = WidgetType;

			WidgetType.extend = function (typeName, properties) {

				return DialogsManager.createWidgetType(typeName, properties, WidgetType);
			};

			return WidgetType;
		},
		addWidgetType: function (typeName, properties, Parent) {

			if (properties && properties.prototype instanceof this.Widget) {
				return this.widgets[typeName] = properties;
			}

			return this.widgets[typeName] = this.createWidgetType(typeName, properties, Parent);
		}
	};

	DialogsManager.Instance = function () {

		var self = this,
			components = {},
			settings = {};

		var initComponents = function () {

			components.$body = $('body');
		};

		var initSettings = function (options) {

			var defaultSettings = {
				classPrefix: 'dialog',
				effects: {
					show: 'fadeIn',
					hide: 'fadeOut'
				}
			};

			settings = $.extend(defaultSettings, options);
		};

		this.createWidget = function (widgetType, properties) {

			var widget = new DialogsManager.widgets[widgetType]();

			properties = properties || {};

			widget.init(self, properties);

			widget.setMessage(properties.message);

			if (properties.linkedElement) {
				widget.linkElement(properties.linkedElement, widget);
			}

			return widget;
		};

		this.getSettings = function (property) {

			if (property) {
				return settings[property];
			}

			return Object.create(settings);
		};

		this.init = function (settings) {

			initSettings(settings);

			initComponents();

			return self;
		};

		this.popDialog = function (widget) {

			Widget.show();
		};

		self.init();
	};

	DialogsManager.Widget = function (widgetName) {

		var self = this,
			settings = {},
			components = {
				$element: 0
			};

		var callEffect = function (intent) {

			var effect = settings.effects[intent],
				$widget = components.$widget;

			if ($.isFunction(effect)) {
				effect.call($widget);
			}
			else {

				if ($widget[effect]) {
					$widget[effect]();
				}
				else {
					throw 'Reference Error: The effect ' + effect + ' not found';
				}
			}
		};

		var initComponents = function () {

			self.addComponent('widget');

			self.addComponent('message');
		};

		var initSettings = function (parent, userSettings) {

			var parentSettings = parent.getSettings();

			settings = self.getDefaultSettings();

			settings.effects = parentSettings.effects;

			var prefix = parentSettings.classPrefix + '-' + widgetName;

			settings.classes = {
				globalPrefix: parentSettings.classPrefix,
				prefix: prefix,
				Widget: 'dialog-widget',
				linkedActive: prefix + '-linked-active'
			};

			$.extend(true, settings, userSettings);
		};

		var normalizeClassName = function (name) {

			return name.replace(/([a-z])([A-Z])/g, function () {
				return arguments[1] + '-' + arguments[2].toLowerCase();
			});
		};

		this.addComponent = function (name, component, type) {

			var $newComponent = components['$' + name] = $(component || '<div>'),
				className = settings.classes.prefix + '-';

			name = normalizeClassName(name);

			className += name;

			if (!type) {
				type = name;
			}

			className += ' ' + settings.classes.globalPrefix + '-' + type;

			$newComponent.addClass(className);

			return $newComponent;
		};

		this.getSettings = function (setting) {

			var copy = Object.create(settings);

			if (setting) {
				return copy[setting];
			}

			return copy;
		};

		this.init = function (parent, properties) {

			if (!(parent instanceof DialogsManager.Instance)) {
				throw 'The ' + self.widgetName + ' must to be initialized from an instance of DialogsManager.Instance';
			}

			self.onInit(properties);

			initSettings(parent, properties);

			initComponents();

			self.buildWidget();

			if (self.attachEvents) {
				self.attachEvents();
			}

			self.onReady();

			return self;
		};

		this.getComponents = function (item) {

			return item ? components['$' + item] : components;
		};

		this.hide = function () {

			callEffect('hide');

			if (components.$element.length) {
				components.$element.removeClass(settings.classes.linkedActive);
			}

			self.onHide();

			return self;
		};

		this.linkElement = function (element) {

			this.addComponent('element', element);

			return self;
		};

		this.setMessage = function (message) {

			components.$message.html(message);

			return self;
		};

		this.show = function (e, userSettings) {

			if (e) {
				e.stopPropagation();
			}

			components.$widget.appendTo('body');

			callEffect('show');

			if (components.$element.length) {
				components.$element.addClass(settings.classes.linkedActive);
			}

			self.onShow(userSettings);

			return self;
		};

	};

	DialogsManager.Widget.prototype.buildWidget = function () {

		var components = this.getComponents();

		components.$widget.html(components.$message);
	};

	DialogsManager.Widget.prototype.getDefaultSettings = function () {

		return {};
	};

	DialogsManager.Widget.prototype.onHide = function () {
	};

	DialogsManager.Widget.prototype.onShow = function () {
	};

	DialogsManager.Widget.prototype.onInit = function () {
	};

	DialogsManager.Widget.prototype.onReady = function () {
	};

	DialogsManager.addWidgetType('tool-tip', {
		onShow: function () {

			var components = this.getComponents();

			if (components.$element.length) {

				components.$widget.position({
					at: 'left top-5',
					my: 'left+10 bottom',
					of: components.$element,
					collision: 'none none'
				});

				components.$element.focus();
			}

			setTimeout(this.hide, 5000);
		}
	});

	DialogsManager.addWidgetType('options', {
		activeKeyUp: function (event) {

			var ENTER_KEY = 13;

			if (event.which !== ENTER_KEY) {

				event.preventDefault();
			}

			if (this.hotKeys[event.which]) {
				this.hotKeys[event.which](this);
			}
		},
		activeKeyDown: function (event) {

			var TAB_KEY = 9,
				ENTER_KEY = 13;

			if (event.which !== ENTER_KEY) {

				event.preventDefault();
			}

			if (event.which === TAB_KEY) {

				var currentButtonIndex = this.focusedButton.index(),
					nextButtonIndex;

				if (event.shiftKey) {

					nextButtonIndex = currentButtonIndex - 1;

					if (nextButtonIndex < 0) {
						nextButtonIndex = this.buttons.length - 1;
					}
				} else {

					nextButtonIndex = currentButtonIndex + 1;

					if (nextButtonIndex >= this.buttons.length) {
						nextButtonIndex = 0;
					}
				}

				this.focusedButton = this.buttons[nextButtonIndex].focus();
			}
		},
		addButton: function (options) {

			var self = this,
				$button = self.addComponent(options.name, $('<button>').text(options.text));

			self.buttons.push($button);

			var buttonFn = function () {

				self.hide();

				if ($.isFunction(options.callback)) {
					options.callback.call(this, self);
				}
			};

			$button.on('click', buttonFn);

			if (options.hotKey) {
				this.hotKeys[options.hotKey] = buttonFn;
			}

			this.getComponents('buttonsWrapper').append($button);

			if (options.focus) {
				this.focusedButton = $button;
			}
		},
		bindHotKeys: function () {
			var self = this;

			self.bindKeyUpEvents = function (event) {

				self.activeKeyUp(event);
			};

			self.bindKeyDownEvents = function (event) {

				self.activeKeyDown(event);
			};

			$(window).on({
				keyup: self.bindKeyUpEvents,
				keydown: self.bindKeyDownEvents
			});
		},
		buildWidget: function () {

			var $widgetHeader = this.addComponent('widgetHeader'),
				$widgetContent = this.addComponent('widgetContent'),
				$buttonsWrapper = this.addComponent('buttonsWrapper');

			var components = this.getComponents();

			$widgetContent.append($widgetHeader, components.$message, $buttonsWrapper);

			components.$widget.html($widgetContent);
		},
		getDefaultSettings: function () {

			return {
				position: {
					my: 'center',
					at: 'center center-100'
				},
				headerMessage: ''
			};
		},
		onHide: function () {

			this.unbindHotKeys();
		},
		onInit: function () {

			this.buttons = [];

			this.hotKeys = {};

			this.focusedButton = null;
		},
		onReady: function(){

			this.setHeaderMessage(this.getSettings('headerMessage'));
		},
		onShow: function (userSettings) {

			var components = this.getComponents(),
				position = this.getSettings('position');

			position.of = components.$widget;

			if (userSettings) {
				$.extend(position, userSettings);
			}

			components.$widgetContent.position(position);

			this.bindHotKeys();

			if (!this.focusedButton) {
				this.focusedButton = this.buttons[0];
			}

			if (this.focusedButton) {
				this.focusedButton.focus();
			}
		},
		setHeaderMessage: function (message) {

			this.getComponents('widgetHeader').html(message);
		},
		unbindHotKeys: function () {

			$(window).off({
				keyup: this.bindKeyUpEvents,
				keydown: this.bindKeyDownEvents
			});
		}
	});

	DialogsManager.addWidgetType('confirm', DialogsManager.widgets.options.extend('confirm', {
		onReady: function () {

			DialogsManager.widgets.options.prototype.onReady.apply(this, arguments);

			var strings = this.getSettings('strings'),
				ESC_KEY = 27,
				isDefaultCancel = this.getSettings('defaultOption') === 'cancel';

			this.addButton({
				name: 'cancel',
				text: strings.cancel,
				callback: this.getSettings('onCancel'),
				hotKey: ESC_KEY,
				focus: isDefaultCancel
			});

			this.addButton({
				name: 'ok',
				text: strings.confirm,
				callback: this.getSettings('onConfirm'),
				focus: !isDefaultCancel
			});
		},
		getDefaultSettings: function () {

			var settings = DialogsManager.widgets.options.prototype.getDefaultSettings.apply(this, arguments);

			settings.strings = {
				confirm: 'Ok',
				cancel: 'Cancel'
			};

			settings.defaultOption = 'cancel';

			return settings;
		}
	}));

	DialogsManager.addWidgetType('alert', DialogsManager.widgets.options.extend('alert', {
		onReady: function () {
			var strings = this.getSettings('strings');

			this.addButton({
				name: 'ok',
				text: strings.confirm,
				callback: this.getSettings('onConfirm')
			});
		},
		getDefaultSettings: function () {
			var settings = DialogsManager.widgets.options.prototype.getDefaultSettings.apply(this, arguments);

			settings.strings = {
				confirm: 'Ok'
			};

			return settings;
		}
	}));

	DialogsManager.addWidgetType('popup', {
		getDefaultSettings: function () {

			return {
				position: {
					my: 'center',
					at: 'center',
					of: window
				},
				hide: {
					delay: 5000
				}
			};
		},
		onShow: function () {

			var $widgetMessage = this.getComponents('message');

			$widgetMessage.position(this.getSettings('position'));

			setTimeout(this.hide, this.getSettings('hide').delay);
		}
	});

	global.DialogsManager = DialogsManager;
})('function' === typeof require ? require('jquery') : jQuery, 'undefined' !== typeof module && module.exports || window);