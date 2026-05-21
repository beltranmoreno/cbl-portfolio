/**
 * Bulk image upload tool — registered in the Studio sidebar.
 *
 * Pick a project, drop or select multiple image files, choose default
 * medium / film format / starting order, hit Upload. The tool:
 *   1. Uploads each file to the Sanity asset store.
 *   2. Creates one `imageAsset` document per file referencing the project,
 *      with the chosen defaults and a sequential `order` value.
 *   3. Shows per-file progress and surfaces errors inline.
 *
 * After upload, refine each document (caption, EN/ES, date, etc.) from the
 * project view in the sidebar.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useClient } from 'sanity'

type Status = 'pending' | 'uploading' | 'creating' | 'done' | 'error'

interface UploadEntry {
  id: string
  file: File
  status: Status
  docId?: string
  error?: string
}

interface ProjectOption {
  _id: string
  titleEn?: string
  titleEs?: string
  startYear?: number
}

const MEDIUM_OPTIONS = [
  { value: 'film-bw', label: 'Film — Black & White' },
  { value: 'film-color', label: 'Film — Color' },
  { value: 'digital-bw', label: 'Digital — Black & White' },
  { value: 'digital-color', label: 'Digital — Color' },
] as const

const FORMAT_OPTIONS = [
  { value: '35mm', label: '35mm' },
  { value: '120', label: 'Medium Format (120)' },
  { value: 'none', label: 'N/A' },
] as const

const labelStyle = 'block text-sm font-medium text-neutral-700 mb-1'
const inputStyle =
  'w-full px-3 py-2 border border-neutral-300 rounded text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40'

export default function BulkUploadTool() {
  const client = useClient({ apiVersion: '2024-01-01' })

  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [projectId, setProjectId] = useState('')
  const [medium, setMedium] = useState<(typeof MEDIUM_OPTIONS)[number]['value']>('film-bw')
  const [filmFormat, setFilmFormat] = useState<(typeof FORMAT_OPTIONS)[number]['value']>('35mm')
  const [startOrder, setStartOrder] = useState<number>(1)
  const [entries, setEntries] = useState<UploadEntry[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const isFilm = medium.startsWith('film')

  // Load projects on mount, sorted alphabetically by EN title.
  useEffect(() => {
    let cancelled = false
    client
      .fetch<ProjectOption[]>(
        `*[_type == "project"]{
          _id,
          "titleEn": title.en,
          "titleEs": title.es,
          startYear
        } | order(coalesce(title.en, title.es, "") asc)`
      )
      .then((data) => {
        if (cancelled) return
        setProjects(data)
        setLoadingProjects(false)
      })
      .catch((err) => {
        if (cancelled) return
        console.error('Failed to load projects', err)
        setLoadingProjects(false)
      })
    return () => {
      cancelled = true
    }
  }, [client])

  // Pre-fill `startOrder` based on the highest existing order in the
  // selected project — so new uploads append rather than collide.
  useEffect(() => {
    if (!projectId) return
    let cancelled = false
    client
      .fetch<number | null>(
        `*[_type == "imageAsset" && project._ref == $pid] | order(order desc)[0].order`,
        { pid: projectId }
      )
      .then((max) => {
        if (cancelled) return
        setStartOrder((max ?? 0) + 1)
      })
      .catch(() => {
        /* leave as-is */
      })
    return () => {
      cancelled = true
    }
  }, [client, projectId])

  const addFiles = useCallback((files: FileList | File[]) => {
    const next: UploadEntry[] = []
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue
      next.push({
        id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        status: 'pending',
      })
    }
    setEntries((prev) => [...prev, ...next])
  }, [])

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const clearDone = useCallback(() => {
    setEntries((prev) => prev.filter((e) => e.status !== 'done'))
  }, [])

  const updateEntry = useCallback(
    (id: string, patch: Partial<UploadEntry>) => {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...patch } : e))
      )
    },
    []
  )

  const pendingCount = useMemo(
    () => entries.filter((e) => e.status === 'pending').length,
    [entries]
  )

  const runUpload = useCallback(async () => {
    if (!projectId || pendingCount === 0 || isRunning) return
    setIsRunning(true)
    let nextOrder = startOrder
    const toRun = entries.filter((e) => e.status === 'pending')
    for (const entry of toRun) {
      try {
        updateEntry(entry.id, { status: 'uploading' })
        const asset = await client.assets.upload('image', entry.file, {
          filename: entry.file.name,
        })
        updateEntry(entry.id, { status: 'creating' })
        const doc = await client.create({
          _type: 'imageAsset',
          image: {
            _type: 'image',
            asset: { _type: 'reference', _ref: asset._id },
          },
          project: { _type: 'reference', _ref: projectId },
          medium,
          ...(isFilm ? { filmFormat } : {}),
          order: nextOrder,
        })
        nextOrder += 1
        updateEntry(entry.id, { status: 'done', docId: doc._id })
      } catch (err) {
        updateEntry(entry.id, {
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
    setStartOrder(nextOrder)
    setIsRunning(false)
  }, [
    client,
    projectId,
    pendingCount,
    isRunning,
    startOrder,
    entries,
    medium,
    filmFormat,
    isFilm,
    updateEntry,
  ])

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer?.files) addFiles(e.dataTransfer.files)
  }

  const selectedProject = projects.find((p) => p._id === projectId)

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-3xl mx-auto p-6 md:p-10">
        <header className="mb-8">
          <h1 className="font-serif text-3xl text-neutral-900 mb-2">
            Bulk Upload Images
          </h1>
          <p className="text-sm text-neutral-600">
            Upload many photos at once and attach them to a single project.
            Each upload becomes an Image document you can refine afterward.
          </p>
        </header>

        <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
          {/* Project picker */}
          <div>
            <label htmlFor="bulk-project" className={labelStyle}>
              Project
            </label>
            <select
              id="bulk-project"
              className={inputStyle}
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              disabled={loadingProjects || isRunning}
            >
              <option value="">
                {loadingProjects
                  ? 'Loading projects…'
                  : projects.length === 0
                    ? 'No projects found — create one first'
                    : 'Select a project…'}
              </option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.titleEn || p.titleEs || '(untitled)'}
                  {p.startYear ? ` — ${p.startYear}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Defaults */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="bulk-medium" className={labelStyle}>
                Default medium
              </label>
              <select
                id="bulk-medium"
                className={inputStyle}
                value={medium}
                onChange={(e) =>
                  setMedium(e.target.value as typeof medium)
                }
                disabled={isRunning}
              >
                {MEDIUM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            {isFilm && (
              <div>
                <label htmlFor="bulk-format" className={labelStyle}>
                  Film format
                </label>
                <select
                  id="bulk-format"
                  className={inputStyle}
                  value={filmFormat}
                  onChange={(e) =>
                    setFilmFormat(e.target.value as typeof filmFormat)
                  }
                  disabled={isRunning}
                >
                  {FORMAT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div>
              <label htmlFor="bulk-order" className={labelStyle}>
                Start order at
              </label>
              <input
                id="bulk-order"
                type="number"
                className={inputStyle}
                value={startOrder}
                onChange={(e) =>
                  setStartOrder(Math.max(0, parseInt(e.target.value, 10) || 0))
                }
                disabled={isRunning}
                min={0}
              />
            </div>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-neutral-300 bg-neutral-50'
            }`}
          >
            <p className="text-sm text-neutral-700 mb-2">
              Drag images here, or
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-neutral-900 text-white text-sm rounded hover:bg-neutral-800"
            >
              Choose files
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                if (e.target.files) addFiles(e.target.files)
                e.target.value = ''
              }}
              className="hidden"
            />
            <p className="text-xs text-neutral-500 mt-3">
              Images only. You can drop more files at any time.
            </p>
          </div>

          {/* Queue */}
          {entries.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-medium text-neutral-700">
                  Queue ({entries.length})
                </h2>
                <button
                  type="button"
                  onClick={clearDone}
                  className="text-xs text-neutral-500 hover:text-neutral-700"
                  disabled={isRunning}
                >
                  Clear completed
                </button>
              </div>
              <ul className="border border-neutral-200 rounded divide-y divide-neutral-200 max-h-72 overflow-y-auto">
                {entries.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex items-center justify-between px-3 py-2 text-sm"
                  >
                    <span className="truncate flex-1 mr-3 text-neutral-800">
                      {entry.file.name}
                      <span className="text-neutral-400 ml-2">
                        {(entry.file.size / 1024).toFixed(0)} KB
                      </span>
                    </span>
                    <span className={statusClass(entry.status)}>
                      {statusLabel(entry.status, entry.error)}
                    </span>
                    {entry.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        className="ml-3 text-neutral-400 hover:text-red-600"
                        aria-label="Remove"
                      >
                        ✕
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-neutral-500">
              {selectedProject
                ? `Uploading to: ${selectedProject.titleEn || selectedProject.titleEs}`
                : 'Pick a project to enable upload.'}
            </p>
            <button
              type="button"
              onClick={runUpload}
              disabled={!projectId || pendingCount === 0 || isRunning}
              className="px-5 py-2 bg-primary text-white text-sm font-medium rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary-dark"
            >
              {isRunning
                ? 'Uploading…'
                : pendingCount > 0
                  ? `Upload ${pendingCount} file${pendingCount === 1 ? '' : 's'}`
                  : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function statusLabel(status: Status, error?: string): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'uploading':
      return 'Uploading…'
    case 'creating':
      return 'Creating doc…'
    case 'done':
      return 'Done'
    case 'error':
      return `Error: ${error || 'unknown'}`
  }
}

function statusClass(status: Status): string {
  switch (status) {
    case 'pending':
      return 'text-xs text-neutral-500'
    case 'uploading':
    case 'creating':
      return 'text-xs text-blue-600'
    case 'done':
      return 'text-xs text-green-600 font-medium'
    case 'error':
      return 'text-xs text-red-600 font-medium max-w-[40%] truncate'
  }
}
