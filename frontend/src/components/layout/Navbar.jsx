import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Menu, X, Search, Bell, UserRound, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/matches", label: "Matches" },
  { to: "/teams", label: "Teams" },
  { to: "/players", label: "Players" },
  { to: "/community", label: "Community" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkCls = ({ isActive }) =>
    `relative px-1 py-2 text-sm font-medium transition ${
      isActive ? "text-ink" : "text-ink-muted hover:text-ink"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-midnight-900/80 backdrop-blur-xl">
      <div className="section-pad flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2" onClick={() => setOpen(false)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-fusion-gradient font-display text-sm font-bold text-midnight-950">
            MF
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-ink">
            Match<span className="text-gradient">Fusion</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={linkCls} end={link.to === "/"}>
              {({ isActive }) => (
                <>
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-[1px] left-0 right-0 h-[2px] rounded-full bg-fusion-gradient" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-3 lg:flex">
          <button
            onClick={() => navigate("/matches")}
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ink-muted transition hover:border-white/20 hover:text-ink"
          >
            <Search className="h-4 w-4" />
          </button>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/10 py-1 pl-1 pr-3 transition hover:border-white/20"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-fusion-gradient text-xs font-bold text-midnight-950">
                  {user.name?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="text-sm text-ink">{user.name}</span>
              </button>
              {menuOpen && (
                <div className="glass absolute right-0 top-12 w-48 overflow-hidden p-1.5">
                  <button
                    onClick={() => navigate("/community")}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-ink-muted hover:bg-white/[0.05] hover:text-ink"
                  >
                    <Bell className="h-4 w-4" /> Notifications
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                      navigate("/");
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-alert hover:bg-alert/10"
                  >
                    <LogOut className="h-4 w-4" /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !px-4 !py-2 text-sm">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2 text-sm">
                Sign up
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-ink lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="border-t border-white/[0.06] bg-midnight-900 px-5 pb-5 pt-2 lg:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive ? "bg-white/[0.06] text-ink" : "text-ink-muted"
                  }`
                }
                end={link.to === "/"}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-4 flex items-center gap-3 border-t border-white/[0.06] pt-4">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="btn-ghost w-full justify-center text-sm"
              >
                <UserRound className="h-4 w-4" /> Log out ({user.name})
              </button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1 justify-center text-sm">
                  Log in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1 justify-center text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
