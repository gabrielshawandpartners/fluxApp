'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _actions = require('./actions');

var _actions2 = _interopRequireDefault(_actions);

var _store = require('./store');

var _store2 = _interopRequireDefault(_store);

var _componentMixin = require('./componentMixin');

var _componentMixin2 = _interopRequireDefault(_componentMixin);

var _component = require('./component');

var _component2 = _interopRequireDefault(_component);

var _context = require('./context');

var _context2 = _interopRequireDefault(_context);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _events = require('events');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _router = require('./router');

var _router2 = _interopRequireDefault(_router);

/**
 * Fluxapp Module
 */
function FluxApp() {
  this._stores = {};
  this._actions = {};
  this._plugins = {};
  this._contextMethods = {};

  this.router = new _router2['default'](this);

  _events.EventEmitter.call(this);

  this.setMaxListeners(0);
}

_util2['default'].inherits(FluxApp, _events.EventEmitter);

/**
 * Get the definition for the plugin by name
 *
 * <pre>
 *   <code>
 *     var plugin = fluxApp.getPlugin('name');
 *   </code>
 * </pre>
 *
 * @param {String} name plugin name
 */
FluxApp.prototype.getPlugin = function getPlugin(name) {
  return this._plugins[name];
};

/**
 * Check if a plugin has been registered
 *
 * <pre>
 *   <code>
 *     if (! fluxapp.hasPlugin('name')) {
 *       fluxApp.registerPlugin('name', pluginDefinition);
 *     }
 *   </code>
 * </pre>
 *
 * @param {String} name plugin name
 */
FluxApp.prototype.hasPlugin = function hasPlugin(name) {
  return !!this._plugins[name];
};

/**
 * Remove a plugin by name
 *
 * Removing a plugin removes any stores, actions and context methods that it has registered with fluxapp
 *
 * <pre>
 *   <code>
 *     fluxapp.removePlugin('name');
 *   </code>
 * </pre>
 *
 * @param {String} name plugin name
 */
FluxApp.prototype.removePlugin = function removePlugin(name) {
  var plugin = this._plugins[name];
  var self = this;

  if (!plugin) {
    throw new Error('fluxapp: plugin ' + name + ' has not been registered, unable to remove');
  }

  if (plugin.stores) {
    _lodash2['default'].each(plugin.stores, function registerPluginStores(spec, name) {
      self.removeStore(name);
    });
  }

  if (plugin.actions) {
    _lodash2['default'].each(plugin.actions, function registerPluginActions(handlers, name) {
      self.removeActions(name);
    });
  }

  if (plugin.contextMethods) {
    this._contextMethods = _lodash2['default'].omit(this._contextMethods, _lodash2['default'].keys(plugin.contextMethods));
  }

  delete this._plugins[name];
};

/**
 * Register Plugins
 *
 * Registers multiple plugins
 *
 * <pre>
 *   <code>
 *     fluxapp.removePlugin('name');
 *   </code>
 * </pre>
 *
 * @param {Object} plugins
 */
FluxApp.prototype.registerPlugins = function registerPlugins(plugins) {
  var self = this;

  _lodash2['default'].each(plugins, function _registerPlugin(plugin, name) {
    self.registerPlugin(name, plugin);
  });

  return this;
};

/**
 * Register a plugin by name with fluxapp
 * <pre>
 *   <code>
 *     fluxapp.registerPlugin('name', pluginObject);
 *   </code>
 * </pre>
 *
 * @param {String} name   plugin name
 * @param {Object} plugin plugin object
 */
FluxApp.prototype.registerPlugin = function registerPlugin(name, plugin) {
  var self = this;

  if (this._plugins[name]) {
    throw new Error('fluxapp: plugin ' + name + ' was already registered');
  }

  if (_lodash2['default'].isFunction(plugin)) {
    plugin = plugin(this, name);
  }

  if (plugin.stores) {
    _lodash2['default'].each(plugin.stores, function registerPluginStores(spec, name) {
      self.registerStore(name, spec);
    });
  }

  if (plugin.actions) {
    _lodash2['default'].each(plugin.actions, function registerPluginActions(handlers, name) {
      self.registerActions(name, handlers);
    });
  }

  if (plugin.contextMethods) {
    this._contextMethods = _lodash2['default'].assign(this._contextMethods, plugin.contextMethods);
  }

  this._plugins[name] = plugin;

  return this;
};

