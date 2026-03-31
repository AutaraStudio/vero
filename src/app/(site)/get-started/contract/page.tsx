'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useBasket } from '@/store/basketStore';
import './contract.css';

const MSA_TEXT = `
MASTER SERVICES AGREEMENT

This Master Services Agreement ("Agreement") is entered into as of the date of electronic acceptance between Tazio Digital Ltd, a company registered in England and Wales with company number 12345678, whose registered office is at 1 Innovation Way, London, EC2V 8RF ("Provider"), and the Customer identified in the Order Form ("Customer").

1. SERVICES

1.1 The Provider shall provide the talent assessment services described in the Order Form ("Services"), including access to the Vero Assess platform, assessment instruments, candidate portal, results dashboard, and interview frameworks applicable to the job roles specified.

1.2 The Provider shall use commercially reasonable endeavours to make the platform available twenty-four (24) hours a day, seven (7) days a week, excluding planned maintenance windows. The Provider shall notify the Customer of such windows at least 48 hours in advance where practicable.

1.3 The Provider reserves the right to update, modify or enhance the platform at any time, provided that such changes do not materially reduce the core functionality available to the Customer during the Term.

2. PAYMENT TERMS

2.1 The Customer shall pay the fees set out in the Order Form ("Fees") within thirty (30) days of receipt of a valid invoice. The Starter package is payable in full upon acceptance. Subscription packages (Essential, Growth, Scale) may be paid monthly or annually as elected at the time of purchase.

2.2 All Fees are quoted exclusive of Value Added Tax, which shall be charged at the applicable rate at the time of supply. The Customer shall pay VAT in addition to the Fees as invoiced.

2.3 If the Customer fails to make any payment by the due date, the Provider reserves the right to charge interest at 8% per annum above the Bank of England base rate and to suspend access to the platform until all outstanding amounts are settled in full.

3. INTELLECTUAL PROPERTY

3.1 All intellectual property rights in the platform, assessment instruments, methodology, scoring models, algorithms, and associated documentation remain the exclusive property of the Provider or its licensors. Nothing in this Agreement transfers any intellectual property rights to the Customer.

3.2 The Provider grants the Customer a limited, non-exclusive, non-transferable, non-sublicensable licence to access and use the platform solely for the internal business purposes set out in the Order Form during the Term.

3.3 The Customer retains ownership of all data submitted to the platform by the Customer or its candidates ("Customer Data"). The Customer grants the Provider a licence to process such data solely for the purpose of delivering the Services and as required by law.

4. CONFIDENTIALITY

4.1 Each party shall maintain the confidentiality of the other party's Confidential Information and shall not disclose such information to any third party without prior written consent, except to its employees or contractors who need to know it for the purposes of this Agreement and who are bound by equivalent confidentiality obligations.

4.2 Neither party shall use the other party's Confidential Information for any purpose other than the performance of its obligations or exercise of its rights under this Agreement.

4.3 The obligations in this clause shall survive the termination or expiry of this Agreement for a period of five (5) years, except in respect of trade secrets which shall be protected indefinitely.

5. DATA PROTECTION

5.1 Each party shall comply with all applicable data protection legislation, including the UK General Data Protection Regulation and the Data Protection Act 2018, and shall maintain a valid and up-to-date registration with the Information Commissioner's Office where required.

5.2 The Provider acts as a data processor in relation to candidate data provided by the Customer, which acts as the data controller in respect of such data. The Provider shall process personal data only on documented instructions from the Customer, unless required to do so by applicable law.

5.3 The Provider shall implement and maintain appropriate technical and organisational security measures to protect personal data against unauthorised or unlawful processing, accidental loss, destruction or damage, having regard to the nature of the data and the risks to individuals.

5.4 The Provider shall promptly notify the Customer upon becoming aware of a personal data breach affecting Customer Data and shall co-operate fully with the Customer in the investigation and remediation of such breach.

6. LIMITATION OF LIABILITY

6.1 Neither party excludes or limits its liability to the other for fraud or fraudulent misrepresentation, death or personal injury caused by negligence, or any other liability that cannot be excluded or limited by applicable law.

6.2 Subject to clause 6.1, neither party shall be liable to the other for any indirect, consequential, special, incidental or punitive loss or damage, including without limitation loss of revenue, loss of profits, loss of anticipated savings, loss of goodwill, or loss or corruption of data, whether arising in contract, tort (including negligence), breach of statutory duty, or otherwise.

6.3 Subject to clauses 6.1 and 6.2, the Provider's total aggregate liability to the Customer under or in connection with this Agreement, whether arising in contract, tort (including negligence), breach of statutory duty, or otherwise, shall not exceed the total Fees paid by the Customer in the twelve (12) months immediately preceding the event giving rise to the claim.

7. TERM AND TERMINATION

7.1 This Agreement commences on the Effective Date and continues for the Initial Term specified in the Order Form. At the end of the Initial Term, subscription packages shall automatically renew for successive periods of twelve (12) months unless either party gives thirty (30) days' written notice of non-renewal prior to the expiry of the then-current term.

7.2 Either party may terminate this Agreement immediately upon written notice if the other party: (a) commits a material breach of this Agreement and, where the breach is capable of remedy, fails to remedy it within thirty (30) days of receiving written notice specifying the breach; (b) becomes insolvent, enters administration, receivership or liquidation, or ceases to trade; or (c) undergoes a change of control without the prior written consent of the other party.

7.3 On termination or expiry of this Agreement for any reason, the Customer shall immediately cease using the platform and the Provider shall, at the Customer's request, delete or return all Customer Data within thirty (30) days, subject to the Provider's legal obligations to retain certain data.

8. GOVERNING LAW AND DISPUTE RESOLUTION

8.1 This Agreement and any non-contractual obligations arising in connection with it shall be governed by and construed in accordance with the laws of England and Wales.

8.2 Each party irrevocably submits to the exclusive jurisdiction of the courts of England and Wales in relation to any dispute or claim (including non-contractual disputes or claims) arising out of or in connection with this Agreement or its subject matter or formation.

8.3 Before commencing formal proceedings, each party agrees to attempt to resolve any dispute through good-faith negotiation between senior representatives for a period of no less than thirty (30) days.
`;

