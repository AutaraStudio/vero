import { defineField, defineType } from 'sanity'
import { ArchiveIcon } from '@sanity/icons'

/**
 * Production dataset snapshot.
 *
 * One document per snapshot, holding a JSON dump of every production
 * document at the moment the snapshot was taken. Stored in the
 * `staging` dataset so a corrupted production can still be restored
 * from these backups.
 *
 * Created and consumed by /api/backup and /api/restore — clients
 * shouldn't edit fields directly.
 */
export const siteBackup = defineType({
  name: 'siteBackup',
  title: 'Backup',
  type: 'document',
  icon: ArchiveIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      description: 'Human label, e.g. "Pre-launch snapshot" or "Before pricing edit".',
    }),
    defineField({
      name: 'createdAt',
      title: 'Created at',
      type: 'datetime',
      readOnly: true,
    }),
    defineField({
      name: 'docCount',
      title: 'Documents in snapshot',
      type: 'number',
      readOnly: true,
    }),
    defineField({
      name: 'snapshotJson',
      title: 'Snapshot data',
      type: 'text',
      rows: 4,
      readOnly: true,
      description: 'JSON dump of every production document. Do not edit by hand.',
    }),
  ],
  preview: {
    select: { name: 'name', createdAt: 'createdAt', docCount: 'docCount' },
    prepare({ name, createdAt, docCount }) {
      const date = createdAt
        ? new Date(createdAt).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
        : 'unknown date'
      return {
        title: name || 'Untitled snapshot',
        subtitle: `${date} · ${docCount ?? 0} documents`,
      }
    },
  },
  orderings: [
    {
      title: 'Newest first',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
  ],
})
