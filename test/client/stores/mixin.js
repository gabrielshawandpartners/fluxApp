/* global describe, it, afterEach, document, sinon, expect */
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _libDom = require('../lib/dom');

var _libDom2 = _interopRequireDefault(_libDom);

var _lib = require('../../../lib');

var _lib2 = _interopRequireDefault(_lib);

exports['default'] = function () {
  describe('mixin', function () {
    var renderedComponent = undefined;

    function renderComponent(spec, context) {
      var elem = document.createElement('div');
      var Component = (0, _createReactClass2['default'])(spec);

      context = context && context.context ? context.context : _lib2['default'].createContext(context);
      var ContextWrapper = context.wrapper;

      document.body.appendChild(elem);

      return _libDom2['default'].render(_react2['default'].createElement(ContextWrapper, { handler: Component, context: context }), elem);
    }

    afterEach(function () {
      if (renderedComponent) {
        var elem = _libDom2['default'].findDOMNode(renderedComponent).parentNode;
        _libDom2['default'].unmountComponentAtNode(elem);
        document.body.removeChild(elem);
      }

      Object.keys(_lib2['default']._stores).forEach(function (id) {
        _lib2['default'].removeStore(id);
      });
    });

    it('should expose a getStore method', function () {
      renderedComponent = renderComponent({
        mixins: [_lib2['default'].Mixin],

        render: function render() {
          expect(this.getStore).to.be.a('function');

          return _react2['default'].createElement(
            'h1',
            null,
            'Hello'
          );
        }
      });
    });

    it('should return a store when getStore is called', function () {
      var storeClass = (function (_BaseStore) {
        _inherits(TestStore, _BaseStore);

        function TestStore() {
          _classCallCheck(this, TestStore);

          _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
        }

        return TestStore;
      })(_lib.BaseStore);

      _lib2['default'].registerStore('test', storeClass);

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].Mixin],

        render: function render() {
          expect(this.getStore).to.be.a('function');
          expect(this.getStore('test') instanceof _lib.BaseStore).to.equal(true);

          return _react2['default'].createElement(
            'h1',
            null,
            'Hello'
          );
        }
      });
    });

    it('should get notified when a store updates', function (done) {
      var storeClass = (function (_BaseStore2) {
        _inherits(TestStore, _BaseStore2);

        function TestStore() {
          _classCallCheck(this, TestStore);

          _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
        }

        return TestStore;
      })(_lib.BaseStore);

      _lib2['default'].registerStore('test', storeClass);

      var spy = sinon.spy();
      var context = _lib2['default'].createContext();
      var store = context.getStore('test');

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].Mixin],

        flux: {
          stores: {
            onTestUpdate: 'test'
          }
        },

        onTestUpdate: function onTestUpdate() {
          done();
        },

        render: function render() {
          return _react2['default'].createElement(
            'h1',
            null,
            'Hello'
          );
        }
      }, {
        context: context
      });

      context.getStore('test');

      store.emitChange();
    });

    it('should not get notified when a store updates, when unmounted', function (done) {
      var storeClass = (function (_BaseStore3) {
        _inherits(TestStore, _BaseStore3);

        function TestStore() {
          _classCallCheck(this, TestStore);

          _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
        }

        return TestStore;
      })(_lib.BaseStore);

      _lib2['default'].registerStore('test', storeClass);

      var spy = sinon.spy();
      var context = _lib2['default'].createContext();
      var store = context.getStore('test');

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].Mixin],

        flux: {
          stores: {
            onTestUpdate: 'test'
          }
        },

        onTestUpdate: spy,

        render: function render() {
          return _react2['default'].createElement(
            'h1',
            null,
            'Hello'
          );
        }
      }, {
        context: context
      });

      context.getStore('test');

      store.emitChange();

      setTimeout(function () {
        expect(spy.called).to.equal(true);

        var elem = _libDom2['default'].findDOMNode(renderedComponent).parentNode;
        _libDom2['default'].unmountComponentAtNode(elem);
        document.body.removeChild(elem);

        renderedComponent = null;

        store.emitChange();

        setTimeout(function () {
          expect(spy.callCount).to.equal(1);
          done();
        }, 200);
      }, 200);
    });

    it('should have access to custom context', function (done) {
      var storeClass = (function (_BaseStore4) {
        _inherits(TestStore, _BaseStore4);

        function TestStore() {
          _classCallCheck(this, TestStore);

          _get(Object.getPrototypeOf(TestStore.prototype), 'constructor', this).apply(this, arguments);
        }

        _createClass(TestStore, [{
          key: 'method',
          value: function method() {
            this.setState({
              custom: this.context.custom()
            });
          }
        }]);

        return TestStore;
      })(_lib.BaseStore);

      _lib2['default'].registerStore('test', storeClass);

      var spy = sinon.spy();
      var context = _lib2['default'].createContext({
        custom: function custom() {
          return true;
        }
      });
      var store = context.getStore('test');

      renderedComponent = renderComponent({
        mixins: [_lib2['default'].Mixin],

        flux: {
          stores: {
            onTestUpdate: 'test'
          }
        },

        onTestUpdate: spy,

        render: function render() {
          return _react2['default'].createElement(
            'h1',
            null,
            'Hello'
          );
        }
      }, {
        context: context
      });

      context.getStore('test');

      store.method();

      var state = store.getState();

      setTimeout(function () {
        expect(spy.called).to.equal(true);
        expect(state.custom).to.equal(true);
        done();
      }, 200);
    });
  });
};

module.exports = exports['default'];