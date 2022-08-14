import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import Divider from '../renderer/components/Divider';

describe('Divider tests', () => {
  it('should render', () => {
    expect(render(<Divider />)).toBeTruthy();
  });
});
