import { mergeAttributes, Node } from '@tiptap/core';

/**
 * Nodo Tiptap «video»: representa un video embebido (iframe de YouTube/Vimeo/
 * TikTok/Instagram) o un archivo subido (`<video>`), con opción de bucle/GIF.
 *
 * Se serializa como `<div data-video data-src data-kind data-loop>` con el
 * iframe o el video dentro, de modo que la web pública lo renderiza tal cual
 * (incluido el bucle) y el editor lo vuelve a leer al reabrir.
 */
export const VideoNode = Node.create({
  name: 'video',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      kind: { default: 'embed' as 'file' | 'embed' },
      loop: { default: false },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-video]',
        getAttrs: (node) => {
          const el = node as HTMLElement;
          return {
            src: el.getAttribute('data-src'),
            kind: (el.getAttribute('data-kind') as 'file' | 'embed') || 'embed',
            loop: el.getAttribute('data-loop') === 'true',
          };
        },
      },
    ];
  },

  renderHTML({ node }) {
    const src = (node.attrs.src as string) || '';
    const kind = (node.attrs.kind as 'file' | 'embed') || 'embed';
    const loop = Boolean(node.attrs.loop);

    const wrapper = {
      'data-video': '',
      'data-src': src,
      'data-kind': kind,
      'data-loop': loop ? 'true' : 'false',
      class: 'editor-video',
    };

    if (kind === 'file') {
      const videoAttrs: Record<string, string> = { src, playsinline: 'true' };
      if (loop) {
        // Comportamiento tipo GIF: bucle, autoplay y silenciado.
        videoAttrs.loop = 'true';
        videoAttrs.autoplay = 'true';
        videoAttrs.muted = 'true';
      } else {
        videoAttrs.controls = 'true';
      }
      return ['div', mergeAttributes(wrapper), ['video', videoAttrs]];
    }

    return [
      'div',
      mergeAttributes(wrapper),
      [
        'iframe',
        {
          src,
          frameborder: '0',
          loading: 'lazy',
          allow:
            'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen',
          allowfullscreen: 'true',
        },
      ],
    ];
  },
});