export default function ContractPage() {
  const router = useRouter();
  const { state, dispatch } = useBasket();
  const { selectedRoles, contactDetails, contractAccepted } = state;

  const contractRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(contractAccepted ? 100 : 0);
  const [scrolledToBottom, setScrolledToBottom] = useState(contractAccepted);
  const [accepted, setAccepted] = useState(contractAccepted);

  // Guard: redirect if no basket or no contact details
  useEffect(() => {
    if (selectedRoles.length === 0 || !contactDetails.email) {
      router.replace('/get-started');
    }
  }, [selectedRoles.length, contactDetails.email, router]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollable = scrollHeight - clientHeight;
    if (scrollable <= 0) return;
    const progress = (scrollTop / scrollable) * 100;
    setScrollProgress(Math.min(progress, 100));
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setScrolledToBottom(true);
    }
  };

  const handleAccept = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setAccepted(checked);
    if (checked) {
      dispatch({ type: 'ACCEPT_CONTRACT' });
    }
  };

  return (
    <section className="contract-page">
      <div className="contract-inner">

        <div className="contract-header">
          <h1 className="text-h3 color--primary">Master Services Agreement</h1>
          {contactDetails.company && (
            <p className="text-body--md color--tertiary contract-parties">
              Between <strong>Tazio Digital Ltd</strong> and <strong>{contactDetails.company}</strong>
            </p>
          )}
        </div>

        <div
          ref={contractRef}
          className="contract-body"
          onScroll={handleScroll}
          tabIndex={0}
          aria-label="Master Services Agreement — scroll to read"
        >
          <div className="contract-text">
            {MSA_TEXT.trim().split('\n\n').map((block, i) => {
              const trimmed = block.trim();
              if (!trimmed) return null;

              // Section headings (e.g. "1. SERVICES")
              if (/^\d+\.\s+[A-Z\s]+$/.test(trimmed)) {
                return <h2 key={i}>{trimmed}</h2>;
              }

              // Numbered clauses (e.g. "1.1 ...")
              const clauseMatch = trimmed.match(/^(\d+\.\d+)\s+([\s\S]+)/);
              if (clauseMatch) {
                return (
                  <div key={i} className="clause">
                    <span className="clause-num">{clauseMatch[1]}</span>
                    <span className="clause-body">{clauseMatch[2]}</span>
                  </div>
                );
              }

              return <p key={i}>{trimmed}</p>;
            })}
          </div>
        </div>

        <div className="contract-scroll-progress" aria-hidden="true">
          <div
            className="contract-scroll-progress__fill"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        <div className="contract-accept">
          <div className="contract-checkbox-row">
            <input
              id="contract-accept"
              type="checkbox"
              className="contract-checkbox"
              checked={accepted}
              onChange={handleAccept}
              disabled={!scrolledToBottom}
              aria-describedby={!scrolledToBottom ? 'contract-hint' : undefined}
            />
            <label htmlFor="contract-accept" className="contract-checkbox-label">
              I have read and agree to the Master Services Agreement
              {contactDetails.company && ` on behalf of ${contactDetails.company}`}.
            </label>
          </div>

          {!scrolledToBottom && (
            <p id="contract-hint" className="contract-hint">
              Please scroll through and read the agreement before accepting.
            </p>
          )}
        </div>

        <div className="contract-actions">
          <Button
            variant="primary"
            size="md"
            href={accepted ? '/get-started/payment' : undefined}
            disabled={!accepted}
          >
            Continue to payment →
          </Button>
          <Button variant="secondary" size="md" href="/get-started/details">
            ← Back
          </Button>
        </div>

      </div>
    </section>
  );
}
