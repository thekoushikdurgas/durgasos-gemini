/**
 * @file Defines the main desktop component, which acts as the background and container for icons.
 */
import React from 'react';
import { useAppContext } from '../hooks/useAppContext';
import { APPS } from '../apps/index';
import { Icon } from './Icon';

/**
 * The Desktop component renders the wallpaper and the grid of application icons.
 * @param {object} props - The component props.
 * @param {() => void} props.onBackdropClick - Callback function executed when the desktop background is clicked, used to close the Start Menu.
 * @returns {React.ReactElement} The rendered desktop component.
 */
export const Desktop: React.FC<{ onBackdropClick: () => void }> = ({ onBackdropClick }) => {
  const { wallpaper } = useAppContext();
  
  return (
    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('${wallpaper}')` }} onClick={onBackdropClick}>
      <div className="p-4 flex flex-col flex-wrap h-full content-start gap-4">
        {APPS.filter(app => app.id !== 'notepad').map(app => (
          <Icon key={app.id} app={app} type="desktop" />
        ))}
      </div>
    </div>
  );
};
