/**
 * Menu utilisateur - Affiche profil ou boutons connexion/inscription
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { Link } from '@/i18n/routing';
import { User, LogOut, Settings, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function UserMenu() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Pas connecté - afficher les boutons login/signup
  if (!isAuthenticated) {
    return (
      <div className="hidden md:flex items-center space-x-2">
        <Link
          href="/login"
          className="text-sm font-medium text-muted-foreground hover:text-primary"
        >
          Connexion
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
        >
          S'Inscrire
        </Link>
      </div>
    );
  }

  // Connecté - afficher le menu utilisateur
  return (
    <div className="hidden md:block relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm font-medium">{user?.fullName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg py-1 z-[9999]">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          {/* Menu Items */}
          <Link
            href="/dashboard"
            className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Tableau de bord</span>
          </Link>

          <Link
            href="/dashboard/settings"
            className="flex items-center space-x-2 px-4 py-2 text-sm hover:bg-accent transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <Settings className="w-4 h-4" />
            <span>Paramètres</span>
          </Link>

          <div className="border-t border-border my-1"></div>

          {/* Logout */}
          <button
            onClick={() => {
              logout();
              setIsOpen(false);
            }}
            className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      )}
    </div>
  );
}
