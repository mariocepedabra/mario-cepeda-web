'use client';

import * as React from 'react';
import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  Video as VideoIcon,
} from 'lucide-react';

import { cn } from '../lib/utils';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  toast,
} from '../ui';
import { toVideoSource, uploadToStorage } from './media-upload';
import { VideoNode } from './video-extension';

interface TiptapEditorProps {
  value: string;
  onChange: (html: string) => void;
}

interface ToolButtonProps {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolButton({ onClick, active, label, children }: ToolButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 [&_svg]:size-4',
        active && 'bg-zinc-900 text-white hover:bg-zinc-800 hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

type MediaKind = 'image' | 'video';

/** Editor de texto enriquecido (Tiptap) con imágenes y videos. Devuelve HTML. */
export function TiptapEditor({ value, onChange }: TiptapEditorProps) {
  const [mediaKind, setMediaKind] = React.useState<MediaKind | null>(null);
  const [url, setUrl] = React.useState('');
  const [loop, setLoop] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      TiptapImage.configure({ inline: false, HTMLAttributes: { class: 'editor-image' } }),
      VideoNode,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class:
          'prose prose-sm prose-zinc max-w-none min-h-40 px-3 py-2 focus:outline-none [&_a]:text-blue-600 [&_a]:underline [&_img]:rounded-lg',
      },
    },
    onUpdate: ({ editor: ed }) => onChange(ed.getHTML()),
  });

  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const setLink = React.useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const input = window.prompt('URL del enlace:', previous ?? 'https://');
    if (input === null) return;
    if (input === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: input }).run();
  }, [editor]);

  const openMedia = (kind: MediaKind) => {
    setMediaKind(kind);
    setUrl('');
    setLoop(false);
  };
  const closeMedia = () => {
    setMediaKind(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const insertImage = (src: string) => editor?.chain().focus().setImage({ src }).run();
  const insertVideo = (src: string, kind: 'file' | 'embed', isLoop: boolean) =>
    editor?.chain().focus().insertContent({ type: 'video', attrs: { src, kind, loop: isLoop } }).run();

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !mediaKind) return;
    setUploading(true);
    const res = await uploadToStorage(file);
    setUploading(false);
    if ('error' in res) {
      toast.error(`No se pudo subir: ${res.error}`);
      return;
    }
    if (mediaKind === 'image') insertImage(res.url);
    else insertVideo(res.url, 'file', loop);
    toast.success('Archivo insertado.');
    closeMedia();
  };

  const insertFromUrl = () => {
    const value = url.trim();
    if (!value) return;
    if (mediaKind === 'image') {
      insertImage(value);
    } else {
      const { src, kind } = toVideoSource(value, loop);
      insertVideo(src, kind, loop);
    }
    closeMedia();
  };

  if (!editor) {
    return (
      <div className="min-h-40 rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2 text-sm text-zinc-400">
        Cargando editor…
      </div>
    );
  }

  return (
    <div className="rounded-md border border-zinc-300 bg-white">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 p-1">
        <ToolButton label="Negrita" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold />
        </ToolButton>
        <ToolButton label="Cursiva" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-zinc-200" />
        <ToolButton label="Título 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          <Heading2 />
        </ToolButton>
        <ToolButton label="Título 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <Heading3 />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-zinc-200" />
        <ToolButton label="Lista" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <List />
        </ToolButton>
        <ToolButton label="Lista numerada" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered />
        </ToolButton>
        <ToolButton label="Cita" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote />
        </ToolButton>
        <ToolButton label="Enlace" active={editor.isActive('link')} onClick={setLink}>
          <LinkIcon />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-zinc-200" />
        <ToolButton label="Insertar imagen" onClick={() => openMedia('image')}>
          <ImageIcon />
        </ToolButton>
        <ToolButton label="Insertar video" onClick={() => openMedia('video')}>
          <VideoIcon />
        </ToolButton>
        <span className="mx-1 h-5 w-px bg-zinc-200" />
        <ToolButton label="Deshacer" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 />
        </ToolButton>
        <ToolButton label="Rehacer" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 />
        </ToolButton>
      </div>
      <EditorContent editor={editor} />

      {/* Diálogo para insertar imagen o video */}
      <Dialog open={mediaKind !== null} onOpenChange={(o) => !o && closeMedia()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {mediaKind === 'image' ? 'Insertar imagen' : 'Insertar video'}
            </DialogTitle>
            <DialogDescription>
              Sube un archivo desde tu equipo o pega un enlace.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Subir desde tu equipo</Label>
              <input
                ref={fileRef}
                type="file"
                accept={mediaKind === 'image' ? 'image/*' : 'video/*'}
                onChange={onFile}
                disabled={uploading}
                className="mt-1.5 block w-full text-sm text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
              />
              {uploading ? <p className="mt-1 text-xs text-zinc-500">Subiendo…</p> : null}
            </div>

            <div className="flex items-center gap-2">
              <span className="h-px flex-1 bg-zinc-200" />
              <span className="text-xs text-zinc-400">o</span>
              <span className="h-px flex-1 bg-zinc-200" />
            </div>

            <div>
              <Label htmlFor="media-url">Pega un enlace</Label>
              <Input
                id="media-url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  mediaKind === 'image'
                    ? 'https://…/imagen.jpg'
                    : 'YouTube, TikTok, Instagram, Vimeo o …/video.mp4'
                }
                className="mt-1.5"
              />
            </div>

            {mediaKind === 'video' ? (
              <label className="flex items-start gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => setLoop(e.target.checked)}
                  className="mt-0.5"
                />
                <span>
                  Reproducir en <strong>bucle infinito</strong> (tipo GIF: se repite solo, sin
                  sonido). Funciona mejor con videos subidos y con YouTube/Vimeo.
                </span>
              </label>
            ) : null}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeMedia}>
              Cancelar
            </Button>
            <Button onClick={insertFromUrl} disabled={!url.trim() || uploading}>
              Insertar enlace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
