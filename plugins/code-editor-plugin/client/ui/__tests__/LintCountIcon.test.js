import React from 'react';
import TestUtilities from '../../../shared-util/test-utilities';
import LintCountIcon from '../LintCountIcon';

describe('LintCountIcon', () => {
  it('should render the value correctly', async () => {
    await TestUtilities.render(<LintCountIcon severity="info" value={ 10 } />);
    expect(TestUtilities.getByText(10)).toBeInTheDocument();
  });

  it('should render info icon', async () => {
    const { container } = await TestUtilities.render(<LintCountIcon severity="info" value={ 10 } />);
    expect(container.querySelector('.lint-count-icon .info')).toBeInTheDocument();
  });

  it('should render warn icon', async () => {
    const { container } = await TestUtilities.render(<LintCountIcon severity="warning" value={ 10 } />);
    expect(container.querySelector('.lint-count-icon .warning')).toBeInTheDocument();
  });

  it('should render error icon', async () => {
    const { container } = await TestUtilities.render(<LintCountIcon severity="error" value={ 10 } />);
    expect(container.querySelector('.lint-count-icon .error')).toBeInTheDocument();
  });

  it('should render success icon', async () => {
    const { container } = await TestUtilities.render(<LintCountIcon severity="success" value={ 10 } />);
    expect(container.querySelector('.lint-count-icon .success')).toBeInTheDocument();
  });
});