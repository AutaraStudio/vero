import { createClient } from '@sanity/client'

const client = createClient({
  projectId: 'abtw5nba',
  dataset: 'production',
  apiVersion: '2026-03-30',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
})

// Category → roles mapping with Lottie paths
const categories = [
  {
    name: 'Admin',
    slug: 'admin',
    roles: [
      { name: 'Admin Assistant', lottie: '/Lottie/Admin/Lottie/admin assistant.json' },
      { name: 'Document Control & Compliance Admin', lottie: '/Lottie/Admin/Lottie/document control - compliance admin.json' },
      { name: 'Office Coordinator', lottie: '/Lottie/Admin/Lottie/office coordinator.json' },
      { name: 'Receptionist', lottie: '/Lottie/Admin/Lottie/receptionist.json' },
      { name: 'Scheduling & Appointments Admin', lottie: '/Lottie/Admin/Lottie/scheduling - appointments admin.json' },
    ],
  },
  {
    name: 'Apprentice',
    slug: 'apprentice',
    roles: [
      { name: 'Chartered Manager Degree Apprentice', lottie: '/Lottie/Apprentice/Lotties/chartered manager degree apprentice.json' },
      { name: 'Data Analyst Digital Solutions Degree Apprentice', lottie: '/Lottie/Apprentice/Lotties/data analyst digital solutions degree apprentice.json' },
      { name: 'Engineering Apprentice', lottie: '/Lottie/Apprentice/Lotties/engineering apprentice.json' },
      { name: 'IT Support Apprentice', lottie: '/Lottie/Apprentice/Lotties/IT support apprentice.json' },
      { name: 'Project Management Degree Apprentice', lottie: '/Lottie/Apprentice/Lotties/project management degree apprentice.json' },
    ],
  },
  {
    name: 'Collections',
    slug: 'collections',
    roles: [
      { name: 'Claims Handler', lottie: '/Lottie/Collections/Lottie/claims handler.json' },
      { name: 'Claims Investigator', lottie: '/Lottie/Collections/Lottie/claims investigator.json' },
      { name: 'Collections Agent', lottie: '/Lottie/Collections/Lottie/collections agent.json' },
      { name: 'Collections Team Lead', lottie: '/Lottie/Collections/Lottie/collections team lead.json' },
      { name: 'FNOL Agent', lottie: '/Lottie/Collections/Lottie/FNOL agent.json' },
    ],
  },
  {
    name: 'Field Service & Technicians',
    slug: 'field-service-and-technicians',
    roles: [
      { name: 'Field Service Engineer', lottie: '/Lottie/Field service and technicians/Lotties/field service engineer.json' },
      { name: 'Installation Technician', lottie: '/Lottie/Field service and technicians/Lotties/installation technician.json' },
      { name: 'Maintenance Technician', lottie: '/Lottie/Field service and technicians/Lotties/maintenance tech.json' },
      { name: 'Mobile Repair Technician', lottie: '/Lottie/Field service and technicians/Lotties/Mobile Repair Technician.json' },
      { name: 'Service Coordinator', lottie: '/Lottie/Field service and technicians/Lotties/Service Coordinator.json' },
    ],
  },
  {
    name: 'Graduates',
    slug: 'graduates',
    roles: [
      { name: 'Graduate Customer Success', lottie: '/Lottie/Graduates/Lotties-JSON files/graduate customer success JSON.json' },
      { name: 'Graduate Finance', lottie: '/Lottie/Graduates/Lotties-JSON files/graduate finance.json' },
      { name: 'Graduate HR', lottie: '/Lottie/Graduates/Lotties-JSON files/graduate HR.json' },
      { name: 'Graduate Operations', lottie: '/Lottie/Graduates/Lotties-JSON files/graduate operations.json' },
      { name: 'Graduate Sales', lottie: '/Lottie/Graduates/Lotties-JSON files/graduate sales.json' },
    ],
  },
  {
    name: 'Health & Social Care',
    slug: 'health-and-social-care',
    roles: [
      { name: 'Care Assistant', lottie: '/Lottie/Health and social care/Lottie/care assistant.json' },
      { name: 'Care Coordinator', lottie: '/Lottie/Health and social care/Lottie/care co-ordinator.json' },
      { name: 'Home Care Worker', lottie: '/Lottie/Health and social care/Lottie/home care worker.json' },
      { name: 'Senior Care Assistant & Team Lead', lottie: '/Lottie/Health and social care/Lottie/senior care assistant team lead.json' },
      { name: 'Support Worker', lottie: '/Lottie/Health and social care/Lottie/support worker.json' },
    ],
  },
  {
    name: 'Intern',
    slug: 'intern',
    roles: [
      { name: 'Business Operations Intern', lottie: '/Lottie/Intern/Lotties/business operations intern.json' },
      { name: 'Finance Intern', lottie: '/Lottie/Intern/Lotties/finance intern.json' },
      { name: 'Marketing Intern', lottie: '/Lottie/Intern/Lotties/marketing intern.json' },
      { name: 'People & HR Intern', lottie: '/Lottie/Intern/Lotties/people HR intern.json' },
      { name: 'Sales Intern', lottie: '/Lottie/Intern/Lotties/sales intern.json' },
    ],
  },
  {
    name: 'Operations & Logistics',
    slug: 'operations-and-logistics',
    roles: [
      { name: 'FLT Driver', lottie: '/Lottie/Operations and logistics/Lotties/FLT driver.json' },
      { name: 'Stock Control Analyst', lottie: '/Lottie/Operations and logistics/Lotties/stock control analyst.json' },
      { name: 'Transport Planner', lottie: '/Lottie/Operations and logistics/Lotties/transport planner.json' },
      { name: 'Warehouse Operative', lottie: '/Lottie/Operations and logistics/Lotties/warehouse operative.json' },
      { name: 'Warehouse Team Lead', lottie: '/Lottie/Operations and logistics/Lotties/warehouse team lead.json' },
    ],
  },
  {
    name: 'Retail & Hospitality',
    slug: 'retail-and-hospitality',
    roles: [
      { name: 'Barista', lottie: '/Lottie/Retail and hospitality/Lotties/barista.json' },
      { name: 'FOH Team Member', lottie: '/Lottie/Retail and hospitality/Lotties/FOH team member.json' },
      { name: 'Kitchen Porter', lottie: '/Lottie/Retail and hospitality/Lotties/kitchen porter.json' },
      { name: 'Retail Sales Assistant', lottie: '/Lottie/Retail and hospitality/Lotties/retail sales assistant.json' },
      { name: 'Retail Supervisor', lottie: '/Lottie/Retail and hospitality/Lotties/retail supervisor.json' },
    ],
  },
  {
    name: 'Sales',
    slug: 'sales',
    roles: [
      { name: 'Account Executive', lottie: '/Lottie/Sales/Lotties/account executive.json' },
      { name: 'Account Manager', lottie: '/Lottie/Sales/Lotties/account manager .json' },
      { name: 'Inside Sales Rep', lottie: '/Lottie/Sales/Lotties/inside sales rep.json' },
      { name: 'SDR Enterprise', lottie: '/Lottie/Sales/Lotties/SDR enterprise.json' },
      { name: 'SDR High Volume', lottie: '/Lottie/Sales/Lotties/SDR high volume.json' },
    ],
  },
]

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function seed() {
  console.log('Seeding categories and roles...\n')

  // Check for existing categories to avoid duplicates
  const existingCategories = await client.fetch(`*[_type == "jobCategory"]{ name, _id }`)
  const existingRoles = await client.fetch(`*[_type == "role"]{ name, _id }`)

  const categoryMap = new Map(existingCategories.map((c) => [c.name, c._id]))
  const roleSet = new Set(existingRoles.map((r) => r.name))

  const transaction = client.transaction()
  let createdCategories = 0
  let createdRoles = 0

  for (const cat of categories) {
    let categoryId = categoryMap.get(cat.name)

    // Create category if it doesn't exist
    if (!categoryId) {
      categoryId = `jobCategory-${cat.slug}`
      transaction.createIfNotExists({
        _id: categoryId,
        _type: 'jobCategory',
        name: cat.name,
        slug: { _type: 'slug', current: cat.slug },
      })
      createdCategories++
      console.log(`+ Category: ${cat.name}`)
    } else {
      console.log(`= Category exists: ${cat.name} (${categoryId})`)
    }

    // Create roles
    for (const role of cat.roles) {
      if (roleSet.has(role.name)) {
        // Update existing role with lottie path
        const existing = existingRoles.find((r) => r.name === role.name)
        if (existing) {
          transaction.patch(existing._id, (p) => p.set({ lottieFile: role.lottie }))
          console.log(`  ~ Updated lottie for: ${role.name}`)
        }
        continue
      }

      const roleSlug = slugify(role.name)
      const roleId = `role-${roleSlug}`
      transaction.createIfNotExists({
        _id: roleId,
        _type: 'role',
        name: role.name,
        slug: { _type: 'slug', current: roleSlug },
        parentCategory: { _type: 'reference', _ref: categoryId },
        lottieFile: role.lottie,
      })
      createdRoles++
      console.log(`  + Role: ${role.name}`)
    }
  }

  console.log(`\nCommitting: ${createdCategories} categories, ${createdRoles} roles...`)
  const result = await transaction.commit()
  console.log(`Done! Transaction ID: ${result.transactionId}`)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
