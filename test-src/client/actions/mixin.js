/* global describe, it, afterEach, document, sinon, expect */
import React from 'react';
import createReactClass from 'create-react-class';
import DOM from '../lib/dom';
import Promise from 'bluebird';
import fluxapp, { BaseActions } from '../../../lib';

export default () => {
  describe('mixin', () => {
    let renderedComponent;

    function renderComponent(spec, context) {
      const elem = document.createElement('div');
      const Component = createReactClass(spec);

      context = context && context.context ? context.context : fluxapp.createContext(context);
      const ContextWrapper = context.wrapper;

      document.body.appendChild(elem);

      return DOM.render((
        <ContextWrapper handler={Component} context={context} />
      ), elem);
    }

    afterEach(() => {
      if (renderedComponent) {
        const elem = DOM.findDOMNode(renderedComponent).parentNode;
        DOM.unmountComponentAtNode(elem);
        document.body.removeChild(elem);
      }

      renderedComponent = null;

      fluxapp._stores = {};
      fluxapp._actions = {};
    });

    it('should expose a getActions method', () => {
      renderedComponent = renderComponent({
        mixins : [fluxapp.Mixin],

        render() {
          expect(this.getActions).to.be.a('function');

          return (
            <h1>Hello</h1>
          );
        },
      });
    });

    it('should expose a getAction method', () => {
      renderedComponent = renderComponent({
        mixins : [fluxapp.Mixin],

        render() {
          expect(this.getActions).to.be.a('function');

          return (
            <h1>Hello</h1>
          );
        },
      });
    });

    describe('getActions', () => {
      it('should return the actions registered', () => {
        const actionClass = class TestActions extends BaseActions {
          methodA() {}
          methodB() {}
        };

        fluxapp.registerActions('testing', actionClass);

        renderedComponent = renderComponent({
          mixins : [ fluxapp.Mixin ],

          render() {
            expect(this.getActions).to.be.a('function');
            const actions = this.getActions('testing');

            expect(actions).to.be.a('object');
            expect(actions.methodA).to.be.a('function');
            expect(actions.methodB).to.be.a('function');

            return (
              <h1>Hello</h1>
            );
          },
        });
      });
    });

    describe('getAction', () => {
      it('should return the action requested', () => {
        const actionClass = class TestActions extends BaseActions {
          methodA() {}
          methodB() {}
        };

        fluxapp.registerActions('testing', actionClass);

        renderedComponent = renderComponent({
          mixins : [ fluxapp.Mixin ],

          render() {
            expect(this.getAction).to.be.a('function');
            const action = this.getAction('testing', 'methodA');

            expect(action).to.be.a('function');

            return (
              <h1>Hello</h1>
            );
          },
        });
      });
    });


    it('should get notified when a before action occurs', function(done) {
      const spy = sinon.spy();
      const context = fluxapp.createContext();

      const actionClass = class TestActions extends BaseActions {
        method() {
          return new Promise((resolve) => {
            setImmediate(() => {
              resolve('something');
            });
          });
        }
      };

      fluxapp.registerActions('test', actionClass);

      renderedComponent = renderComponent({
        mixins : [ fluxapp.Mixin ],

        flux : {
          actions : {
            onTestMethodBefore : 'test.method:before',
          },
        },

        onTestMethodBefore : spy,

        render() {
          return (
            <h1>Hello</h1>
          );
        },
      }, {
        context : context,
      });

      const promise = context.getActions('test').method();

      promise.then(() => {
        expect(spy.called).to.equal(true);
        done();
      });
    });

    it('should get notified when a after action occurs', function(done) {
      const context = fluxapp.createContext();

      const actionClass = class TestActions extends BaseActions {
        method() {
          return new Promise((resolve) => {
            setImmediate(() => {
              resolve('something');
            });
          });
        }
      };

      fluxapp.registerActions('test', actionClass);

      renderedComponent = renderComponent({
        mixins : [ fluxapp.Mixin ],

        flux : {
          actions : {
            onTestMethodAfter : 'test.method:after',
          },
        },

        onTestMethodAfter() {
          done();
        },

        render() {
          return (
            <h1>Hello</h1>
          );
        },
      }, {
        context : context,
      });

      context.getActions('test').method();
    });

    it('should get notified when failed action occurs (SYNC)', function(done) {
      const context = fluxapp.createContext();

      const actionClass = class TestActions extends BaseActions {
        method() {
          throw new Error('sync failed');
        }
      };

      fluxapp.registerActions('test', actionClass);

      renderedComponent = renderComponent({
        mixins : [fluxapp.Mixin],

        flux : {
          actions : {
            onTestMethodFailed : 'test.method:failed',
          },
        },

        onTestMethodFailed() {
          done();
        },

        render() {
          return (
            <h1>Hello</h1>
          );
        },
      }, {
        context : context,
      });

      context.getActions('test').method();
    });

    it('should get notified when failed action occurs', function(done) {
      const context = fluxapp.createContext();

      const actionClass = class TestActions extends BaseActions {
        method() {
          return new Promise((resolve, reject) => {
            setImmediate(() => {
              reject(new Error('something'));
            });
          });
        }
      };

      fluxapp.registerActions('test', actionClass);

      renderedComponent = renderComponent({
        mixins : [fluxapp.Mixin],

        flux : {
          actions : {
            onTestMethodFailed : 'test.method:failed',
          },
        },

        onTestMethodFailed() {
          done();
        },

        render() {
          return (
            <h1>Hello</h1>
          );
        },
      }, {
        context : context,
      });

      context.getActions('test').method();
    });

    it('should have access to custom context methods', function(done) {
      const context = fluxapp.createContext({
        custom() {
          return true;
        },
      });

      const actionClass = class TestActions extends BaseActions {
        method() {
          expect(this.context.custom()).to.equal(true);
          done();
        }
      };

      fluxapp.registerActions('test', actionClass);

      context.getActions('test').method();
    });
  });
};
