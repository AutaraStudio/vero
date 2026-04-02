import { createClient } from '@sanity/client'
import { readFileSync, createReadStream } from 'fs'
import path from 'path'
import { config } from 'dotenv'

// Load .env.local
config({ path: '.env.local' })

const projectId = 'abtw5nba'
const dataset = 'production'
const apiVersion = '2026-03-30'

const token = process.env.SANITY_UPLOAD_TOKEN || process.env.SANITY_API_TOKEN
if (!token) {
  console.error('Set SANITY_UPLOAD_TOKEN in .env.local with an Editor-level token')
  process.exit(1)
}

const client = createClient({ projectId, dataset, apiVersion, token, useCdn: false })

// Role ID → Lottie file path mapping (relative to project root)
const roleToLottie = {
  'role-administrative-assistant': 'public/Lottie/Admin/Lottie/admin assistant.json',
  'role-document-control-compliance-administrator': 'public/Lottie/Admin/Lottie/document control - compliance admin.json',
  'role-office-coordinator': 'public/Lottie/Admin/Lottie/office coordinator.json',
  'role-receptionist-front-desk-coordinator': 'public/Lottie/Admin/Lottie/receptionist.json',
  'role-scheduling-appointments-administrator': 'public/Lottie/Admin/Lottie/scheduling - appointments admin.json',

  'role-chartered-manager-degree-apprentice': 'public/Lottie/Apprentice/Lotties/chartered manager degree apprentice.json',
  'role-data-analyst-digital-solutions-degree-apprentice': 'public/Lottie/Apprentice/Lotties/data analyst digital solutions degree apprentice.json',
  'role-engineering-maintenance-degree-apprentice': 'public/Lottie/Apprentice/Lotties/engineering apprentice.json',
  'role-it-support-digital-support-degree-apprentice': 'public/Lottie/Apprentice/Lotties/IT support apprentice.json',
  'role-project-management-degree-apprentice': 'public/Lottie/Apprentice/Lotties/project management degree apprentice.json',

  'role-claims-handler': 'public/Lottie/Collections/Lottie/claims handler.json',
  'role-claims-investigator-fraud-screening-analyst': 'public/Lottie/Collections/Lottie/claims investigator.json',
  'role-collections-agent': 'public/Lottie/Collections/Lottie/collections agent.json',
  'role-credit-controller-collections-team-leader': 'public/Lottie/Collections/Lottie/collections team lead.json',
  'role-first-notification-of-loss-agent': 'public/Lottie/Collections/Lottie/FNOL agent.json',

  'role-field-service-engineer': 'public/Lottie/Field service and technicians/Lotties/field service engineer.json',
  'role-installation-technician': 'public/Lottie/Field service and technicians/Lotties/installation technician.json',
  'role-maintenance-technician-ppm': 'public/Lottie/Field service and technicians/Lotties/maintenance tech.json',
  'role-mobile-repair-technician': 'public/Lottie/Field service and technicians/Lotties/Mobile Repair Technician.json',
  'role-service-coordinator-field-scheduler': 'public/Lottie/Field service and technicians/Lotties/Service Coordinator.json',

  'role-graduate-customer-success-support': 'public/Lottie/Graduates/Lotties-JSON files/graduate customer success JSON.json',
  'role-graduate-finance': 'public/Lottie/Graduates/Lotties-JSON files/graduate finance.json',
  'role-graduate-hr-people': 'public/Lottie/Graduates/Lotties-JSON files/graduate HR.json',
  'role-graduate-operations-business-operations': 'public/Lottie/Graduates/Lotties-JSON files/graduate operations.json',
  'role-graduate-sales-commercial': 'public/Lottie/Graduates/Lotties-JSON files/graduate sales.json',

  'role-care-assistant': 'public/Lottie/Health and social care/Lottie/care assistant.json',
  'role-care-coordinator-scheduler-home-care': 'public/Lottie/Health and social care/Lottie/care co-ordinator.json',
  'role-home-care-worker-domiciliary-carer': 'public/Lottie/Health and social care/Lottie/home care worker.json',
  'role-senior-care-assistant-team-leader': 'public/Lottie/Health and social care/Lottie/senior care assistant team lead.json',
  'role-support-worker': 'public/Lottie/Health and social care/Lottie/support worker.json',

  'role-business-operations-operations-intern': 'public/Lottie/Intern/Lotties/business operations intern.json',
  'role-finance-intern': 'public/Lottie/Intern/Lotties/finance intern.json',
  'role-marketing-intern': 'public/Lottie/Intern/Lotties/marketing intern.json',
  'role-people-hr-intern': 'public/Lottie/Intern/Lotties/people HR intern.json',
  'role-sales-commercial-intern': 'public/Lottie/Intern/Lotties/sales intern.json',

  'role-forklift-truck-driver': 'public/Lottie/Operations and logistics/Lotties/FLT driver.json',
  'role-inventory-controller-stock-control-analyst': 'public/Lottie/Operations and logistics/Lotties/stock control analyst.json',
  'role-transport-planner-dispatcher': 'public/Lottie/Operations and logistics/Lotties/transport planner.json',
  'role-warehouse-operative-picker-packer': 'public/Lottie/Operations and logistics/Lotties/warehouse operative.json',
  'role-warehouse-team-leader-shift-supervisor': 'public/Lottie/Operations and logistics/Lotties/warehouse team lead.json',

  'role-barista': 'public/Lottie/Retail and hospitality/Lotties/barista.json',
  'role-hospitality-front-of-house-team-member': 'public/Lottie/Retail and hospitality/Lotties/FOH team member.json',
  'role-kitchen-team-member-kitchen-porter': 'public/Lottie/Retail and hospitality/Lotties/kitchen porter.json',
  'role-retail-sales-assistant-sales-associate': 'public/Lottie/Retail and hospitality/Lotties/retail sales assistant.json',
  'role-retail-supervisor-shift-leader': 'public/Lottie/Retail and hospitality/Lotties/retail supervisor.json',

  'role-account-executive': 'public/Lottie/Sales/Lotties/account executive.json',
  'role-account-manager': 'public/Lottie/Sales/Lotties/account manager .json',
  'role-inside-sales-representative': 'public/Lottie/Sales/Lotties/inside sales rep.json',
  'role-sales-development-representative-enterprise': 'public/Lottie/Sales/Lotties/SDR enterprise.json',
  'role-sales-development-representative-high-volume': 'public/Lottie/Sales/Lotties/SDR high volume.json',
}

async function uploadAll() {
  const entries = Object.entries(roleToLottie)
  console.log(`Uploading ${entries.length} Lottie files to Sanity...\n`)

  let success = 0
  let failed = 0

  for (const [roleId, filePath] of entries) {
    const fullPath = path.resolve(filePath)
    const fileName = path.basename(filePath)

    try {
      // Upload file as asset
      const asset = await client.assets.upload('file', createReadStream(fullPath), {
        filename: fileName,
        contentType: 'application/json',
      })

      // Patch the role document with the file reference
      await client.patch(roleId).set({
        lottieFile: {
          _type: 'file',
          asset: { _type: 'reference', _ref: asset._id },
        },
      }).commit()

      success++
      console.log(`  ✓ ${fileName} → ${roleId}`)
    } catch (err) {
      failed++
      console.error(`  ✗ ${fileName} → ${roleId}: ${err.message}`)
    }
  }

  console.log(`\nDone: ${success} uploaded, ${failed} failed`)
}

uploadAll()
