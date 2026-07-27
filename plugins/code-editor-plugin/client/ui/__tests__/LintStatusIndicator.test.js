import React from 'react';
import TestUtilities from '../../../shared-util/test-utilities';
import LintStatusIndicator from '../LintStatusIndicator';
import { act, fireEvent, waitFor } from '@testing-library/react';
import { CodeEditorContext } from '../../CodeEditorContext';

const renderComponent = async (state) => (
  await TestUtilities.render(
    <CodeEditorContext.Provider value={ { state } }>
      <LintStatusIndicator />
    </CodeEditorContext.Provider>
  )
);

describe('LintStatusIndicator', () => {
  it('should show pending status when lintStatus is null', async () => {
    await renderComponent({ lintEnabled: true });

    const statusText = await TestUtilities.getByText('Linting is pending.');
    expect(statusText).toBeVisible();

    const statusDot = TestUtilities.getByTestId('status-dot');
    expect(statusDot.className).toContain('status-blue');
  });

  it('should show disabled status when lintEnabled is false', async () => {
    await renderComponent({ lintEnabled: false });

    const statusText = await TestUtilities.getByText('Linting is disabled.');
    expect(statusText).toBeVisible();

    const statusDot = TestUtilities.getByTestId('status-dot');
    expect(statusDot.className).toContain('status-gray');
  });

  it('should show unavailable status when lintStatus has error', async () => {
    const lintStatus = { success: false, error: 'Server connection failed' };
    await renderComponent({ lintEnabled: true, lintStatus });

    const statusText = await TestUtilities.getByText('Linting is unavailable.');
    expect(statusText).toBeVisible();

    const statusDot = TestUtilities.getByTestId('status-dot');
    expect(statusDot.className).toContain('status-red');
  });

  it('should show running status when lintStatus is successful', async () => {
    const lintStatus = { success: true };
    await renderComponent({ lintEnabled: true, lintStatus });

    const statusText = await TestUtilities.getByText('Linting is running.');
    expect(statusText).toBeVisible();

    const statusDot = TestUtilities.getByTestId('status-dot');
    expect(statusDot.className).toContain('status-green');
  });

  it('should show tooltip with error message on hover', async () => {
    const lintStatus = { success: false, error: 'Connection timeout' };
    await renderComponent({ lintEnabled: true, lintStatus });

    const statusText = await TestUtilities.getByText('Linting is unavailable.');
    TestUtilities.mouseEnter(statusText);

    await waitFor(() => {
      expect(TestUtilities.getByText('Connection timeout')).toBeVisible();
    });

    TestUtilities.mouseLeave(statusText);
    await waitFor(() => {
      expect(TestUtilities.queryByText('Connection timeout')).not.toBeInTheDocument();
    });
  });

  it('should not show tooltip when no error exists', async () => {
    const lintStatus = { success: true };
    await renderComponent({ lintEnabled: true, lintStatus });

    const statusText = await TestUtilities.getByText('Linting is running.');
    TestUtilities.mouseEnter(statusText);

    await waitFor(() => {
      expect(TestUtilities.queryByText(/Error:/)).not.toBeInTheDocument();
    });
  });

  it('should copy error details to clipboard when status text is clicked', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true
    });

    const lintStatus = { success: false, error: 'Validation failed' };
    await renderComponent({ lintEnabled: true, lintStatus });

    const statusText = await TestUtilities.getByText('Linting is unavailable.');
    await TestUtilities.actAsync(async () => {
      fireEvent.click(statusText);
    });

    expect(mockWriteText).toHaveBeenCalledWith('Validation failed');
  });

  it('should show copied confirmation after copying', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true
    });

    const lintStatus = { success: false, error: 'Server error' };
    await renderComponent({ lintEnabled: true, lintStatus });

    const statusText = await TestUtilities.getByText('Linting is unavailable.');
    TestUtilities.mouseEnter(statusText);

    await act(async () => {
      fireEvent.click(statusText);
    });

    await waitFor(() => {
      expect(TestUtilities.getByText('Copied to clipboard.')).toBeVisible();
    });
  });

  it('should not copy when linting is disabled', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true
    });

    await renderComponent({ lintEnabled: false });

    const statusText = await TestUtilities.getByText('Linting is disabled.');
    await TestUtilities.actAsync(async () => {
      fireEvent.click(statusText);
    });

    expect(mockWriteText).not.toHaveBeenCalled();
  });

  it('should not copy when no error exists', async () => {
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true
    });

    const lintStatus = { success: true };
    await renderComponent({ lintEnabled: true, lintStatus });

    const statusText = await TestUtilities.getByText('Linting is running.');
    await TestUtilities.actAsync(async () => {
      fireEvent.click(statusText);
    });

    expect(mockWriteText).not.toHaveBeenCalled();
  });

  it('should log error when copying fails', async () => {
    const error = new Error('Clipboard not available');
    const mockWriteText = jest.fn().mockRejectedValue(error);
    const mockConsoleError = jest.spyOn(console, 'error').mockImplementation();

    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      configurable: true
    });

    const lintStatus = { success: false, error: 'Validation error' };
    await renderComponent({ lintEnabled: true, lintStatus });

    const statusText = await TestUtilities.getByText('Linting is unavailable.');
    await TestUtilities.actAsync(async () => {
      fireEvent.click(statusText);
    });

    expect(mockConsoleError).toHaveBeenCalledWith('Unable to copy to clipboard.', error);

    mockConsoleError.mockRestore();
  });
});
