import Link from 'next/link';
import Button from '@/components/ui/Button';

interface Role {
  _id: string;
  name: string;
  slug: string;
  strengths?: string;
}

interface RoleRosterProps {
  heading?: string;
  subheading?: string;
  roles: Role[];
  categorySlug: string;
}

export default function RoleRoster({
  heading,
  subheading,
  roles,
  categorySlug,
}: RoleRosterProps) {
  return (
    <section className="role-roster">
      <div className="container">

        {(heading || subheading) && (
          <div className="role-roster__header">
            {heading && <h2 className="section-heading">{heading}</h2>}
            {subheading && <p className="section-intro">{subheading}</p>}
          </div>
        )}

        <div className="role-roster__list">
          {roles.map((role) => (
            <Link
              key={role._id}
              href={`/assessments/${categorySlug}/${role.slug}`}
              className="role-roster__item"
            >
              <span className="text-body--sm font--medium color--primary">{role.name}</span>
              {role.strengths && (
                <span className="text-body--xs color--tertiary">{role.strengths}</span>
              )}
            </Link>
          ))}
        </div>

        <div className="role-roster__footer">
          <Button variant="primary" size="md" href={`/get-started?category=${categorySlug}`}>
            Assess for these roles
          </Button>
        </div>

      </div>
    </section>
  );
}
