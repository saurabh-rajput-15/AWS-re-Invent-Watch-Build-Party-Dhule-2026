import React from 'react';

interface AwsLogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'navbar';
}

/**
 * Authentic vector AWS and AWS re:Invent logo components.
 */
export const AwsLogo: React.FC<{ className?: string }> = ({ className = 'h-6' }) => (
  <svg
    viewBox="0 0 108 65"
    fill="currentColor"
    className={className}
    aria-label="AWS Logo"
    role="img"
  >
    {/* 'a' */}
    <path
      d="M26.2 38.3c-2.3 2.1-5.5 3.3-8.8 3.3-6.8 0-11.2-4.6-11.2-11.7 0-7.3 4.8-12 11.8-12 3 0 5.8 1 7.9 2.7l.2-2.1h6.6v23.2h-6.5v-3.4zm-6.6-4.9c3.2 0 5.9-2.3 6.6-5.6V23c-1.8-1.5-4.1-2.4-6.6-2.4-4 0-6.6 2.8-6.6 6.8 0 3.9 2.5 6 6.6 6z"
      fill="currentColor"
    />
    {/* 'w' */}
    <path
      d="M57.6 18.2l-6.4 23.2h-6.7l-4.5-16.7-4.5 16.7h-6.7l-6.4-23.2h7.1l3.5 15.2 4.4-15.2h5.5l4.4 15.2 3.5-15.2h6.6z"
      fill="currentColor"
    />
    {/* 's' */}
    <path
      d="M74.3 28.2c0-5.8-4.4-10.4-11.9-10.4-6.5 0-11.2 3.7-11.6 9.4h6.7c.3-2.6 2.3-4.2 5.1-4.2 3.3 0 5.1 1.6 5.1 4.1 0 2.2-1.8 3.5-5.6 4.3-6.6 1.4-11.1 3.5-11.1 9.4 0 5.6 4.4 10 11.7 10 4.1 0 7.8-1.5 9.7-4.1l.3 3.5h6.2V28.2h-4.5zm-5 7.8c0 3.8-2.9 6.2-7 6.2-3.8 0-6-1.8-6-4.6 0-2.6 1.9-4 5.9-4.8l7.1-1.4v4.6z"
      fill="currentColor"
    />
    {/* AWS Smile Arrow in signature AWS Orange */}
    <path
      d="M87.5 49.3c-12.8 9.3-31.5 14.2-47.6 14.2-22.7 0-43.2-8.3-58.7-22.3-.5-.4-.1-1 .5-.7 15.8 8.9 35.3 14.2 55.4 14.2 15 0 31.8-3.6 47.1-11.1 1.2-.6 2.2.8 1.1 1.7"
      fill="#FF9900"
    />
    <path
      d="M93.3 43.8c-1.6-.2-10.5-.8-15.7 3.2-.8.6-.2 1.6.6 1.4 4.5-1.1 10.3-.7 13.5 1.5 1 1 2.3-.2 1.6-6.1"
      fill="#FF9900"
    />
  </svg>
);

export const AwsReInventLogo: React.FC<AwsLogoProps> = ({
  className = 'h-8'
}) => {
  return (
    <img
      src="/AWS re_Invent_dark.png"
      alt="AWS re:Invent Dhule 2026"
      className={`${className} w-auto object-contain`}
    />
  );
};

export const AwsBuilderLogo: React.FC<{ className?: string }> = ({
  className = 'h-7'
}) => {
  return (
    <img
      src="/AWS_Builder.png"
      alt="AWS Student Builder Group at SVKM's IOT Dhule"
      className={`${className} w-auto object-contain`}
    />
  );
};
