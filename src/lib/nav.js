import { createContext, useContext } from 'react';

export const NavContext = createContext(() => {});

export function useNavigate() {
  return useContext(NavContext);
}