import React from 'react';

interface AwsLogoProps {
  className?: string;
  variant?: 'full' | 'mark' | 'navbar';
  theme?: 'dark' | 'light';
}

export const AwsReInventLogo: React.FC<AwsLogoProps> = ({
  className = 'h-8',
  theme = 'dark'
}) => {
  return (
    <img
      src={theme === 'light' ? '/AWS_reinvent-light.png' : '/AWS_reinvent-dark.png'}
      alt="AWS re:Invent Dhule 2026"
      width={783}
      height={281}
      decoding="async"
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
      alt="AWS Student Builder Group Dhule"
      width={1121}
      height={205}
      decoding="async"
      className={`${className} w-auto object-contain`}
    />
  );
};
