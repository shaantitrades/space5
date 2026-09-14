/**
 * Multi Convert - Security Badges
 * Indicateurs de sécurité et confiance
 */

'use client';

import { Shield, Lock, Check, Globe } from 'lucide-react';

export default function SecurityBadges() {
  /**
   * Badges de confiance affichés sur les pages de connexion et d'inscription.
   * ⚠️ N'afficher ici que des faits vérifiables : aucune certification non
   * obtenue (ISO 27001, SOC 2, « certifié RGPD ») ne doit y figurer.
   */
  const badges = [
    {
      icon: Shield,
      text: 'Chiffrement en transit (HTTPS)',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: Lock,
      text: 'Aucune installation',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      icon: Check,
      text: 'Aucune donnée revendue',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      icon: Globe,
      text: 'Disponible en 10 langues',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <div
            key={index}
            className={`flex items-center space-x-2 p-2 ${badge.bgColor} rounded-lg`}
          >
            <Icon className={`w-4 h-4 ${badge.color} flex-shrink-0`} />
            <span className="text-xs font-medium text-gray-700">
              {badge.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { SecurityBadges };
