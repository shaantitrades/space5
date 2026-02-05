'use client';

import { Zap, Shield, Globe } from 'lucide-react';

export function Features() {
  return (
    <section className="py-6 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col items-center text-center">
            <Zap className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
            <p className="text-sm text-muted-foreground">
              Convert files in seconds with our optimized processing engine
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Shield className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Military Security</h3>
            <p className="text-sm text-muted-foreground">
              Enterprise-grade security with geo-blocking and fraud protection
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <Globe className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Global Platform</h3>
            <p className="text-sm text-muted-foreground">
              Available in 10 languages, optimized for premium markets
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
