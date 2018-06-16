/* global describe, it, sinon, document */
import React from 'react';
import DOM from './lib/dom';
import fluxapp, { Component } from '../../lib';
import { expect } from 'chai';

const TestComponent = class extends Component {
  _componentDidMount() {
    if (this.props.spies.will) {
      this.props.spies.will();
    }
  }

  _componentWillUnmount() {
    if (this.props.spies.un) {
      this.props.spies.un();
    }
  }

  getSpies() {
    return {};
  }

  render() {
    return (
      <h1>Hello</h1>
    );
  }
};

describe('Component', function() {
  let renderedComponent;

  function renderComponent(Comp, spies) {
    const elem = document.createElement('div');

    const context = fluxapp.createContext(context);
    const ContextWrapper = context.wrapper;

    document.body.appendChild(elem);

    return DOM.render((
      <ContextWrapper handler={Comp} context={context} spies={spies} />
    ), elem);
  }

  describe('lifecycle', () => {
    it('should call _componentDidMount', () => {
      const Comp = class extends TestComponent {};
      const will = sinon.spy();

      renderComponent(Comp, {
        will,
      });

      expect(will.callCount).to.equal(1);
    });

    it('should call _componentWillUnmount', () => {
      const Comp = class extends TestComponent {};
      const un = sinon.spy();

      renderedComponent = renderComponent(Comp, {
        un,
      });

      const elem = DOM.findDOMNode(renderedComponent).parentNode;
      DOM.unmountComponentAtNode(elem);
      document.body.removeChild(elem);

      expect(un.callCount).to.equal(1);
    });

    it('should proxy componentDidMount', () => {
      const will = sinon.spy();
      const Comp = class extends TestComponent {
        componentDidMount() {
          this.props.spies.will();
        }
      };

      renderComponent(Comp, {
        will,
      });

      expect(will.callCount).to.equal(2);
    });

    it('should proxy componentWillUnmount', () => {
      const un = sinon.spy();
      const Comp = class extends TestComponent {
        componentWillUnmount() {
          this.props.spies.un();
        }
      };

      renderedComponent = renderComponent(Comp, {
        un,
      });

      const elem = DOM.findDOMNode(renderedComponent).parentNode;
      DOM.unmountComponentAtNode(elem);
      document.body.removeChild(elem);

      expect(un.callCount).to.equal(2);
    });
  });
});
