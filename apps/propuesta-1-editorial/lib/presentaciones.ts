import type { Slide } from '@/components/slide-presentation';

/** Presentación «La filosofía estoica» (exportada del .pptx de Mario a WebP 16:9). */
export const ESTOICISMO = {
  title: 'La filosofía estoica: un arte para vivir mejor',
  subtitle:
    'Serenidad, virtud y fortaleza interior para tiempos difíciles. Pasa las diapositivas a tu ritmo.',
};

export const ESTOICISMO_SLIDES: Slide[] = [
  { src: '/presentaciones/filosofia-estoica/slide-01.webp', alt: 'Portada: La filosofía estoica, un arte para vivir mejor. Por Mario Cepeda Bravo.' },
  { src: '/presentaciones/filosofia-estoica/slide-02.webp', alt: 'Pensamiento — Mario Cepeda Bravo.' },
  { src: '/presentaciones/filosofia-estoica/slide-03.webp', alt: 'El origen: el nacimiento del estoicismo con Zenón de Citio hacia el año 300 a. C.' },
  { src: '/presentaciones/filosofia-estoica/slide-04.webp', alt: 'Definición: ¿qué es el estoicismo? No controlamos todo lo que ocurre, pero sí nuestra respuesta.' },
  { src: '/presentaciones/filosofia-estoica/slide-05.webp', alt: 'Linaje: los grandes estoicos — Zenón, Crisipo, Séneca, Epicteto y Marco Aurelio.' },
  { src: '/presentaciones/filosofia-estoica/slide-06.webp', alt: 'Brújula interior: los principios fundamentales del estoicismo.' },
  { src: '/presentaciones/filosofia-estoica/slide-07.webp', alt: 'El núcleo ético: las cuatro virtudes estoicas — sabiduría, justicia, valentía y templanza.' },
  { src: '/presentaciones/filosofia-estoica/slide-08.webp', alt: 'El regreso contemporáneo: autores actuales del estoicismo.' },
  { src: '/presentaciones/filosofia-estoica/slide-09.webp', alt: 'Relevancia: ¿por qué el estoicismo es pertinente hoy?' },
  { src: '/presentaciones/filosofia-estoica/slide-10.webp', alt: 'Aquí y ahora: el estoicismo en Colombia y Nariño.' },
  { src: '/presentaciones/filosofia-estoica/slide-11.webp', alt: 'Práctica diaria: ejercicios estoicos.' },
  { src: '/presentaciones/filosofia-estoica/slide-12.webp', alt: 'Ejercicio práctico: lo que depende de mí y lo que no depende de mí.' },
  { src: '/presentaciones/filosofia-estoica/slide-13.webp', alt: 'Cierre: una mente más fuerte para atravesar el dolor. ¿Qué haremos con aquello que no podemos controlar?' },
  { src: '/presentaciones/filosofia-estoica/slide-14.webp', alt: 'Sígueme — Mario Cepeda Bravo.' },
  { src: '/presentaciones/filosofia-estoica/slide-15.webp', alt: 'Muchas gracias.' },
  {
    alt: 'Mario Cepeda presentando «La filosofía estoica» ante el público.',
    frame: {
      kind: 'image',
      media: '/presentaciones/filosofia-estoica/foto-charla.webp',
      eyebrow: 'En vivo',
      title: 'La charla',
      caption: 'Mario Cepeda comparte «La filosofía estoica» con el público.',
    },
  },
  {
    alt: 'Video: un momento de la presentación de «La filosofía estoica».',
    frame: {
      kind: 'video',
      media: '/presentaciones/filosofia-estoica/video-charla.mp4',
      eyebrow: 'En vivo',
      title: 'En video',
      caption: 'Un momento de la presentación.',
    },
  },
];
