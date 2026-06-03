import { Clapperboard, Compass, LogIn, RadioTower } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function AppNav() {
  return (
    <nav className="app-nav" aria-label="Primary">
      <NavLink to="/watchTogether" end>
        <Clapperboard size={17} aria-hidden="true" />
        Watch
      </NavLink>
      <a href="/watchTogether#catalog">
        <Compass size={17} aria-hidden="true" />
        Library
      </a>
      <a href="/watchTogether#providers">
        <RadioTower size={17} aria-hidden="true" />
        OTTs
      </a>
      <NavLink to="/watchTogether/join">
        <LogIn size={17} aria-hidden="true" />
        Join Room
      </NavLink>
    </nav>
  );
}
