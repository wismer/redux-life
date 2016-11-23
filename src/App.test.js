import React from 'react';
import ReactDOM from 'react-dom';

import App from './App';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { gameState } from './reducers';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';

const store = createStore(gameState);


describe('<App />', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <Provider store={store}><App /></Provider>, div);
  });

  it('it renders a complete 50x50 grid of divs', () => {
    sinon.spy(Foo.prototype, 'componentDidMount');
    const div = mount(<Provider store={store}><App /></Provider>);
    expect(div.find(App)).to.have;
  });
});
