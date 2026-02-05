/**
 * Multi Convert - Authentication Layout
 * Layout principal pour toutes les pages d'authentification
 */

'use client';

import { ReactNode } from 'react';
import { Link } from '@/i18n/routing';
import { ArrowLeft } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  background?: 'multiconvert' | 'academix';
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  background = 'multiconvert',
}: AuthLayoutProps) {
  const gradients = {
    multiconvert: 'from-purple-600 via-blue-600 to-purple-700',
    academix: 'from-blue-600 via-purple-600 to-blue-700',
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-md">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>

          {/* Logo */}
          <div className="mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Multi Convert
              </h1>
            </Link>
          </div>

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {title}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {subtitle}
            </p>
          </div>

          {/* Content */}
          {children}
        </div>
      </div>

      {/* Right Side - Image/Gradient */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradients[background]}`}
        >
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10" />
          
          <div className="h-full flex flex-col justify-center items-center p-12 text-white">
            <div className="max-w-md space-y-6">
              <h2 className="text-4xl font-bold">
                Rejoignez {background === 'multiconvert' ? '50,000+' : '10,000+'} professionnels
              </h2>
              <p className="text-lg text-white/90">
                {background === 'multiconvert' 
                  ? 'Convertissez tous vos fichiers en un seul endroit. PDF, Images, Vidéo, Audio et bien plus.'
                  : 'Accédez à des formations premium et développez vos compétences.'
                }
              </p>
              
              {/* Features list */}
              <div className="space-y-4 pt-6">
                {background === 'multiconvert' ? (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>45+ formats de fichiers supportés</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Conversion en quelques secondes</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Sécurité militaire garantie</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Formations certifiantes</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Accès à vie aux contenus</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span>Communauté active</span>
                    </div>
                  </>
                )}
              </div>

              {/* Testimonial */}
              <div className="pt-8 border-t border-white/20">
                <p className="text-sm italic">
                  "La meilleure plateforme que j'ai utilisée. Simple, rapide et efficace."
                </p>
                <p className="mt-2 text-sm font-medium">
                  - Marie L., Designer
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { AuthLayout };
