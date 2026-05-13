import { Suspense } from 'react';
import type { Metadata } from 'next';
import { client } from '@/sanity/lib/client';
import { ROLES_BY_CATEGORY_QUERY } from '@/sanity/lib/queries';
import RolePicker from './components/RolePicker';

export const metadata: Metadata = {
  title: 'Select roles — Get started',
};

export default async function GetStartedPage() {
  const categories = await client.fetch(ROLES_BY_CATEGORY_QUERY);
  return (
    <Suspense>
      <RolePicker categories={categories ?? []} />
    </Suspense>
  );
}
