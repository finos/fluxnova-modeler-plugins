import React from 'react';
import TestUtilities from '../../../shared-util/test-utilities';
import { CodeEditorContext } from '../../CodeEditorContext';
import LintCountIndicator from '../LintCountIndicator';

const renderComponent = async (state) => (
  await TestUtilities.render(
    <CodeEditorContext.Provider value={ { state } }>
      <LintCountIndicator />
    </CodeEditorContext.Provider>
  )
);

describe('LintCountIndicator', () => {
  it('should render nothing when linting is disabled', async () => {
    const { container } = await renderComponent({
      lintEnabled: false,
      lintStatus: { warnCount: 5, errorCount: 3, infoCount: 1 },
    });

    expect(container.querySelector('.lint-count-indicator')).not.toBeInTheDocument();
  });

  it('should render nothing when there are no warnings or errors', async () => {
    const { container } = await renderComponent({
      lintEnabled: true,
      lintStatus: { warnCount: 0, errorCount: 0, infoCount: 0 },
    });

    expect(container.querySelector('.footer-separator')).not.toBeInTheDocument();
  });

  it('should render error count correctly', async () => {
    const { container } = await renderComponent({
      lintEnabled: true,
      lintStatus: { warnCount: 0, errorCount: 10, infoCount: 0 },
    });

    expect(container.querySelector('.lint-count-icon .error')).toBeInTheDocument();
    expect(TestUtilities.getByText(10)).toBeInTheDocument();
    expect(container.querySelector('.footer-separator')).toBeInTheDocument();
  });

  it('should render warn count correctly', async () => {
    const { container } = await renderComponent({
      lintEnabled: true,
      lintStatus: { warnCount: 13, errorCount: 0, infoCount: 0 },
    });

    expect(container.querySelector('.lint-count-icon .warning')).toBeInTheDocument();
    expect(TestUtilities.getByText(13)).toBeInTheDocument();
    expect(container.querySelector('.footer-separator')).toBeInTheDocument();
  });

  it('should render info count correctly', async () => {
    const { container } = await renderComponent({
      lintEnabled: true,
      lintStatus: { warnCount: 0, errorCount: 0, infoCount: 7 },
    });

    expect(container.querySelector('.lint-count-icon .info')).toBeInTheDocument();
    expect(TestUtilities.getByText(7)).toBeInTheDocument();
    expect(container.querySelector('.footer-separator')).toBeInTheDocument();
  });

  it('should render all counts correctly', async () => {
    const { container } = await renderComponent({
      lintEnabled: true,
      lintStatus: { warnCount: 17, errorCount: 30, infoCount: 5 },
    });

    expect(container.querySelector('.lint-count-icon .error')).toBeInTheDocument();
    expect(container.querySelector('.lint-count-icon .warning')).toBeInTheDocument();
    expect(container.querySelector('.lint-count-icon .info')).toBeInTheDocument();
    expect(TestUtilities.getByText(17)).toBeInTheDocument();
    expect(TestUtilities.getByText(30)).toBeInTheDocument();
    expect(TestUtilities.getByText(5)).toBeInTheDocument();
    expect(container.querySelector('.footer-separator')).toBeInTheDocument();
  });
});