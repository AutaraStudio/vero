/**
 * Seed the three legal pages — privacy, cookies, security.
 *
 * Content was extracted verbatim from www.tazio.io on 2026-05-05 and
 * lightly reformatted as Markdown so the in-app renderer can lay it
 * out cleanly.
 *
 * Idempotent: uses createOrReplace with deterministic IDs so re-running
 * the script overwrites the docs in place. Safe to re-run after a copy
 * tweak in this file.
 *
 * Run with:
 *   node --env-file=.env.local scripts/seed-legal-pages.mjs
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset:   process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-09-01',
  token:     process.env.SANITY_API_TOKEN,
  useCdn:    false,
});

const PRIVACY_BODY = `## Privacy Notice

This privacy notice sets out, in line with GDPR, the types of data that Tazio collects, processes and holds for marketing purposes. It also outlines how the information is used, retention periods, and other relevant data details.

This notice applies to current customers and suppliers, former customers, prospective customers, and anyone who subscribes to marketing or downloads materials.

## Data Controller Details

The Company is a data controller, determining processes used when handling personal data.

Contact details:

- Address: Tazio Online Media Limited, Beechwood House, Greenwood Close, Cardiff Gate, Pontprennau, Cardiff CF23 8RD, United Kingdom
- Telephone: 02922 331 888
- Email: support@tazio.co.uk

## Data Protection Principles

In relation to personal data, Tazio will:

- Process it fairly, lawfully and in a clear, transparent way
- Collect data only for proper reasons related to providing services or engaging suppliers
- Use it only as explained
- Ensure it is correct and up to date
- Keep data only as long as needed
- Process it securely to prevent unauthorized use, loss or destruction

## Types of Data We Process

Tazio holds and processes personal details including name, address, email address and phone numbers of:

- Current customers
- Prospective customers
- Former customers
- Anyone interested in Tazio who subscribes or downloads content requiring personal data exchange

## How And Why We Use Your Personal Data

Tazio markets its services and selected third-party partners' services to:

- Existing and former customers
- Third parties who previously expressed interest in services
- Potential clients or businesses identified as likely to benefit from services

This marketing pursues legitimate business interests in promoting Tazio's services to existing, former and prospective customers.

## How We Collect Data And How It Is Used

Data relating to current, former and prospective customers is collected:

- Directly from the customer
- From third parties such as referrals or recommendations
- Through marketing lead generation activity
- Through GDPR compliant data sources such as Honch or publicly available information like LinkedIn

Personal data is kept within the Company's Marketing CRM system.

### Analytics

The website uses analytics cookies solely to track website performance and understand visitor interests.

### Cookies

Tazio may log information using cookies — small data files stored on browser by Tazio. Both session cookies (expiring when browser closes) and persistent cookies (remaining until deleted) are used to provide personalized website experience.

Tazio uses cookies to:

- Store visitors' preferences
- Record user-specific information on pages accessed or visited
- Ensure visitors aren't targeted with irrelevant content
- Customize content based on visitor browser type or information sent
- Track user behaviour and interest

## Information You Voluntarily Submit to the Website

Tazio collects Personal Data when voluntarily provided, such as when contacting with inquiries, registering for gated content, or booking demos or meetings. Personal Data may include:

- Name and email address
- Website URL and name
- Company name
- Phone number (where relevant and provided)

The legal basis for processing this information is consent. By voluntarily providing Personal Data, users consent to its use per this Privacy Policy. Such Personal Data may be transferred and stored from current location to Tazio offices and authorized third parties' servers.

### Automatically-Collected Information

Certain information about users and devices accessing Tazio is automatically collected. When accessing the website, IP address, operating system type, browser type, referring website, pages viewed, and access dates/times are logged. Information about actions taken when using the website, such as links clicked, is also collected.

### Non-Identifiable Data

Personally non-identifiable information received and stored when interacting through the Website cannot presently be used to specifically identify users. Such information may be stored in databases owned and maintained by affiliates, agents, or service providers. The Website may use such information and pool it with other information to track total visitors, visitors per page, and visitor Internet service provider domain names. No Personal Data is available or used in this process.

### Aggregated Personal Data

Tazio conducts research on customer demographics, interests and behaviour based on Personal Data and other information provided. This research is compiled and analysed. This information doesn't identify users personally.

Cookies won't be used if users don't agree to their use when first accessing the website or if browser settings don't allow cookies. Upon entering the website, users are prompted to select cookie preferences. To withdraw prior agreement to cookie use, users can use website cookie controls enabling preference management.

## Why We Process Data

Data protection law permits data processing for certain reasons only:

- To perform contracts parties are involved in
- To carry out legally required duties
- To carry out legitimate interests
- To protect interests
- Where something is done in public interest

All processing by Tazio falls into permitted reasons, generally relying on the first three listed.

For example, personal data of customers and suppliers is collected and processed to perform contractual obligations and maintain accurate accounting records for legal compliance.

Tazio also collects data for activities in the Company's legitimate interests:

- Contacting prospective customers
- Tracking website performance and understanding visitor interests
- Ensuring network and information security
- Dealing with legal claims against Tazio or bringing legal claims against others
- Preventing fraud

## How Your Personal Information May Be Used

Tazio may use personal information in the following ways:

- To operate, maintain and develop the website
- To create accounts, identify users, and customize websites to accounts
- To send promotional information, such as newsletters with unsubscribe options
- To send administrative communications like confirmation emails, technical notices, policy updates, or security alerts
- To respond to comments or inquiries
- To provide support
- To track and measure website performance
- To protect, investigate, and deter unauthorized or illegal activity
- To review marketing program effectiveness and analyse general demographic trends
- To notify of new information or services that may interest users
- To send promotional materials

## Legal Bases For Processing Data Under GDPR

Below are the types of lawful basis Tazio relies on to process Personal Data:

### Legitimate Interest

Legitimate Interest means the interest of Tazio's business in conducting and managing its business to enable providing best service/product and most secure experience. Tazio considers and balances potential impacts on users (both positive and negative) and user rights before processing Personal Data for legitimate interests. Personal Data isn't used for activities where interests are overridden by impacts on users unless consent or legal permission exists.

### Performance of Contract

Performance of Contract means processing data where necessary for contract performance to which users are party or to take steps at user request before entering such contract.

### Comply with a legal or regulatory obligation

This means processing Personal Data where necessary for compliance with legal or regulatory obligations Tazio is subject to.

### Consent

Consent means where users have consented to certain Personal Data use.

## Special Categories of Data

Tazio knows it must process special categories of data per more stringent guidelines, however it doesn't and won't process special category data relating to past, present, or potential customers.

Special categories of data are data relating to:

- Health
- Criminal convictions and offences
- Sex life
- Sexual orientation
- Race
- Ethnic origin
- Political opinion
- Religion
- Trade union membership
- Genetic and biometric data

## If You Do Not Provide Data To Us

One reason for processing data is allowing Tazio to carry out contract duties. If data needed for this isn't provided, Tazio may be unable to perform those duties.

## Sharing Data

### Internal Sharing

Tazio may share personal data with selected third parties to facilitate business operations and marketing efforts. When engaging other entities to perform specific functions, they're provided only information necessary to fulfil duties per data protection standards.

- Tazio Colleagues: Data may be shared internally with colleagues when necessary to enable them performing duties effectively.

### External Sharing

**Service Providers & Partners.** Tazio occasionally hires external companies to assist with marketing functions, customer relationship management, and administrative support. Only minimum required data for partners completing tasks is shared. This includes:

- HubSpot (EU-based processing): Tazio uses HubSpot for secure storage and management of CRM database including customer contact information such as names and email addresses, primarily for marketing and customer feedback contact purposes.

**Legal & Compliance.** Data may be shared for legal reasons, including:

- Legal Advisors and HM Courts & Tribunal Service: Data may be shared with legal representatives for defending legal claims against Tazio or pursuing legal action against customers, suppliers, or third parties.
- Third-Party Marketing Agents: Data may be shared with selected third-party marketing agents meeting compliance and contractual obligations, assisting with specific marketing activities.

### Compliance with Legal Obligations

Tazio may share data as required by applicable laws, regulations, or legal requests from public authorities to meet imposed legal obligations.

## Marketing Use Of Data

Personal data is used to send updates (by email, text message, telephone or post) about Tazio products and/or services, including exclusive offers, promotions or new products and/or services.

Tazio has legitimate interest in using personal data for marketing purposes (see "How and why we use your personal data"). This means consent isn't usually needed to send marketing information. If marketing approach changes so consent is needed, this will be requested separately and clearly.

Users have the right to opt-out of receiving marketing communications at any time by:

- Contacting support@tazio.co.uk
- Using the "unsubscribe" link in emails or "STOP" number in texts

Tazio may ask users to confirm or update marketing preferences if requesting further products/services in the future, or if changes occur in law, regulation, or business structure.

Tazio may disclose personal data to:

- Other Tazio members
- Third parties in the event Tazio sells or transfers business or assets, disclosing personal data to prospective and actual buyers

Where data is disclosed to other Tazio members, those members may contact users and send marketing communications about potentially interesting products and services.

If users have consented to receiving marketing communications from Tazio (or, if corporate subscribers, haven't objected to marketing communications), they have the right to ask Tazio to stop sending marketing communications at any time. This won't affect lawfulness of processing before consent withdrawal or objection receipt. To withdraw consent or object to marketing communications, contact support@tazio.co.uk or follow unsubscribe instructions in each electronic marketing communication. Once Tazio receives notification that users no longer wish marketing, information won't be processed for this purpose unless another legitimate legal basis exists.

## Protecting Data

Tazio is aware of requirements to ensure data protection against accidental loss or disclosure, destruction and abuse, having implemented processes to guard against such.

Where data is shared with third parties, contracts ensure data is held securely and per GDPR requirements. Third parties must implement appropriate technical and organizational measures ensuring data security.

## How Long We Keep Data For

If active Tazio customers, data is retained per contractual obligations, though users can opt out of marketing data at any time.

Former customer and prospective customer data is retained for 12 months after last confirmed contact then deleted. Users can opt out of marketing data at any time.

Notification occurs one month prior to and one week prior to data deletion, giving the option to opt back in if desired.

Should users opt out of marketing data, this is retained indefinitely to ensure that if data is received via third party, the wish not to be contacted is respected.

## Automated Decision Making

Tazio doesn't make decisions based on automated decision making (e.g., decisions taken using electronic systems without human involvement) in marketing.

## Your Rights in Relation to Data

Data protection law gives certain rights relating to held data. These are:

- The right to be informed. Tazio must explain how data is used, the purpose of this privacy notice.
- The right of access. Users have the right to access held data by making a subject access request.
- The right for any inaccuracies to be corrected. If held data is incomplete or inaccurate, users can require correction.
- The right to have information deleted. Users can ask Tazio to delete data from systems where no reason for continued processing exists.
- The right to restrict data processing. For example, if held data is believed incorrect, Tazio stops processing data (whilst still holding it) until data accuracy is ensured.
- The right to portability. Users may transfer held data for their own purposes.
- The right to object to information inclusion. Users have the right to object to data use where Tazio uses it for legitimate interests.
- The right to regulate automated decision-making and profiling of personal data. Users have a right not to be subject to automated decision making adversely affecting legal rights.

Where consent has been provided for data use, users also have the unrestricted right to withdraw consent at any time. Withdrawing consent means Tazio stops processing previously consented data. There are no consequences for consent withdrawal. However, in some cases, Tazio may continue using data where permitted by having legitimate reasons such as contractual obligations.

To exercise any explained rights, contact support@tazio.co.uk.

## Children's Information

Tazio doesn't knowingly collect personally identifiable information from children under 16. Children under 16 shouldn't submit Personal Data through the Website. Parents and legal guardians are encouraged to monitor children's Internet usage and enforce this privacy policy by instructing children never to provide personal data without permission. If parents or guardians believe Tazio has personally identifiable information of children under 16 in its database, contact support@tazio.co.uk immediately and Tazio will use best efforts to promptly remove such information.

## Web Links

Tazio contains links to other sites. Tazio isn't responsible for the privacy practices or content of such other sites. Users are encouraged to be aware when leaving the site to read privacy and spam policies of each website collecting personally identifiable information. This Privacy Policy applies solely to information Tazio collects.

## Email Communications

If users send emails with questions or comments, personally identifiable information may be used to respond to questions or comments, and questions or comments may be saved for future reference. For security reasons, non-public personal information such as passwords, social security numbers, or bank account information shouldn't be sent via email. Users may "opt-out" of receiving future commercial email communications by clicking the "unsubscribe" link in most sent emails, however, Tazio reserves the right to send transactional emails such as customer service communications or communications with Customer Success Managers.

## Changes to Tazio's Policy

The Website may change from time to time. As a result, at times it may be necessary to make changes to this Privacy Policy. Tazio reserves the right to update or modify this Privacy Policy at any time and from time to time without prior notice. Please review this policy periodically, and especially before providing any Personal Data. Continued Website use after any changes or revisions to this Privacy Policy indicates agreement with revised Privacy Policy terms.

## Making a Complaint

The supervisory authority in the UK for data protection matters is the Information Commissioner (ICO). If data protection rights have been breached in any way by Tazio, complaints can be made to the ICO.

## Data Protection Manager

The Company isn't required to appoint a Data Protection Officer. All GDPR correspondence should be addressed to support@tazio.co.uk.

Tazio's Data Protection Representative is the CIO, Richard Gaze.
`;

const SECURITY_BODY = `## Vulnerability Disclosure Policy

Tazio Online Media Limited (Tazio) are committed to addressing and reporting security issues through a coordinated and constructive approach designed to provide the greatest protection for Tazio customers, partners, staff and all Internet users.

A security vulnerability is a weakness in our systems or services that may compromise their security. This policy applies to security vulnerabilities discovered anywhere by both Tazio staff and by others using Tazio services. The responsibility for this policy is with the senior management team of Tazio who will review it on an annual process. All day-to-day staff must follow this policy and will receive regular training on how to follow it.

## Reporting Vulnerabilities

If you believe you have discovered a vulnerability in one of our services or have a security incident to report, please email [security@tazio.co.uk](mailto:security@tazio.co.uk?subject=Security%20Issue).

Once we have received a vulnerability report, Tazio takes a series of steps to address the issue:

- We will provide prompt acknowledgement of receipt of your report of the vulnerability.
- We request the reporter keep any communication regarding the vulnerability confidential.
- We will work with you to understand and investigate the vulnerability.
- We will provide a timeframe for addressing the vulnerability.
- We will notify you once the vulnerability has been resolved, to allow retesting by the reporter if needed.

Tazio will endeavour to keep the reporter apprised of every step in this process as it occurs.

## Responsible Disclosure

We greatly appreciate the efforts of security researchers and discoverers who share information on security issues with us, giving us a chance to improve our services, and better protect our customers. In line with general responsible disclosure good practice, we ask that security researchers:

- Allow Tazio an opportunity to correct a vulnerability within a reasonable time period before publicly disclosing the identified issue.
- Provide sufficient detail about the vulnerability to allow us to investigate successfully including steps required to reproduce the issue.
- Use the Common Vulnerability Scoring System when reporting a vulnerability.
- Do not modify or delete data, or take actions that would impact on Tazio customers.
- Do not carry out social engineering exercises or attempt to find weaknesses in the physical security of Tazio offices or other locations.
`;

const COOKIES_BODY = `This Cookie Policy applies to citizens and legal permanent residents of the United Kingdom.

## 1. Introduction

Our website uses cookies and other related technologies (for convenience all technologies are referred to as "cookies"). Cookies are also placed by third parties we have engaged. The cookie software used on our website, which enables you to opt in and out, uses an EU processing centre. Below we inform you about the use of cookies on our website.

## 2. What are cookies?

A cookie is a small simple file that is sent along with pages of this website and stored by your browser on the hard drive of your computer or another device. The information stored therein may be returned to our servers or to the servers of the relevant third parties during a subsequent visit.

## 3. What are scripts?

A script is a piece of programme code that is used to make our website function properly and interactively. This code is executed on our server or on your device.

## 4. What is a web beacon?

A web beacon (or a pixel tag) is a small, invisible piece of text or image on a website that is used to monitor traffic on a website. In order to do this, various data about you is stored using web beacons.

## 5. Cookies

### 5.1 Technical or functional cookies

Some cookies ensure that certain parts of the website work properly and that your user preferences remain known. By placing functional cookies, we make it easier for you to visit our website. This way, you do not need to repeatedly enter the same information when visiting our website. We may place these cookies without your consent.

### 5.2 Statistics cookies

We use statistics cookies to optimise the website experience for our users. With these statistics cookies we get insights into the usage of our website to make continuous improvements. We ask your permission to place statistics cookies.

### 5.3 Advertising cookies

On this website we use advertising cookies, enabling us to gain insights into the campaign results. This happens based on a profile we create based on your behaviour on this website. With these cookies you, as website visitor, are linked to a unique ID but these cookies will not profile your behaviour and interests to serve personalized ads. Because these cookies are marked as tracking cookies, we ask your permission to place these.

### 5.4 Marketing/Tracking cookies

Marketing/Tracking cookies are cookies or any other form of local storage, used to create user profiles to display advertising or to track the user on this website or across several websites for similar marketing purposes.

## 6. Placed Cookies

- Google Analytics
- Google Tag Manager
- Google Search Console
- reCAPTCHA
- YouTube
- HubSpot
- LinkedIn
- Twitter
- Facebook
- Instagram
- Visitor Queue
- Databox

## 7. Consent

When you visit our website for the first time, we will show you a pop-up with an explanation about cookies. As soon as you click on "Save preferences", you consent to us using the categories of cookies and plug-ins you selected in the pop-up, as described in this Cookie Policy. You can disable the use of cookies via your browser, but please note that our website may no longer work properly.

## 8. Enabling, disabling and deleting cookies

You can use your internet browser to automatically or manually delete cookies. You can also specify that certain cookies may not be placed. Another option is to change the settings of your internet browser so that you receive a message each time a cookie is placed. For more information about these options, please refer to the instructions in the "Help" section of your browser. Please note that our website may not work properly if all cookies are disabled. If you do delete the cookies in your browser, they will be placed again after you consent when you visit our website again.

## 9. Your rights with respect to personal data

You have the following rights with respect to your personal data:

- You have the right to know why your personal data is needed, what will happen to it, and how long it will be retained for.
- Right of access: you have the right to access your personal data that is known to us.
- Right to rectification: you have the right to supplement, correct, have deleted or blocked your personal data whenever you wish. If you give us your consent to process your data, you have the right to revoke that consent and to have your personal data deleted.
- Right to transfer your data: you have the right to request all your personal data from the controller and transfer it in its entirety to another controller.
- Right to object: you may object to the processing of your data. We comply with this, unless there are justified grounds for processing.

To exercise these rights, please contact us at support@tazio.co.uk. If you have a complaint about how we handle your data, we would like to hear from you, but you also have the right to submit a complaint to the supervisory authority (the Information Commissioner's Office, ICO).

## 10. Contact details

For questions and/or comments about our Cookie Policy and this statement, please contact us using the following details:

**Address:** Tazio Online Media Limited, Beechwood House, Greenwood Close, Cardiff Gate, Pontprennau, Cardiff CF23 8RD, United Kingdom

**Email:** service@tazio.co.uk or richard.gaze@tazio.co.uk

**Phone:** 02922 331 888

If you believe that any information we are holding on you is incorrect or incomplete, please write to or email us as soon as possible. We will promptly correct any information found to be incorrect.
`;

const DOCS = [
  {
    _id: 'legalPage.privacy',
    _type: 'legalPage',
    title: 'Privacy Policy',
    slug: { _type: 'slug', current: 'privacy' },
    intro:
      'How Tazio Online Media Limited collects, uses, stores and shares your personal data, and the rights you have under UK GDPR.',
    lastUpdated: '2024-07-29',
    body: PRIVACY_BODY,
  },
  {
    _id: 'legalPage.security',
    _type: 'legalPage',
    title: 'Security',
    slug: { _type: 'slug', current: 'security' },
    intro:
      'Our vulnerability disclosure policy and how to responsibly report a security issue to the Tazio team.',
    lastUpdated: '2024-07-29',
    body: SECURITY_BODY,
  },
  {
    _id: 'legalPage.cookies',
    _type: 'legalPage',
    title: 'Cookie Policy',
    slug: { _type: 'slug', current: 'cookies' },
    intro:
      'What cookies and similar technologies we use on this site, why, and how to manage your preferences.',
    lastUpdated: '2024-07-29',
    body: COOKIES_BODY,
  },
];

async function main() {
  console.log('Seeding legal pages…');
  for (const doc of DOCS) {
    await client.createOrReplace(doc);
    console.log(`  ${doc._id}  →  /legal/${doc.slug.current}`);
  }
  console.log('Done.');
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
