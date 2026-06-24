import type { Metadata } from 'next';

import { ComingSoon } from '@/components/coming-soon';

export const metadata: Metadata = {
  title: 'Trabajo',
  description: 'Quién es Mario Cepeda a través de lo que hace.',
};

export default function TrabajoPage() {
  return (
    <ComingSoon
      eyebrow="Trabajo"
      title="Lo que hace y por qué"
      description="Su trayectoria y sus proyectos —Página 10, Colombia Positiva— contados de cerca: el propósito, lo profesional y lo personal."
    />
  );
}
