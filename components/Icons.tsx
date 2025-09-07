/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import type { Character } from '../types';

export const LogoIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        d="M21 15.4375V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H12"
        className="logo-icon-container"
      />
      <path
        d="M12 12C12 11.4477 12.4477 11 13 11H15C16.6569 11 18 9.65685 18 8V8C18 6.34315 16.6569 5 15 5H12V18"
        className="logo-icon-stem"
      />
      <path
        d="M12 12C12 12.5523 11.5523 13 11 13H9C7.34315 13 6 14.3431 6 16V16C6 17.6569 7.34315 19 9 19H12"
        className="logo-icon-leaf"
      />
    </svg>
  );

export const HeroIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="character-icon">
        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6h-3a.75.75 0 000 1.5h3v3a.75.75 0 001.5 0v-3h3a.75.75 0 000-1.5h-3V6z" clipRule="evenodd" />
    </svg>
);

export const VillainIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="character-icon">
        <path d="M11.332 2.062a1.5 1.5 0 011.336 0l8.25 4.5a1.5 1.5 0 01.667 1.321v5.234a1.5 1.5 0 01-.667 1.321l-8.25 4.5a1.5 1.5 0 01-1.336 0l-8.25-4.5A1.5 1.5 0 012.25 13.117V7.883a1.5 1.5 0 01.667-1.321l8.25-4.5zM12 4.141L5.392 7.883v5.234L12 16.859l6.608-3.742V7.883L12 4.141zM13.5 12a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
);

export const SidekickIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="character-icon">
        <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.946 1.544l-.453 2.035A11.979 11.979 0 005.13 7.21l-2.035-.453A1.5 1.5 0 001.5 8.795l-1.544 1.946c-.663.917-.663 2.197 0 3.114l1.544 1.946a1.5 1.5 0 002.035.453l2.035-.453a11.979 11.979 0 002.396 2.396l-.453 2.035a1.5 1.5 0 001.544 1.946l1.946 1.544c.917.663 2.197.663 3.114 0l1.946-1.544a1.5 1.5 0 001.544-1.946l-.453-2.035a11.979 11.979 0 002.396-2.396l2.035.453a1.5 1.5 0 002.035-.453l1.544-1.946c.663-.917.663-2.197 0-3.114l-1.544-1.946a1.5 1.5 0 00-2.035-.453l-2.035.453a11.979 11.979 0 00-2.396-2.396l.453-2.035a1.5 1.5 0 00-1.544-1.946l-1.946-1.544a2.97 2.97 0 00-1.558-.41zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
    </svg>
);

export const CharacterIcon: React.FC<{ type: Character['type'] }> = ({ type }) => {
    switch (type) {
        case 'Hero':
            return <HeroIcon />;
        case 'Villain':
            return <VillainIcon />;
        case 'Sidekick':
            return <SidekickIcon />;
        default:
            return null;
    }
};

export const HelpIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="currentColor">
        <path d="M0 0h24v24H0V0z" fill="none"/>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2v-2zm2-1.61c1.24-.42 2-1.51 2-2.89 0-1.66-1.34-3-3-3s-3 1.34-3 3h2c0-.55.45-1 1-1s1 .45 1 1c0 .7-.41 1.25-1.07 1.56-.63.29-1.07.96-1.07 1.7V15h2v-1.61z"/>
    </svg>
);