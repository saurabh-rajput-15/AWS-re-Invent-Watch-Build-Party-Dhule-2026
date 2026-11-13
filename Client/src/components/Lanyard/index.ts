import React from 'react';
// @ts-ignore - JavaScript component from React Bits
import LanyardComponent from './Lanyard.jsx';

export interface LanyardProps {
  frontImage?: string;
  backImage?: string;
  imageFit?: 'cover' | 'contain';
  cardColor?: string;
  orientation?: 'portrait' | 'landscape';
  finish?: 'glossy' | 'matte' | 'holographic' | 'metallic';
  cornerRadius?: number;
  size?: number;
  anchor?: 'left' | 'center' | 'right';
  strapLength?: number;
  strapImage?: string;
  strapColor?: string;
  strapWidth?: number;
  metal?: 'silver' | 'gold' | 'black';
  gravity?: number;
  damping?: number;
  elasticity?: number;
  breeze?: number;
  interactive?: boolean;
  intro?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const Lanyard: React.FC<LanyardProps> = (props) => {
  return React.createElement(LanyardComponent, props);
};

export default Lanyard;
