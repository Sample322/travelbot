import React from 'react';

interface HeaderProps {
  /**
   * Optional title to display in the centre of the header. If not
   * provided, the slot is left empty. Can be translated in the
   * parent component before passing down.
   */
  title?: string;
  /**
   * Handler for the back button. When provided, a back arrow
   * appears on the left side of the header. If undefined, no
   * back button is rendered.
   */
  onBack?: () => void;
  /**
   * Handler to open the favourites page. A star icon will be
   * displayed on the right when defined. If undefined, the star
   * button is omitted.
   */
  onFavorites?: () => void;
  /**
   * Handler to open the profile or settings page. A generic
   * profile button will be shown on the right. If undefined, the
   * profile button is omitted.
   */
  onProfile?: () => void;
}

/**
 * Generic header component for the TravelBot app. It is designed
 * to be lightweight and easily reusable across screens. The header
 * optionally displays a back arrow on the left and up to two
 * action buttons on the right (favourites and profile). If no
 * handlers are provided for these buttons, they are simply not
 * rendered. This allows each screen to specify only the controls
 * it needs without clutter.
 */
export default function Header({ title, onBack, onFavorites, onProfile }: HeaderProps) {
  return (
    <div className="w-full flex items-center justify-between p-3 border-b bg-white/80 backdrop-blur-md">
      <div className="flex items-center">
        {onBack && (
          <button onClick={onBack} className="text-blue-600 mr-2 text-lg" aria-label="Назад">
            {/* Unicode left arrow is used instead of an image to avoid extra assets */}
            ←
          </button>
        )}
        {title && <h1 className="text-lg font-bold truncate max-w-xs">{title}</h1>}
      </div>
      <div className="flex items-center space-x-3">
        {onFavorites && (
          <button onClick={onFavorites} className="text-yellow-500 text-xl" aria-label="Избранное">
            ★
          </button>
        )}
        {onProfile && (
          <button onClick={onProfile} className="text-blue-600" aria-label="Профиль">
            Профиль
          </button>
        )}
      </div>
    </div>
  );
}