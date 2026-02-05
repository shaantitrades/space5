/**
 * Multi Convert - Password Strength Meter
 * Indicateur de force du mot de passe
 */

'use client';

import { useState, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ShieldOff 
} from 'lucide-react';

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

export default function PasswordStrength({ 
  password, 
  showRequirements = true 
}: PasswordStrengthProps) {
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);

  const requirements = [
    { regex: /.{8,}/, text: '8 caractères minimum' },
    { regex: /[a-z]/, text: 'Une lettre minuscule' },
    { regex: /[A-Z]/, text: 'Une lettre majuscule' },
    { regex: /\d/, text: 'Un chiffre' },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, text: 'Un caractère spécial' },
  ];

  useEffect(() => {
    if (!password) {
      setScore(0);
      setFeedback([]);
      return;
    }

    let newScore = 0;
    const newFeedback: string[] = [];
    
    // Calcul du score
    if (password.length >= 8) newScore += 20;
    if (password.length >= 12) newScore += 10;
    if (/[a-z]/.test(password)) newScore += 20;
    if (/[A-Z]/.test(password)) newScore += 20;
    if (/\d/.test(password)) newScore += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) newScore += 15;
    
    // Feedback
    requirements.forEach(req => {
      if (!req.regex.test(password)) {
        newFeedback.push(req.text);
      }
    });

    setScore(newScore);
    setFeedback(newFeedback);
  }, [password]);

  const getStrengthLevel = () => {
    if (score >= 80) return { 
      level: 'Fort', 
      color: 'text-green-600', 
      bg: 'bg-green-500', 
      icon: ShieldCheck 
    };
    if (score >= 60) return { 
      level: 'Moyen', 
      color: 'text-amber-600', 
      bg: 'bg-amber-500', 
      icon: Shield 
    };
    if (score >= 40) return { 
      level: 'Faible', 
      color: 'text-red-600', 
      bg: 'bg-red-500', 
      icon: ShieldAlert 
    };
    return { 
      level: 'Très faible', 
      color: 'text-gray-600', 
      bg: 'bg-gray-300', 
      icon: ShieldOff 
    };
  };

  if (!password) return null;

  const strength = getStrengthLevel();
  const Icon = strength.icon;

  return (
    <div className="space-y-3 mt-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className={`w-5 h-5 ${strength.color}`} />
          <span className={`text-sm font-medium ${strength.color}`}>
            {strength.level}
          </span>
        </div>
        <span className="text-sm text-gray-500">{score}%</span>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${strength.bg} transition-all duration-300`}
          style={{ width: `${score}%` }}
        />
      </div>
      
      {/* Requirements list */}
      {showRequirements && feedback.length > 0 && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm font-medium text-gray-700 mb-2">
            À améliorer :
          </p>
          <ul className="space-y-1">
            {feedback.map((req, index) => (
              <li key={index} className="flex items-center text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2 flex-shrink-0" />
                {req}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export { PasswordStrength };
