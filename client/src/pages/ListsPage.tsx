import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import { CreateListModal } from "../components/CreateListModal";
import { listLists, uploadListFile } from "../lib/api";
import { PageTitle } from "@components/common/Title/PageTitle";
import { Button } from "@components/common/Button/Button";
import { ButtonVariant } from "@components/common/Button/buttonVariants";
import { type PokemonList } from "@shared";

export function ListsPage() {
  const [lists, setLists] = useState<PokemonList[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    listLists()
      .then((data) => {
        if (cancelled) return;
        setLists(data);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load lists");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUploadFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const list = await uploadListFile(file);
      setLists((prev) => (prev ? [list, ...prev] : [list]));
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to upload list file",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <input
        ref={uploadInputRef}
        type="file"
        accept="application/json,.json"
        className="sr-only"
        aria-hidden
        onChange={handleUploadFile}
      />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageTitle>Your Pokemon lists</PageTitle>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={ButtonVariant.SECONDARY}
            disabled={uploading}
            onClick={() => uploadInputRef.current?.click()}
          >
            {uploading ? "Uploading…" : "Upload list"}
          </Button>
          <Button type="button" onClick={() => setCreateOpen(true)}>
            Create New List
          </Button>
        </div>
      </div>

      <CreateListModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(list) =>
          setLists((prev) => (prev ? [list, ...prev] : [list]))
        }
      />

      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      {uploadError ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {uploadError}
        </div>
      ) : null}

      {!error && lists === null ? (
        <div className="mt-6 text-sm text-neutral-600">Loading…</div>
      ) : error ? null : lists === null ? null : lists.length === 0 ? (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
          No lists yet. Click “Create New List”.
        </div>
      ) : (
        <div className="mt-6 grid gap-3">
          {lists.map((l) => (
            <Link
              key={l._id}
              to={`/lists/${l._id}`}
              className="rounded-xl border border-neutral-200 bg-white p-4 hover:bg-neutral-50"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{l.name}</div>
                  <div className="text-sm text-neutral-600">
                    {l.pokemonNumbers.length} Pokemon
                  </div>
                </div>
                <div className="text-sm text-neutral-500">Open →</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
