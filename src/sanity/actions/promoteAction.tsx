import { useState, useCallback } from 'react'
import { RocketIcon } from '@sanity/icons'
import type { DocumentActionComponent, DocumentActionProps, DocumentActionDescription } from 'sanity'
import { useClient } from 'sanity'

import { apiVersion } from '../env'

/**
 * "Push to Live Site" — Sanity Studio document action.
 *
 * Visible on every document in the staging Studio. Clicking it calls
 * `/api/promote` on the same origin Studio is loaded from (avoids CORS).
 * The route uses a project-wide Editor token, so it can read from
 * `staging` and write to `production` regardless of which Netlify site
 * happens to host it. Same code, same outcome.
 *
 * The production-dataset Sanity webhook then fires automatically and
 * the live site rebuilds within a few seconds.
 *
 * Disabled when:
 *   - the document has unpublished draft changes (we only promote what's
 *     actually published in staging)
 *   - the active dataset is `production` (avoids self-promotion confusion)
 */

const PromoteAction: DocumentActionComponent = (
  props: DocumentActionProps,
): DocumentActionDescription => {
  const { id, type, draft, published, onComplete } = props
  const [dialogOpen, setDialogOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const client = useClient({ apiVersion })
  const activeDataset = client.config().dataset

  const hasUnpublishedDraft = Boolean(draft) && !published
  const hasUnpublishedChanges = Boolean(draft && published)

  const handleConfirm = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/promote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId: id }),
      })

      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) {
        throw new Error(json.error || `Promote failed (${res.status})`)
      }

      setDialogOpen(false)
      onComplete()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }, [id, onComplete])

  /* Backups are operational metadata that lives in staging only —
     they are never promoted to production. */
  if (type === 'siteBackup') {
    return {
      label: 'Push to Live Site',
      icon: RocketIcon,
      disabled: true,
      title: 'Backups stay in staging — they are not pushed live',
    }
  }

  /* Only surface this action in the staging dataset — promoting from
     production back to itself makes no sense. */
  if (activeDataset !== 'staging') {
    return {
      label: 'Push to Live Site',
      icon: RocketIcon,
      disabled: true,
      title: 'Switch to the staging dataset to use this action',
    }
  }

  if (hasUnpublishedDraft) {
    return {
      label: 'Push to Live Site',
      icon: RocketIcon,
      disabled: true,
      title: 'Publish your changes first, then push to live',
    }
  }

  return {
    label: busy ? 'Pushing…' : 'Push to Live Site',
    icon: RocketIcon,
    disabled: busy,
    onHandle: () => {
      setError(null)
      setDialogOpen(true)
    },
    dialog: dialogOpen && {
      type: 'confirm',
      tone: 'caution',
      message: (
        <div style={{ lineHeight: 1.55, color: 'inherit' }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: '1rem' }}>
            Push this page to veroassess.com?
          </p>
          <p style={{ margin: '0.5rem 0 0' }}>
            The live site will be replaced with the version currently
            published in staging. The change will appear within about a
            minute.
          </p>
          {hasUnpublishedChanges && (
            <p style={{ margin: '0.5rem 0 0' }}>
              Note: you have unpublished draft edits. Only the published
              version will be pushed live — your drafts stay in staging.
            </p>
          )}
          {error && (
            <p style={{ margin: '0.75rem 0 0', color: 'var(--card-badge-critical-fg-color)' }}>
              {error}
            </p>
          )}
        </div>
      ),
      onCancel: () => setDialogOpen(false),
      onConfirm: handleConfirm,
      confirmButtonText: busy ? 'Pushing…' : 'Push to Live',
    },
  }
}

export default PromoteAction
