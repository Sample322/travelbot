import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authVerify } from './api';
import Auth from './screens/Auth';
import Profile from './screens/Profile';
import Search from './screens/Search';
import RouteScreen from './screens/Route';
import Plan from './screens/Plan';
import Favorites from './screens/Favorites';

/**
 * Main application component. Handles high-level navigation between
 * screens based on user state and app logic. On mount it verifies
 * the user with the backend using Telegram initData; if the
 * verification succeeds we allow the user to proceed to the profile
 * setup or search; otherwise we show a login prompt.
 */
export default function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [screen, setScreen] = useState<'auth'|'profile'|'search'|'route'|'plan'|'favorites'>('auth');
  const [currentCity, setCurrentCity] = useState<any>(null);

  // Perform verification on initial load. The backend will either
  // return user data or reject the request. We update state
  // accordingly.
  useEffect(() => {
    (async () => {
      try {
        const result: any = await authVerify();
        if (result?.ok) {
          setUser(result.user);
          // If profile does not exist, remain in profile screen.
          setScreen('profile');
        } else {
          setScreen('auth');
        }
      } catch (err) {
        setScreen('auth');
      }
    })();
  }, []);

  // Screen rendering logic. Each screen component accepts callbacks
  // for navigation. Additional props are passed when necessary.
  if (screen === 'auth') {
    return <Auth onOk={() => setScreen('profile')} />;
  }
  if (screen === 'profile') {
    return <Profile onNext={() => setScreen('search')} />;
  }
  if (screen === 'search') {
    return <Search onSelect={(city: any) => {
      setCurrentCity(city);
      if (city.onLocation) {
        setScreen('route');
      } else {
        setScreen('plan');
      }
    }} onPlan={() => setScreen('plan')} />;
  }
  if (screen === 'route') {
    return <RouteScreen city={currentCity} onBack={() => setScreen('search')} onFav={() => setScreen('favorites')} />;
  }
  if (screen === 'plan') {
    return <Plan onBack={() => setScreen('search')} onToRoute={(city: any) => {
      setCurrentCity(city);
      setScreen('route');
    }} />;
  }
  if (screen === 'favorites') {
    return <Favorites onBack={() => setScreen('search')} onToRoute={(city: any) => {
      setCurrentCity(city);
      setScreen('route');
    }} />;
  }
  return null;
}