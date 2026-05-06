import { useCallback, useEffect, useState } from 'react'
import { ArchiveIcon, RestoreIcon, AddIcon, RefreshIcon, EditIcon, CheckmarkIcon, CloseIcon } from '@sanity/icons'
import { useClient, type Tool } from 'sanity'
import { Card, Stack, Heading, Text, Button, Flex, Spinner, Box, Badge, useToast, TextInput } from '@sanity/ui'

import { apiVersion } from '../env'

/**
 * "Backups" Studio tool.
 *
 * Top bar of the staging Studio. Provides:
 *   1. "Take snapshot" — opens a dialog asking for a name, then
 *      POSTs to /api/backup to snapshot every production document.
 *   2. List of snapshots (newest first) with date + doc count.
 *   3. Per-row "Rename" (pencil) for editing the human label.
 *   4. Per-row "Restore to Live" gated by typing the snapshot name.
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

function defaultSnapshotName() {
  const d = new Date()
  return `Snapshot — ${d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}`
}

function BackupsToolView() {
  const client = useClient({ apiVersion })
  const toast = useToast()
  const dataset = client.config().dataset

  const [rows, setRows] = useState<BackupRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  /* "Take snapshot" dialog */
  const [snapshotDialogOpen, setSnapshotDialogOpen] = useState(false)
  const [snapshotName, setSnapshotName] = useState('')

  /* Per-row inline rename: id of the row currently being edited */
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameDraft, setRenameDraft] = useState('')

  /* Restore confirm */
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

  const openSnapshotDialog = () => {
    setSnapshotName(defaultSnapshotName())
    setSnapshotDialogOpen(true)
  }

  const handleTakeSnapshot = useCallback(async () => {
    setBusy('snapshot')
    try {
      const res = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: snapshotName.trim() || defaultSnapshotName() }),
      })
      const json = (await res.json()) as { ok?: boolean; error?: string; backup?: { docCount: number } }
      if (!res.ok || !json.ok) throw new Error(json.error || `Snapshot failed (${res.status})`)
      toast.push({
        status: 'success',
        title: 'Snapshot created',
        description: `${json.backup?.docCount ?? 0} documents captured`,
      })
      setSnapshotDialogOpen(false)
      setSnapshotName('')
      await refresh()
    } catch (err) {
      toast.push({ status: 'error', title: 'Snapshot failed', description: (err as Error).message })
    } finally {
      setBusy(null)
    }
  }, [snapshotName, refresh, toast])

  const handleSaveRename = useCallback(async (row: BackupRow) => {
    const name = renameDraft.trim()
    if (!name || name === row.name) {
      setRenamingId(null)
      return
    }
    setBusy(`rename-${row._id}`)
    try {
      await client.patch(row._id).set({ name }).commit()
      toast.push({ status: 'success', title: 'Renamed', description: name })
      setRenamingId(null)
      setRenameDraft('')
      await refresh()
    } catch (err) {
      toast.push({ status: 'error', title: 'Could not rename', description: (err as Error).message })
    } finally {
      setBusy(null)
    }
  }, [renameDraft, client, refresh, toast])

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
              onClick={openSnapshotDialog}
              text="Take snapshot"
              disabled={busy !== null}
            />
          </Flex>
        </Flex>

        {snapshotDialogOpen && (
          <Card padding={4} tone="primary" radius={3} border>
            <Stack space={4}>
              <Stack space={2}>
                <Heading size={2}>Name this snapshot</Heading>
                <Text size={1} muted>
                  Give it a label that&rsquo;ll make sense to future-you, like
                  &ldquo;Before pricing changes&rdquo; or &ldquo;Q2 launch&rdquo;.
                </Text>
              </Stack>
              <TextInput
                value={snapshotName}
                onChange={(e) => setSnapshotName(e.currentTarget.value)}
                placeholder={defaultSnapshotName()}
                autoFocus
              />
              <Flex gap={2} justify="flex-end">
                <Button
                  mode="ghost"
                  text="Cancel"
                  onClick={() => {
                    setSnapshotDialogOpen(false)
                    setSnapshotName('')
                  }}
                  disabled={busy === 'snapshot'}
                />
                <Button
                  tone="primary"
                  text={busy === 'snapshot' ? 'Capturing…' : 'Take snapshot'}
                  onClick={() => void handleTakeSnapshot()}
                  disabled={busy === 'snapshot'}
                />
              </Flex>
            </Stack>
          </Card>
        )}

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
            {rows.map((row) => {
              const isRenaming = renamingId === row._id
              return (
                <Card key={row._id} padding={4} radius={2} shadow={1} tone="default">
                  <Flex align="center" justify="space-between" gap={3} wrap="wrap">
                    <Stack space={2} flex={1} style={{ minWidth: '16rem' }}>
                      <Flex align="center" gap={2}>
                        <ArchiveIcon />
                        {isRenaming ? (
                          <Flex align="center" gap={2} flex={1}>
                            <Box flex={1}>
                              <TextInput
                                value={renameDraft}
                                onChange={(e) => setRenameDraft(e.currentTarget.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') void handleSaveRename(row)
                                  if (e.key === 'Escape') setRenamingId(null)
                                }}
                                autoFocus
                              />
                            </Box>
                            <Button
                              icon={CheckmarkIcon}
                              tone="primary"
                              mode="ghost"
                              onClick={() => void handleSaveRename(row)}
                              disabled={busy !== null}
                              aria-label="Save name"
                            />
                            <Button
                              icon={CloseIcon}
                              mode="ghost"
                              onClick={() => {
                                setRenamingId(null)
                                setRenameDraft('')
                              }}
                              disabled={busy !== null}
                              aria-label="Cancel rename"
                            />
                          </Flex>
                        ) : (
                          <>
                            <Heading size={1}>{row.name || 'Untitled snapshot'}</Heading>
                            <Button
                              icon={EditIcon}
                              mode="bleed"
                              padding={1}
                              onClick={() => {
                                setRenamingId(row._id)
                                setRenameDraft(row.name ?? '')
                              }}
                              disabled={busy !== null}
                              aria-label="Rename"
                            />
                          </>
                        )}
                      </Flex>
                      <Flex gap={2} align="center" wrap="wrap">
                        <Text size={1} muted>{formatDate(row.createdAt)}</Text>
                        <Badge tone="primary" mode="outline">{row.docCount ?? 0} docs</Badge>
                      </Flex>
                    </Stack>
                    {!isRenaming && (
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
                    )}
                  </Flex>
                </Card>
              )
            })}
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

              <TextInput
                value={confirmText}
                onChange={(e) => setConfirmText(e.currentTarget.value)}
                placeholder={confirmRestore.name}
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
