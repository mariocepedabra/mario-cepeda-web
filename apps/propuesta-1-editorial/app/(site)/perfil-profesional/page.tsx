import type { Metadata } from 'next';

import { parsePerfilMedia, perfilText } from '@mario/core/lib';
import { placeholderImage } from '@mario/database';
import { getProfile, getSettings } from '@mario/database/queries';

import { PerfilProfesional, type PerfilData } from '@/components/perfil-profesional';

export const metadata: Metadata = {
  title: 'Perfil profesional',
  description:
    'Trayectoria de Mario Cepeda Bravo: abogado, magíster en Estudios Políticos y en Planificación ' +
    'Urbana y Regional, director de Página 10 y Colombia Positiva.',
};

export default async function PerfilProfesionalPage() {
  const [profile, settings] = await Promise.all([getProfile(), getSettings()]);
  const media = parsePerfilMedia(settings);

  const data: PerfilData = {
    eyebrow: perfilText(settings, 'perfil.eyebrow'),
    titulo: perfilText(settings, 'perfil.titulo'),
    lema: perfilText(settings, 'perfil.lema'),
    lugar: perfilText(settings, 'perfil.lugar'),
    intro: perfilText(settings, 'perfil.intro'),
    intro2: perfilText(settings, 'perfil.intro2'),
    cierre: perfilText(settings, 'perfil.cierre'),
    heroMedia: media.hero || profile.foto_url || placeholderImage('mario-retrato', 900, 1100),
    secundariaMedia: media.secundaria,
  };

  return <PerfilProfesional data={data} />;
}
