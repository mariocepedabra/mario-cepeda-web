import type { Metadata } from 'next';

import { ComingSoon } from '@/components/coming-soon';

export const metadata: Metadata = {
  title: 'Pensamiento',
  description: 'Ensayos, columnas e ideas de Mario Cepeda.',
};

export default function PensamientoPage() {
  return (
    <ComingSoon
      eyebrow="Pensamiento"
      title="Ideas en construcción"
      description="Ensayos, columnas y reflexiones sobre medios, región, tecnología y sociedad. Pronto encontrarás aquí el archivo completo de la voz de Mario."
    />
  );
}