/**
 * Creates and returns a context wrapper, ensuring flux context is set.
 *
 * <pre>
 *   <code>
 *     var ContextWrapper = fluxapp.createWrapper('ApplicationContext');
 *   </code>
 * </pre>
 *
 * @param {String} name optional custom name for the context
 */
FluxApp.prototype.createWrapper = function createWrapper(name) {
  return (0, _createReactClass2['default'])({
    displayName: name || 'fluxAppContext',

    PropTypes: {
      handler: _propTypes2['default'].element.isRequired,
      context: _propTypes2['default'].object.isRequired
    },

    childContextTypes: {
      flux: _propTypes2['default'].object.isRequired
    },

    getChildContext: function getChildContext() {
      return {
        flux: this.props.context
      };
    },

    render: function render() {
      var Component = this.props.handler;
      var props = _lodash2['default'].omit(this.props, 'handler');

      return _react2['default'].createElement(Component, props);
    }
  });
};

/**
 * Register a store with fluxapp
 *
 * <pre>
 *   <code>
 *     fluxapp.registerStore('user', {
 *       actions: {
 *         onLogin: 'user.login'
 *       },
 *
 *       onLogin: function onLogin(user) {
 *         this.setState(user);
 *       }
 *     });
 *   </code>
 * </pre>
 *
 * @param {String} name
 * @param {Object} spec
 */
FluxApp.prototype.registerStore = function registerStore(name, store) {
  if (this._stores[name]) {
    throw new Error('fluxApp: store already registered under id "' + store.constructor.name + '"');
  }

  this._stores[name] = store;

  this.emit('stores.add', name, store);

  return this;
};

/**
 * getStores
 *
 * <pre>
 *   <code>
 *     var stores = fluxapp.getStores()
 *   </code>
 * </pre>
 *
 * Returns all store constructors that have been registered
 */
FluxApp.prototype.getStores = function getStores() {
  return this._stores;
};

/**
 * Determines if a store has been registered
 *
 * <pre>
 *   <code>
 *     if (fluxapp.hasStore('name')) {
 *       ...
 *     }
 *   </code>
 * </pre>
 *
 * @param {String} name store name
 */
FluxApp.prototype.hasStore = function hasStore(name) {
  return this._stores[name];
};

/**
 * Register a stores
 *
 * <pre>
 *   <code>
 *     fluxapp.registerStores(stores);
 *   </code>
 * </pre>
 *
 * @param {Object} stores
 */
FluxApp.prototype.registerStores = function registerStores(stores) {
  var self = this;

  _lodash2['default'].forIn(stores, function register(value, key) {
    self.registerStore(key, value);
  });

  return this;
};

/**
 * Remove a store from the fluxapp module
 *
 * <pre>
 *   <code>
 *     fluxapp.removeStores('name');
 *   </code>
 * </pre>
 *
 * @param {String} name
 */
FluxApp.prototype.removeStore = function removeStore(name) {
  delete this._stores[name];
  this.emit('stores.remove', name);

  return this;
};

/**
 * Create actions and register them in fluxApp
 *
 * <pre>
 *   <code>
 *     fluxapp.registerActions('user', {
 *       login: function loginHandler() {
 *         return getUserFunction();
 *       }
 *     });
 *   </code>
 * </pre>
 *
 * @param {String} namespace
 * @param {Object} handlers
 */
FluxApp.prototype.registerActions = function registerActions(namespace, ActionClass) {
  if (-1 !== namespace.indexOf('.')) {
    throw new Error('fluxApp:actions namespaces cannot contain a period');
  }

  if (!this._actions[namespace]) {
    this._actions[namespace] = ActionClass;
  } else {
    throw new Error('Actions with namespace ' + namespace + ' have already been initiated');
  }

  this.emit('actions.add', namespace, this._actions[namespace]);

  return this._actions[namespace];
};

