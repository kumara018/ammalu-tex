'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, ArrowDown, Plus, Pencil, Eye, EyeOff, Trash2, ExternalLink, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminAPI } from '@/lib/api';
import { useRefreshCategories } from '@/lib/useCategories';
import type { ShopCategory } from '@/types';

/**
 * Admin — categories. Same behaviour as Vijey Textile's view, in this shop's
 * own paper-and-thread admin.
 *
 * THE ONE LIST. A category used to be typed out by hand in the footer, the
 * homepage shelf, the listing's filters and this admin's product form — and
 * those copies had already drifted (the product form's list left out Half
 * Saree). The `categories` table is the list now; every one of those places
 * reads it, and this tab edits it. A change reaches the shop without a deploy.
 *
 * WHAT EACH ACTION DOES, said on screen as well as here:
 *   Rename — moves every piece filed under the old name with it. Past orders
 *            keep the name they were bought under; an invoice is a record.
 *   Hide   — out of the shop's menus; its pieces stay on sale and searchable.
 *   Delete — only when empty, so no piece is ever left without a category.
 */

type Draft = {
  name: string;
  emoji: string;
  eyebrow: string;
  headline: string;
  description: string;
  is_active: boolean;
};

const BLANK: Draft = { name: '', emoji: '', eyebrow: '', headline: '', description: '', is_active: true };

const toDraft = (c: ShopCategory): Draft => ({
  name: c.name,
  emoji: c.emoji ?? '',
  eyebrow: c.eyebrow ?? '',
  headline: c.headline ?? '',
  description: c.description ?? '',
  is_active: c.is_active,
});

/** FastAPI returns a string for our own errors and a list for validation ones. */
function reason(err: any, fallback: string): string {
  const d = err?.response?.data?.detail;
  if (typeof d === 'string') return d;
  if (Array.isArray(d) && d[0]?.msg) return String(d[0].msg).replace(/^Value error, /, '');
  if (!err?.response) return 'Could not reach the shop. Check the connection and try again.';
  return fallback;
}

