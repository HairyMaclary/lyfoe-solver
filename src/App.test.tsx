import React from 'react';
import { cleanup, render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import App from './App';

describe('initial app set up', () => {

  afterEach(cleanup);

  it('renders', () => {
    const { container } = render(<App />);
    expect(container).toMatchSnapshot();
  });

  it('initial button exists', () => {
    const { getByText } = render(<App />);
    const button = getByText('button');
    expect(button).toBeInTheDocument();
    expect(button).toBeInstanceOf(HTMLButtonElement);
    expect(button).not.toHaveClass('clicked');
  });
});


describe('clicking on the button', () => {

  afterAll(cleanup);

  let upDatedButton: HTMLElement;

  beforeAll(async () => {
    const { getByText, findByText } = render(<App />);
    const button = getByText('button');

    fireEvent(
      button,
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true
      })
    )

    upDatedButton = await findByText('button clicked');
  });

  it('button text changes', async () => {
    expect(upDatedButton).toBeInTheDocument();
    expect(upDatedButton).toBeInstanceOf(HTMLButtonElement);
  });

  it('style changes after click', async () => {
    expect(upDatedButton).toHaveClass('Button clicked');
    expect(upDatedButton).toHaveStyle(`
      transform: scale(8.0);
      background-color: red;
    `);
  });

});