/**
 * Remove actions from fluxapp
 *
 * <pre>
 *   <code>
 *     fluxapp.removeActions('user');
 *   </code>
 * </pre>
 *
 * @param {String} namespace
 */
FluxApp.prototype.removeActions = function removeActions(namespace) {
  delete this._actions[namespace];
  this.emit('actions.remove', namespace);

  return this;
};

FluxApp.prototype.hasActions = function hasActions(namespace) {
  return !!this._actions[namespace];
};

/**
 * Get a list of actions
 *
 * <pre>
 *   <code>
 *     var actions = fluxapp.getActions();
 *   </code>
 * </pre>
 */
FluxApp.prototype.getActions = function getActions() {
  return this._actions;
};

/**
 * Converts string based action type to constant
 *
 * <pre>
 *   <code>
 *     fluxapp.getActionType('user.login'); // USER_LOGIN
 *     fluxapp.getActionType('user.login:after'); // USER_LOGIN_AFTER
 *   </code>
 * </pre>
 *
 * @param {String} input
 */
FluxApp.prototype.getActionType = function getActionType(input) {
  var namespaceTransform = require('./util/namespaceTransform');

  return namespaceTransform(input);
};

/**
 * Get the fluxapp router
 *
 * <pre>
 *   <code>
 *     var router = fluxapp.getRouter();
 *   </code>
 * </pre>
 */
FluxApp.prototype.getRouter = function getRouter() {
  return this.router;
};

/**
 * Register our routes with the router
 *
 * <pre>
 *   <code>
 *     fluxapp.registerRoutes(routes);
 *   </code>
 * </pre>
 *
 * @param {Array|Object} routes
 */
FluxApp.prototype.registerRoutes = function registerRoutes(routes) {
  var self = this;

  _lodash2['default'].each(routes, function _registerRoute(route, id) {
    route.id = route.id ? route.id : id;

    self.registerRoute(route);
  });

  return this;
};

/**
 * Register a route with the router
 *
 * <pre>
 *   <code>
 *     fluxapp.registerRoute(routeDefinition);
 *   </code>
 * </pre>
 *
 * @param {Object} route
 */
FluxApp.prototype.registerRoute = function registerRoute(route) {
  this.router.addRoute(route);

  this.emit('routes.add', route);

  return this;
};

/**
 * Creates a Context
 *
 * Creates a new fluxapp context, initiated with all registered stores, actions. It binds the passed
 * context methods onto the context. If a state is supplied the stores states will be rehydrated to match
 * the state provided.
 *
 * <pre>
 *   <code>
 *     var context = fluxapp.createContext();
 *
 *     var context = fluxapp.createContext({
 *       getUsers: function getUser() {}
 *     });
 *
 *     var context = fluxapp.createContext(null, stateObject);
 *   </code>
 * </pre>
 *
 * @param {Object} [contextMethods] Custom context methods to be bound
 * @param {Object} [state]          Application state to be re-initiated
 */
FluxApp.prototype.createContext = function createContext(contextMethods, state) {
  if (!state && contextMethods && contextMethods.stores && typeof contextMethods.stores === 'function') {
    state = contextMethods;
    contextMethods = {};
  }

  return new _context2['default'](this, _lodash2['default'].assign(contextMethods || {}, this._contextMethods), state);
};

/**
 * Get a new instance of fluxapp
 */
function getInstance() {
  var instance = new FluxApp();

  /**
   * import the mixins for the app
   *
   * @type {Object}
   */
  instance.Mixin = _componentMixin2['default'];
  instance.Component = _component2['default'];

  instance.BaseActions = _actions2['default'];
  instance.BaseStore = _store2['default'];

  return instance;
}

FluxApp.prototype.noConflict = getInstance;

module.exports = getInstance();