export default function CategoriesTab() {
  const refreshShopMenus = useRefreshCategories();

  const [rows, setRows] = useState<ShopCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const [editing, setEditing] = useState<number | 'new' | null>(null);
  const [draft, setDraft] = useState<Draft>(BLANK);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [busyId, setBusyId] = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [rowError, setRowError] = useState<{ id: number; text: string } | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await adminAPI.getCategories();
      setRows(res.data ?? []);
    } catch {
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (editing !== null) requestAnimationFrame(() => nameRef.current?.focus());
  }, [editing]);

  /** Every write returns the whole list; take it as the truth and tell the shop. */
  const accept = (list: ShopCategory[], message: string) => {
    setRows(list);
    refreshShopMenus();
    toast.success(message);
  };

  const openNew = () => { setDraft(BLANK); setFormError(''); setEditing('new'); };
  const openEdit = (c: ShopCategory) => {
    setDraft(toDraft(c)); setFormError(''); setRowError(null); setConfirmDelete(null); setEditing(c.id);
  };
  const close = () => { setEditing(null); setFormError(''); };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const name = draft.name.trim().replace(/\s+/g, ' ');
    if (name.length < 2) { setFormError('Give the category a name of at least 2 characters.'); return; }

    const body = {
      name,
      emoji: draft.emoji.trim() || null,
      eyebrow: draft.eyebrow.trim() || null,
      headline: draft.headline.trim() || null,
      description: draft.description.trim() || null,
      is_active: draft.is_active,
    };

    setSaving(true);
    setFormError('');
    try {
      if (editing === 'new') {
        const res = await adminAPI.createCategory(body);
        accept(res.data, `${name} added — it is in the shop's menus now.`);
      } else if (typeof editing === 'number') {
        const before = rows.find((r) => r.id === editing);
        const res = await adminAPI.updateCategory(editing, body);
        const moved = before && before.name !== name && before.product_count > 0
          ? ` ${before.product_count} product${before.product_count === 1 ? '' : 's'} moved with it.`
          : '';
        accept(res.data, `${name} saved.${moved}`);
      }
      setEditing(null);
    } catch (err) {
      setFormError(reason(err, 'That did not save. Please try again.'));
    } finally {
      setSaving(false);
    }
  };

  const toggleVisible = async (c: ShopCategory) => {
    setBusyId(c.id);
    setRowError(null);
    try {
      const res = await adminAPI.updateCategory(c.id, { is_active: !c.is_active });
      accept(res.data, c.is_active
        ? `${c.name} hidden from the menus. Its products are still on sale.`
        : `${c.name} is back in the menus.`);
    } catch (err) {
      setRowError({ id: c.id, text: reason(err, 'That change did not save.') });
    } finally {
      setBusyId(null);
    }
  };

  const move = async (index: number, by: -1 | 1) => {
    const to = index + by;
    if (to < 0 || to >= rows.length) return;
    const before = rows;
    const next = [...rows];
    [next[index], next[to]] = [next[to], next[index]];
    setRows(next);
    setBusyId(rows[index].id);
    setRowError(null);
    try {
      const res = await adminAPI.reorderCategories(next.map((r) => r.id));
      setRows(res.data);
      refreshShopMenus();
    } catch (err) {
      setRows(before);
      setRowError({ id: rows[index].id, text: reason(err, 'The new order did not save.') });
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (c: ShopCategory) => {
    setBusyId(c.id);
    setRowError(null);
    try {
      const res = await adminAPI.deleteCategory(c.id);
      accept(res.data, `${c.name} deleted.`);
    } catch (err) {
      setRowError({ id: c.id, text: reason(err, 'That could not be deleted.') });
    } finally {
      setConfirmDelete(null);
      setBusyId(null);
    }
  };

  const shown = rows.filter((r) => r.is_active).length;
  const hint = 'mt-1 text-xs text-graphite-faint';
  const iconBtn =
    'inline-flex h-8 w-8 items-center justify-center rounded-sm border border-paper-edge text-graphite-muted transition-colors hover:border-maroon-300 hover:text-maroon-800 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-paper-edge disabled:hover:text-graphite-muted';
  const textBtn =
    'inline-flex items-center gap-1.5 text-xs font-medium text-graphite-muted transition-colors hover:text-maroon-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-graphite-muted';

  const form = (
    <form onSubmit={save} noValidate className="card space-y-5 p-5 sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-maroon-800">
        {editing === 'new' ? 'New category' : `Editing ${rows.find((r) => r.id === editing)?.name ?? ''}`}
      </p>

      <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
        <div>
          <label htmlFor="cat-name" className="label">Name *</label>
          <input id="cat-name" ref={nameRef} value={draft.name} maxLength={60}
            placeholder="e.g. Kurti Sets"
            className={`input-field ${formError && draft.name.trim().length < 2 ? 'input-error' : ''}`}
            onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          <p className={hint}>
            Exactly as it should appear in the menu.
            {typeof editing === 'number' && (rows.find((r) => r.id === editing)?.product_count ?? 0) > 0 &&
              ' Renaming moves every product in it to the new name.'}
          </p>
        </div>
        <div>
          <label htmlFor="cat-emoji" className="label">Icon</label>
          <input id="cat-emoji" value={draft.emoji} maxLength={10} placeholder="👗" className="input-field"
            onChange={(e) => setDraft((d) => ({ ...d, emoji: e.target.value }))} />
          <p className={hint}>Optional</p>
        </div>
      </div>

      <div>
        <label htmlFor="cat-eyebrow" className="label">Short line</label>
        <input id="cat-eyebrow" value={draft.eyebrow} maxLength={60} placeholder="e.g. The ceremony"
          className="input-field" onChange={(e) => setDraft((d) => ({ ...d, eyebrow: e.target.value }))} />
        <p className={hint}>Shown beside the name on the homepage shelf. A few words.</p>
      </div>

      <div>
        <label htmlFor="cat-desc" className="label">One line about it</label>
        <input id="cat-desc" value={draft.description} maxLength={500}
          placeholder="e.g. For the ceremony, and the photographs after it."
          className="input-field" onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
        <p className={hint}>Optional. One sentence, shown on the homepage shelf.</p>
      </div>

      <div>
        <label htmlFor="cat-headline" className="label">Headline</label>
        <input id="cat-headline" value={draft.headline} maxLength={160}
          placeholder="Optional display line for the category"
          className="input-field" onChange={(e) => setDraft((d) => ({ ...d, headline: e.target.value }))} />
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input type="checkbox" checked={draft.is_active}
          onChange={(e) => setDraft((d) => ({ ...d, is_active: e.target.checked }))}
          className="mt-0.5 h-4 w-4 accent-maroon-700" />
        <span>
          <span className="block text-sm font-medium text-graphite">Show in the shop&rsquo;s menus</span>
          <span className={hint}>Untick to hide it. Its products stay on sale and can still be found by search.</span>
        </span>
      </label>

      {formError && (
        <p role="alert" className="error-msg"><AlertCircle size={13} />{formError}</p>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={close} className="btn-secondary px-5 py-2.5 text-sm">Cancel</button>
        <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-60">
          {saving ? 'Saving…' : editing === 'new' ? 'Add category' : 'Save changes'}
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-graphite-muted">
          {loading ? 'Loading…'
            : `${rows.length} categor${rows.length === 1 ? 'y' : 'ies'}, ${shown} in the menus. The footer, homepage shelf and filters follow this order.`}
        </p>
        <button onClick={openNew} disabled={editing === 'new'}
          className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60">
          <Plus size={16} /> Add category
        </button>
      </div>

      {editing === 'new' && form}

      {loading ? (
        <div className="card divide-y divide-paper-edge">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-5 py-4"><div className="h-4 w-1/2 animate-pulse rounded bg-paper-shade" /></div>
          ))}
        </div>
      ) : failed ? (
        <div className="card p-6 text-center">
          <p className="text-sm text-graphite">The categories did not load.</p>
          <button onClick={load} className="btn-secondary mt-4 px-5 py-2 text-sm">Try again</button>
        </div>
      ) : (
        <ol className="card divide-y divide-paper-edge overflow-hidden">
          {rows.map((c, i) => {
            const busy = busyId === c.id;
            const pieces = c.product_count;
            if (editing === c.id) {
              return <li key={c.id} className="bg-maroon-50/40 p-4">{form}</li>;
            }
            return (
              <li key={c.id}
                className={`flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4 ${c.is_active ? '' : 'bg-paper-shade/40'}`}>
                <span className="w-6 shrink-0 font-mono text-xs text-graphite-faint">{String(i + 1).padStart(2, '0')}</span>

                <div className="min-w-[12rem] flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-graphite">
                    {c.emoji && <span aria-hidden="true">{c.emoji}</span>}
                    {c.name}
                    {!c.is_active && (
                      <span className="rounded bg-graphite/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-graphite-muted">
                        Hidden
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-graphite-faint">
                    {c.eyebrow ? `${c.eyebrow} · ` : ''}
                    {pieces === 0 ? 'No products yet' : `${pieces} product${pieces === 1 ? '' : 's'} · ${c.live_product_count} on sale`}
                  </p>
                  {rowError?.id === c.id && (
                    <p role="alert" className="error-msg mt-1.5"><AlertCircle size={13} />{rowError.text}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button type="button" className={iconBtn} disabled={busy || i === 0}
                    onClick={() => move(i, -1)} aria-label={`Move ${c.name} up`}><ArrowUp size={14} /></button>
                  <button type="button" className={iconBtn} disabled={busy || i === rows.length - 1}
                    onClick={() => move(i, 1)} aria-label={`Move ${c.name} down`}><ArrowDown size={14} /></button>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <a href={`/products?category=${encodeURIComponent(c.name)}`} target="_blank" rel="noopener noreferrer" className={textBtn}>
                    <ExternalLink size={13} /> View
                  </a>
                  <button type="button" className={textBtn} disabled={busy} onClick={() => openEdit(c)}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button type="button" className={textBtn} disabled={busy} onClick={() => toggleVisible(c)}>
                    {c.is_active ? <><EyeOff size={13} /> Hide</> : <><Eye size={13} /> Show</>}
                  </button>
                  {confirmDelete === c.id ? (
                    <span className="flex items-center gap-3">
                      <span className="text-xs text-graphite">Delete {c.name}?</span>
                      <button type="button" disabled={busy} onClick={() => remove(c)}
                        className="text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50">
                        {busy ? 'Deleting…' : 'Delete'}
                      </button>
                      <button type="button" onClick={() => setConfirmDelete(null)} className={textBtn}>Keep</button>
                    </span>
                  ) : (
                    <button type="button" className={`${textBtn} hover:text-red-600`}
                      disabled={busy || pieces > 0}
                      title={pieces > 0 ? `Move its ${pieces} product${pieces === 1 ? '' : 's'} to another category first, or hide it instead.` : undefined}
                      onClick={() => { setRowError(null); setConfirmDelete(c.id); }}>
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {!loading && !failed && (
        <p className="text-xs leading-relaxed text-graphite-faint">
          A category shows in the footer, the homepage shelf, the filters on the shop page and the product form.
          Delete is only offered for an empty category, so no product is ever left without one — to retire a
          category that has products, move them first or hide it.
        </p>
      )}
    </div>
  );
}
