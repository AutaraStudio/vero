import { useCallback, useEffect, useState } from 'react'
import { ArchiveIcon, RestoreIcon, AddIcon, RefreshIcon } from '@sanity/icons'
import { useClient, type Tool } from 'sanity'
import { Card, Stack, Heading, Text, Button, Flex, Spinner, Box, Badge, useToast } from '@sanity/ui'

import { apiVersion } from '../env'

/**
 * "Backups" Studio tool.
 *
 * Lives in the staging Studio sidebar. Three things:
 *   1. "Take Snapshot" button → POST /api/backup → snapshots all
 *      production documents into a `siteBackup` doc in staging.
 *   2. List of existing snapshots, newest first, with date/doc count.
 *   3. Per-row "Restore to Live" button → POST /api/restore →
 *      replays the snapshot's documents back into production.
 *
 * Both restore actions show a confirmation step. Restoring is a
 * write to production, so it's gated by typing the snapshot name.
 */

type BackupRow = {
  _id: string
  name?: string
  createdAt?: string
  docCount?: number
}

const BACKUPS_QUERY = `*[_type == "siteBackup"] | order(createdAt desc) {
  _id, name, createdAt, docCount
}`

function BackupsToolView() {
  const client = useClient({ apiVersion })
  const toast = useToast()
  const dataset = client.config().dataset

  const [rows, setRows] = useState<BackupRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [confirmRestore, setConfirmRestore] = useState<BackupRow | null>(null)
  const [confirmText, setConfirmText] = useState('')

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await client.fetch<BackupRow[]>(BACKUPS_QUERY)
      setRows(data ?? [])
    } catch (err) {
      toast.push({ status: 'error', title: 'Could not load backups', description: (err as Error).message })
    } finally {
      setLoading(false)
    }
  }, [client, toast])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const handleTakeSnapshot = useCallback(async () => {
    setBusy('snapshot')
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string; backup?: { docCount: number } }
      if (!res.ok || !json.ok) throw new Error(json.error || `Snapshot failed (${res.status})`)
      toast.push({
        status: 'success',
        title: 'Snapshot created',
        description: `${json.backup?.docCount ?? 0} documents captured`,
      })
      await refresh()
    } catch (err) {
      toast.push({ status: 'error', title: 'Snapshot failed', description: (err as Error).message })
    } finally {
      setBusy(null)
    }
  }, [refresh, toast])

  const handleRestore = useCallback(async () => {
    const target = confirmRestore
    if (!target) return
    setBusy(target._id)
    try {
      const res = await fetch('/api/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backupId: target._id }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string; restored?: { docCount: number } }
      if (!res.ok || !json.ok) throw new Error(json.error || `Restore failed (${res.status})`)
      toast.push({
        status: 'success',
        title: 'Production restored',
        description: `${json.restored?.docCount ?? 0} documents written to live`,
      })
      setConfirmRestore(null)
      setConfirmText('')
    } catch (err) {
      toast.push({ status: 'error', title: 'Restore failed', description: (err as Error).message })
    } finally {
      setBusy(null)
    }
  }, [confirmRestore, toast])

  if (dataset !== 'staging') {
    return (
      <Card padding={5} tone="caution">
        <Stack space={3}>
          <Heading size={2}>Backups unavailable</Heading>
          <Text>
            Switch to the staging dataset to manage backups. Backups always
            live in staging so they survive a production-side incident.
          </Text>
        </Stack>
      </Card>
    )
  }

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '—'

  return (
    <Card padding={[4, 4, 5]} style={{ minHeight: '100%' }}>
      <Stack space={5}>
        <Flex align="flex-start" justify="space-between" gap={3} wrap="wrap">
          <Stack space={2}>
            <Heading size={3}>Backups</Heading>
            <Text muted>
              Snapshots of every document on the live site. Take one before a risky
              edit, restore one if something goes wrong.
            </Text>
          </Stack>
          <Flex gap={2}>
            <Button
              icon={RefreshIcon}
              mode="ghost"
              onClick={() => void refresh()}
              text="Refresh"
              disabled={loading}
            />
            <Button
              icon={AddIcon}
              tone="primary"
              onClick={() => void handleTakeSnapshot()}
              text={busy === 'snapshot' ? 'Capturing…' : 'Take snapshot'}
              disabled={busy !== null}
            />
          </Flex>
        </Flex>

        {loading ? (
          <Flex align="center" gap={3} padding={4}>
            <Spinner muted />
            <Text muted>Loading backups…</Text>
          </Flex>
        ) : rows.length === 0 ? (
          <Card padding={5} tone="transparent" radius={3} border>
            <Stack space={3} style={{ textAlign: 'center' }}>
              <Box style={{ fontSize: '2rem' }}>
                <ArchiveIcon />
              </Box>
              <Heading size={1}>No snapshots yet</Heading>
              <Text muted>
                Click <strong>Take snapshot</strong> to capture the current
                state of the live site. You can restore any snapshot from this
                screen later.
              </Text>
            </Stack>
          </Card>
        ) : (
          <Stack space={2}>
            {rows.map((row) => (
              <Card key={row._id} padding={4} radius={2} shadow={1} tone="default">
                <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                  <Stack space={2}>
                    <Flex align="center" gap={2}>
                      <ArchiveIcon />
                      <Heading size={1}>{row.name || 'Untitled snapshot'}</Heading>
                    </Flex>
                    <Flex gap={2} align="center">
                      <Text size={1} muted>{formatDate(row.createdAt)}</Text>
                      <Badge tone="primary" mode="outline">{row.docCount ?? 0} docs</Badge>
                    </Flex>
                  </Stack>
                  <Button
                    icon={RestoreIcon}
                    tone="critical"
                    mode="ghost"
                    text={busy === row._id ? 'Restoring…' : 'Restore to Live'}
                    onClick={() => {
                      setConfirmRestore(row)
                      setConfirmText('')
                    }}
                    disabled={busy !== null}
                  />
                </Flex>
              </Card>
            ))}
          </Stack>
        )}

        {confirmRestore && (
          <Card padding={4} tone="critical" radius={3} border>
            <Stack space={4}>
              <Stack space={2}>
                <Heading size={2}>Restore live site to this snapshot?</Heading>
                <Text>
                  This will <strong>replace every document</strong> on
                  veroassess.com with the version captured in
                  &ldquo;{confirmRestore.name}&rdquo; ({formatDate(confirmRestore.createdAt)}).
                  Any changes made on the live site since then will be lost.
                </Text>
                <Text size={1} muted>
                  To confirm, type the snapshot name below.
                </Text>
              </Stack>

              <input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={confirmRestore.name}
                style={{
                  width: '100%',
                  padding: '0.625rem 0.75rem',
                  borderRadius: 3,
                  border: '1px solid var(--card-border-color)',
                  background: 'var(--card-bg-color)',
                  color: 'var(--card-fg-color)',
                  fontFamily: 'inherit',
                  fontSize: '0.9375rem',
                }}
              />

              <Flex gap={2} justify="flex-end">
                <Button
                  mode="ghost"
                  text="Cancel"
                  onClick={() => {
                    setConfirmRestore(null)
                    setConfirmText('')
                  }}
                  disabled={busy !== null}
                />
                <Button
                  tone="critical"
                  text={busy === confirmRestore._id ? 'Restoring…' : 'Restore now'}
                  onClick={() => void handleRestore()}
                  disabled={busy !== null || confirmText !== confirmRestore.name}
                />
              </Flex>
            </Stack>
          </Card>
        )}
      </Stack>
    </Card>
  )
}

export const backupsTool: Tool = {
  name: 'backups',
  title: 'Backups',
  icon: ArchiveIcon,
  component: BackupsToolView,
}
