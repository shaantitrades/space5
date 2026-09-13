import type { Metadata } from 'next';
import { QrGenerator } from '@/components/qr/qr-generator';

export const metadata: Metadata = {
  title: 'Générateur de QR Code gratuit',
  description:
    'Générez des QR codes gratuitement : URL, WiFi, vCard, email, téléphone, SMS et géolocalisation. Export PNG et SVG.',
  keywords: ['QR code', 'générateur QR code', 'QR code WiFi', 'QR code vCard', 'QR code URL'],
};

export default function QrPage() {
  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <QrGenerator />
      </div>
    </div>
  );
}
