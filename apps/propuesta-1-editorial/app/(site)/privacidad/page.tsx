import type { Metadata } from 'next';

import { ComingSoon } from '@/components/coming-soon';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Política de privacidad del sitio.',
};

export default function PrivacidadPage() {
  return (
    <ComingSoon
      eyebrow="Legal"
      title="Política de privacidad"
      description="La política de tratamiento de datos personales de este sitio estará publicada aquí."
    />
  );
}
