'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm, type Resolver } from 'react-hook-form';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { z } from 'zod';

import { deleteRow, saveRow } from '../actions';
import { slugify } from '../lib/utils';
import type { ListTable } from '../schemas';
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
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
  toast,
} from '../ui';
import { MediaField } from './media-field';
import { crudConfigs } from './resources';
import { EmptyState } from './states';
import { TiptapEditor } from './tiptap-editor';

export interface CrudField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'url' | 'date' | 'switch' | 'select' | 'richtext' | 'media';
  placeholder?: string;
  options?: readonly { value: string; label: string }[];
  full?: boolean;
  help?: string;
  /** Si se indica, muestra un botón que genera un slug a partir de ese campo. */
  generateFrom?: string;
}

export interface CrudColumn<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export interface CrudConfig<T> {
  table: ListTable;
  title: string;
  singular: string;
  description?: string;
  schema: z.ZodTypeAny;
  fields: CrudField[];
  columns: CrudColumn<T>[];
  defaultValues: Record<string, unknown>;
}

type FormValues = Record<string, unknown>;

interface CrudManagerProps<T extends { id: string }> {
  /** Tabla a gestionar. La config (con funciones) se resuelve en cliente. */
  table: ListTable;
  rows: T[];
}

export function CrudManager<T extends { id: string }>({ table, rows }: CrudManagerProps<T>) {
  const config = crudConfigs[table] as unknown as CrudConfig<T>;
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState<T | null>(null);
  const [pending, setPending] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(config.schema) as unknown as Resolver<FormValues>,
    defaultValues: config.defaultValues,
  });

  const openNew = () => {
    setEditingId(null);
    form.reset(config.defaultValues);
    setOpen(true);
  };

  const openEdit = (row: T) => {
    setEditingId(row.id);
    const values: FormValues = { ...config.defaultValues };
    for (const field of config.fields) {
      const raw = (row as Record<string, unknown>)[field.name];
      if (field.type === 'date' && typeof raw === 'string') {
        values[field.name] = raw.slice(0, 10);
      } else if (field.type === 'switch') {
        values[field.name] = Boolean(raw);
      } else {
        values[field.name] = raw ?? config.defaultValues[field.name] ?? '';
      }
    }
    form.reset(values);
    setOpen(true);
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setPending(true);
    const res = await saveRow(config.table, editingId, values);
    setPending(false);
    if (res.ok) {
      toast.success(editingId ? 'Cambios guardados.' : `${config.singular} creada.`);
      setOpen(false);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  });

  const confirmDelete = async () => {
    if (!deleting) return;
    setPending(true);
    const res = await deleteRow(config.table, deleting.id);
    setPending(false);
    if (res.ok) {
      toast.success('Elemento eliminado.');
      setDeleting(null);
      router.refresh();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">{config.title}</h1>
          {config.description ? (
            <p className="text-sm text-zinc-500">{config.description}</p>
          ) : null}
        </div>
        <Button onClick={openNew}>
          <Plus /> Nuevo
        </Button>
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="Sin elementos"
          description={`Aún no hay ${config.title.toLowerCase()}. Crea el primero con el botón «Nuevo».`}
          action={
            <Button onClick={openNew} variant="outline">
              <Plus /> Crear {config.singular}
            </Button>
          }
        />
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                {config.columns.map((col) => (
                  <TableHead key={col.key} className={col.className}>
                    {col.label}
                  </TableHead>
                ))}
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id}>
                  {config.columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key] ?? '—')}
                    </TableCell>
                  ))}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" aria-label="Editar" onClick={() => openEdit(row)}>
                        <Pencil />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        aria-label="Eliminar"
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => setDeleting(row)}
                      >
                        <Trash2 />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Diálogo crear / editar --------------------------------------------- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? `Editar ${config.singular}` : `Nueva ${config.singular}`}
            </DialogTitle>
            <DialogDescription>
              Completa el formulario. Los campos se validan antes de guardar.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {config.fields.map((field) => {
                const error = form.formState.errors[field.name];
                const errorMsg =
                  error && typeof error.message === 'string' ? error.message : null;
                return (
                  <div
                    key={field.name}
                    className={
                      field.full ||
                      field.type === 'textarea' ||
                      field.type === 'richtext' ||
                      field.type === 'media'
                        ? 'sm:col-span-2'
                        : ''
                    }
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <Label htmlFor={field.name}>{field.label}</Label>
                      {field.generateFrom ? (
                        <button
                          type="button"
                          className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
                          onClick={() => {
                            const src = form.getValues(field.generateFrom as string);
                            if (typeof src === 'string') {
                              form.setValue(field.name, slugify(src), { shouldValidate: true });
                            }
                          }}
                        >
                          Generar desde título
                        </button>
                      ) : null}
                    </div>

                    {field.type === 'textarea' ? (
                      <Textarea id={field.name} placeholder={field.placeholder} {...form.register(field.name)} />
                    ) : field.type === 'select' ? (
                      <Select id={field.name} {...form.register(field.name)}>
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </Select>
                    ) : field.type === 'switch' ? (
                      <Controller
                        control={form.control}
                        name={field.name}
                        render={({ field: f }) => (
                          <div className="flex h-9 items-center">
                            <Switch checked={Boolean(f.value)} onCheckedChange={f.onChange} />
                          </div>
                        )}
                      />
                    ) : field.type === 'richtext' ? (
                      <Controller
                        control={form.control}
                        name={field.name}
                        render={({ field: f }) => (
                          <TiptapEditor value={(f.value as string) ?? ''} onChange={f.onChange} />
                        )}
                      />
                    ) : field.type === 'media' ? (
                      <Controller
                        control={form.control}
                        name={field.name}
                        render={({ field: f }) => (
                          <MediaField
                            value={(f.value as string) ?? ''}
                            onChange={f.onChange}
                            placeholder={field.placeholder}
                          />
                        )}
                      />
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                        placeholder={field.placeholder}
                        {...form.register(field.name)}
                      />
                    )}

                    {field.help ? <p className="mt-1 text-xs text-zinc-400">{field.help}</p> : null}
                    {errorMsg ? <p className="mt-1 text-xs text-red-600">{errorMsg}</p> : null}
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Guardando…' : 'Guardar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Diálogo confirmar borrado ------------------------------------------ */}
      <Dialog open={deleting !== null} onOpenChange={(o) => !o && setDeleting(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Eliminar elemento</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Seguro que quieres eliminarlo?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" disabled={pending} onClick={confirmDelete}>
              {pending ? 'Eliminando…' : 'Eliminar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
