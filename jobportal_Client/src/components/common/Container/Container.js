import React from 'react';

/**
 * A responsive container with appropriate max-width and padding
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.fluid - Whether the container should be full width
 * @param {string} props.as - Element type to render as (default: 'div')
 */
const Container = ({
  children,
  className = '',
  fluid = false,
  as: Component = 'div',
}) => {
  const containerClasses = [
    'w-full',
    'px-4',
    'sm:px-6',
    'md:px-8',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <Component className={containerClasses}>{children}</Component>;
};

export default Container; 