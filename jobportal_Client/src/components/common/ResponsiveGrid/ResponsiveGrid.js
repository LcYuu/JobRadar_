import React from 'react';

/**
 * A responsive grid layout component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render in the grid
 * @param {string} props.className - Additional CSS classes
 * @param {number} props.cols - Default number of columns (1-6)
 * @param {number} props.smCols - Number of columns on small screens (sm)
 * @param {number} props.mdCols - Number of columns on medium screens (md)
 * @param {number} props.lgCols - Number of columns on large screens (lg)
 * @param {number} props.xlCols - Number of columns on extra large screens (xl)
 * @param {string} props.gap - Gap between grid items (e.g. '4', '6', '8')
 */
const ResponsiveGrid = ({
  children,
  className = '',
  cols = 1,
  smCols,
  mdCols,
  lgCols,
  xlCols,
  gap = '4',
}) => {
  // Map number of columns to appropriate grid classes
  const getGridCols = (num) => {
    const gridMap = {
      1: 'grid-cols-1',
      2: 'grid-cols-2',
      3: 'grid-cols-3',
      4: 'grid-cols-4',
      5: 'grid-cols-5',
      6: 'grid-cols-6',
    };
    return gridMap[num] || 'grid-cols-1';
  };

  // Build responsive classes
  const gridClasses = [
    'grid',
    `gap-${gap}`,
    getGridCols(cols),
    smCols ? `sm:${getGridCols(smCols)}` : '',
    mdCols ? `md:${getGridCols(mdCols)}` : '',
    lgCols ? `lg:${getGridCols(lgCols)}` : '',
    xlCols ? `xl:${getGridCols(xlCols)}` : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={gridClasses}>{children}</div>;
};

export default ResponsiveGrid; 