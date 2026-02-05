'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ArrowLeft,
  FileText, Combine, Scissors, Minimize2, FileSearch,
  Edit, PenTool, PenLine, ShieldX, Lock, Unlock, Droplet,
  Layers, RotateCw, Crop, Trash } from 'lucide-react';
import { Link } from '@/i18n/routing';

interface ToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PDFTool {
  id: string;
  name: string;
  description: string;
  icon: any;
  href: string;
}

export function ToolsModal({ isOpen, onClose }: ToolsModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const pdfTools: PDFTool[] = [
    {
      id: 'annotate',
      name: 'Annoter le PDF',
      description: 'Ajoutez du texte, des images, des formes, des dessins, des notes autocollantes, des surlignages et bien plus encore.',
      icon: PenTool,
      href: '/pdf?tool=annotate',
    },
    {
      id: 'edit',
      name: 'Modifier PDF',
      description: 'Modifiez des PDF avec du texte, des images, des formes, des annotations, des polices et des couleurs.',
      icon: Edit,
      href: '/pdf?tool=edit',
    },
    {
      id: 'sign',
      name: 'Signer un PDF',
      description: 'Appliquez votre signature, ajoutez des initiales, des dates, des cases à cocher et plus encore.',
      icon: PenLine,
      href: '/pdf?tool=sign',
    },
    {
      id: 'convert',
      name: 'Convertir un document',
      description: 'Convertissez facilement des fichiers en PDF, Word, Excel, etc.',
      icon: FileText,
      href: '/pdf?tool=convert',
    },
    {
      id: 'merge',
      name: 'Fusionner des documents',
      description: 'Combinez des PDF dans n\'importe quel ordre grâce à notre outil de fusion.',
      icon: Combine,
      href: '/pdf?tool=merge',
    },
    {
      id: 'compress',
      name: 'Compresser le PDF',
      description: 'Réduisez la taille des fichiers tout en optimisant pour une qualité PDF maximale.',
      icon: Minimize2,
      href: '/pdf?tool=compress',
    },
    {
      id: 'redact',
      name: 'Caviarder le PDF',
      description: 'Supprimez définitivement les informations sensibles de votre PDF.',
      icon: ShieldX,
      href: '/pdf?tool=redact',
    },
    {
      id: 'organize',
      name: 'Organiser les pages',
      description: 'Triez vos pages PDF comme vous le souhaitez. Supprimez ou ajoutez des pages si nécessaire.',
      icon: Layers,
      href: '/pdf?tool=organize',
    },
    {
      id: 'split',
      name: 'Scinder et extraire des pages',
      description: 'Scindez et extrayez des pages PDF pour créer des fichiers distincts.',
      icon: Scissors,
      href: '/pdf?tool=split',
    },
    {
      id: 'protect',
      name: 'Protection par mot de passe',
      description: 'Sécurisez vos PDF en ajoutant un mot de passe.',
      icon: Lock,
      href: '/pdf?tool=protect',
    },
    {
      id: 'unlock',
      name: 'Déverrouiller le PDF',
      description: 'Supprimez les mots de passe PDF pour un accès complet et une plus grande flexibilité.',
      icon: Unlock,
      href: '/pdf?tool=unlock',
    },
    {
      id: 'watermark',
      name: 'Ajouter un filigrane',
      description: 'Ajoutez un filigrane ou du texte comme protection à vos fichiers PDF.',
      icon: Droplet,
      href: '/pdf?tool=watermark',
    },
    {
      id: 'rotate',
      name: 'Faire pivoter les pages',
      description: 'Faites pivoter vos pages PDF en mode portrait ou paysage.',
      icon: RotateCw,
      href: '/pdf?tool=rotate',
    },
    {
      id: 'delete-pages',
      name: 'Supprimer des pages',
      description: 'Supprimez une ou plusieurs pages de votre fichier PDF.',
      icon: Trash,
      href: '/pdf?tool=delete-pages',
    },
    {
      id: 'crop',
      name: 'Recadrer les pages',
      description: 'Recadrez et découpez vos documents avec notre recadrage PDF.',
      icon: Crop,
      href: '/pdf?tool=crop',
    },
  ];

  const modalContent = (
    <div 
      className="fixed inset-0"
      style={{ 
        backgroundColor: '#000000',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div 
        className="fixed inset-0 z-[10001] flex items-center justify-center p-4"
        style={{ pointerEvents: 'none' }}
      >
        <div 
          className="relative w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          style={{ pointerEvents: 'auto' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-background/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-center pr-8">
              Choisissez l&apos;outil avec lequel vous souhaitez travailler
            </h2>
          </div>

          {/* Content - Grille de 3 colonnes */}
          <div className="p-6 overflow-y-auto flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pdfTools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link
                    key={tool.id}
                    href={tool.href}
                    onClick={onClose}
                    className="group p-4 bg-white border border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="flex-shrink-0 p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-bold text-base group-hover:text-primary transition-colors">
                        {tool.name}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {tool.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Footer avec bouton Retour */}
          <div className="p-6 border-t bg-gray-50">
            <button
              onClick={onClose}
              className="inline-flex items-center space-x-2 px-6 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span>Retour</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
