import type { Metadata } from 'next';

import { ComingSoon } from '@/components/coming-soon';

export const metadata: Metadata = {
  title: 'Nariño',
  description: 'Gente, lugares y tradiciones de Nariño.',
};

export default function NarinoPage() {
  return (
    <ComingSoon
      eyebrow="Nariño"
      title="Orgullo de su tierra"
      description="Personas admirables, lugares y tradiciones de Nariño: el Carnaval, el Galeras y la gente que hace grande a la región."
    />
  );
}
