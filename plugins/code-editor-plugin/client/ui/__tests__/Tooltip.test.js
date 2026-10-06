import React from 'react';
import TestUtilities from '../../../shared-util/test-utilities';
import Tooltip from '../Tooltip';

describe('Tooltip', () => {
  let tooltipTrigger = 'Hover', tooltipContent;

  it('renders children and does not show tooltip initially', async () => {
    tooltipContent = 'Tooltip content';
    await TestUtilities.render(
      <Tooltip content={ tooltipContent }>
        <button>{tooltipTrigger}</button>
      </Tooltip>
    );

    expect(TestUtilities.getByText(tooltipTrigger)).toBeInTheDocument();
    expect(TestUtilities.queryByText(tooltipContent)).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter after delay', async () => {
    tooltipContent = 'Tooltip is visible';
    await TestUtilities.render(
      <Tooltip content={ tooltipContent }>
        <button>{tooltipTrigger}</button>
      </Tooltip>
    );

    TestUtilities.mouseEnter(TestUtilities.getByText(tooltipTrigger));
    expect(TestUtilities.queryByText(tooltipContent)).not.toBeInTheDocument();

    await TestUtilities.allowComponentUpdates(400);
    expect(TestUtilities.getByText(tooltipContent)).toBeInTheDocument();
  });

  it('hides tooltip on mouse leave after delay', async () => {
    tooltipContent = 'Tooltip to hide';
    await TestUtilities.render(
      <Tooltip content={ tooltipContent }>
        <button>{tooltipTrigger}</button>
      </Tooltip>
    );
    TestUtilities.mouseEnter(TestUtilities.getByText(tooltipTrigger));
    expect(TestUtilities.queryByText(tooltipContent)).not.toBeInTheDocument();

    await TestUtilities.allowComponentUpdates(400);
    expect(TestUtilities.getByText(tooltipContent)).toBeInTheDocument();

    await TestUtilities.mouseLeave(TestUtilities.getByText(tooltipTrigger));
    expect(TestUtilities.queryByText(tooltipContent)).not.toBeInTheDocument();
  });
});