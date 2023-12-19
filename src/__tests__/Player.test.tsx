import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { StoreProvider } from '../renderer/components/StoreProvider';
import createStore from '../renderer/dataLayer/stores/createStore';
import Player from '../renderer/components/Player/Player';

describe('Player tests', () => {
  it('should render', () => {
    const store = createStore();
    expect(
      render(
        <StoreProvider value={store}>
          <Player />
        </StoreProvider>,
      ),
    ).toBeTruthy();
  });
});
