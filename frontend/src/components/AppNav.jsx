import { Clapperboard, LogIn, Search, Smartphone, WalletCards } from "lucide-react";
import { NavLink } from "react-router-dom";

export default function AppNav() {
  return (
    <nav className="app-nav" aria-label="Primary">
      <NavLink to="/browse" end>
        <Clapperboard size={17} aria-hidden="true" />
        Home
      </NavLink>
      <a href="#search">
        <Search size={17} aria-hidden="true" />
        Search
      </a>
      <a href="#otts">OTTs</a>
      <a href="#free">Free</a>
      <a href="#plans">
        <WalletCards size={17} aria-hidden="true" />
        My Plans
      </a>
      <NavLink to="/join">
        <LogIn size={17} aria-hidden="true" />
        Join Room
      </NavLink>
      <a className="get-app-link" href="#get-app">
        <Smartphone size={17} aria-hidden="true" />
        Get App
      </a>
    </nav>
  );
}
