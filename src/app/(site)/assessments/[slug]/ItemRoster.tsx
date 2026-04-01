import Link from 'next/link';
import Button from '@/components/ui/Button';

interface Item {
  _id: string;
  name: string;
  slug: string;
  strengths?: string;
}

interface ItemRosterProps {
  heading?: string;
  subheading?: string;
  roles: Item[];
  categorySlug: string;
}

export default function ItemRoster({
  heading,
  subheading,
  roles,
  categorySlug,
}: ItemRosterProps) {
  return (
    <section className="item-roster">
      <div className="container">

        {(heading || subheading) && (
          <div className="item-roster__header">
            {heading && <h2 className="section-heading">{heading}</h2>}
            {subheading && <p className="section-intro">{subheading}</p>}
          </div>
        )}

        <div className="item-roster__list">
          {roles.map((role) => (
            <Link
              key={role._id}
              href={`/assessments/${categorySlug}/${role.slug}`}
              className="item-roster__item"
            >
              <span className="text-body--sm font--medium color--primary">{role.name}</span>
              {role.strengths && (
                <span className="text-body--xs color--tertiary">{role.strengths}</span>
              )}
            </Link>
          ))}
        </div>

        <div className="item-roster__footer">
          <Button variant="primary" size="md" href={`/get-started?category=${categorySlug}`}>
            Assess for these roles
          </Button>
        </div>

      </div>
    </section>
  );
}
