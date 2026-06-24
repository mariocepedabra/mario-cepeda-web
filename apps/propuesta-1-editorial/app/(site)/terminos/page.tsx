import type { Metadata } from 'next';

import { ComingSoon } from '@/components/coming-soon';

export const metadata: Metadata = {
  title: 'Términos de uso',
  description: 'Términos de uso del sitio.',
};

export default function TerminosPage() {
  return (
    <ComingSoon
      eyebrow="Legal"
      title="Términos de uso"
      description="Las condiciones de uso de este sitio estarán publicadas aquí."
    />
  );
}
