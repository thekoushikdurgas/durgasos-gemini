/**
 * @file A custom hook for easy access to the AppContext.
 */
import { useContext } from 'react';
import { AppContext, AppContextType } from '../contexts/AppContext';

/**
 * Custom hook to consume the AppContext.
 * Provides a convenient way to access global state and actions
 * without having to import `useContext` and `AppContext` in every component.
 * It also includes a runtime check to ensure it's used within an `AppProvider`.
 *
 * @returns {AppContextType} The value of the application context.
 * @throws {Error} If the hook is used outside of an `AppProvider`.
 */
export const useAppContext = (): AppContextType => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};
