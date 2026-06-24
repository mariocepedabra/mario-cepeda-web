import type { Metadata } from 'next';

import { ComingSoon } from '@/components/coming-soon';

export const metadata: Metadata = {
  title: 'Libros',
  description: 'Libros que Mario Cepeda recomienda y reseña.',
};

export default function LibrosPage() {
  return (
    <ComingSoon
      eyebrow="Libros"
      title="Lecturas que marcan"
      description="Los libros que lo formaron y sus recomendaciones de temporada, con reseñas breves y portadas como protagonistas."
    />
  );
}
