import { useState, useCallback } from 'react'
import { RocketIcon } from '@sanity/icons'
import type { DocumentActionComponent, DocumentActionProps, DocumentActionDescription } from 'sanity'
import { useClient } from 'sanity'

import { apiVersion } from '../env'

/**
 * "Push to Live Site" — Sanity Studio document action.
 *
 * Visible on every document in the staging Studio. Clicking it calls
 * /api/promote on the live site, which copies the document (and any
 * referenced assets) from the `staging` dataset into `production`.
 *
 * The Next.js revalidation webhook then fires automatically and the
 * production site rebuilds within a few seconds.
 *
 * Disabled when:
 *   - the document has unpublished draft changes (we only promote what's
 *     actually published in staging)
 *   - the active dataset is `production` (avoids self-promotion confusion)
 */

const PROMOTE_ENDPOINT_PROD = 'https://www.veroassess.com/api/promote'

const PromoteAction: DocumentActionComponent = (
  props: DocumentActionProps,
): DocumentActionDescription => {
  const { id, type, draft, published, onComplete } = props
  const [dialogOpen, setDialogOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const client = useClient({ apiVersion })
  const activeDataset = client.config().dataset
  const sessionToken = client.config().token

  const hasUnpublishedDraft = Boolean(draft) && !published
  const hasUnpublishedChanges = Boolean(draft && published)

  const handleConfirm = useCallback(async () => {
    setBusy(true)
    setError(null)
    try {
      const endpoint =
        process.env.NODE_ENV === 'development'
          ? '/api/promote'
          : PROMOTE_ENDPOINT_PROD

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
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
  }, [id, sessionToken, onComplete])

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
        <div style={{ lineHeight: 1.5 }}>
          <strong>Push this page to veroassess.com?</strong>
          <p style={{ marginTop: '0.5rem' }}>
            The live site will be replaced with the version currently
            published in staging. The change will appear within about a
            minute.
          </p>
          {hasUnpublishedChanges && (
            <p style={{ marginTop: '0.5rem' }}>
              Note: you have unpublished draft edits. Only the published
              version will be pushed live — your drafts stay in staging.
            </p>
          )}
          {error && (
            <p style={{ marginTop: '0.75rem', color: 'var(--card-badge-critical-fg-color, #c44)' }}>
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
