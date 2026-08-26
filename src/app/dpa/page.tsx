/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "Data Processing Addendum (DPA)",
  description: "DevStackIO Data Processing Addendum pursuant to Article 28 GDPR. Governs the processing of personal data on behalf of customers.",
  alternates: { canonical: `${siteConfig.url}/dpa` },
  openGraph: {
    title: "Data Processing Addendum (DPA) | DevStackIO",
    description: "Data Processing Addendum pursuant to Article 28 GDPR for DevStackIO services.",
    url: `${siteConfig.url}/dpa`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO DPA" }],
  },
};

export default function DPAPage() {
  const lastUpdated = siteConfig.legal?.lastUpdated?.dpa || "2026-07-20";
  const effectiveDate = "2026-07-20";

  return (
    <div className="container py-12 md:py-16">
      <article className="mx-auto max-w-4xl">
        <div className="mb-8">
          <p className="text-sm text-surface-500 dark:text-dark-muted">
            Last updated: {lastUpdated} | Effective: {effectiveDate}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            Data Processing Addendum (DPA)
          </h1>
          <p className="mt-2 text-lg text-surface-600 dark:text-dark-muted">
            Pursuant to Article 28 of the General Data Protection Regulation (GDPR)
          </p>
        </div>

        <div className="mb-8 p-4 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
          <p className="text-sm text-brand-700 dark:text-brand-300">
            <strong>Status:</strong> This DPA is incorporated by reference into the{" "}
            <a href="/terms" className="underline hover:text-brand-600">Terms of Service</a>
            {" "}and applies to all processing of personal data by DevStackIO on behalf of customers.
            For enterprise customers with a signed agreement, this DPA forms part of that agreement.
          </p>
        </div>

        <nav className="mb-8 p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-dark-text mb-3">Table of Contents</h2>
          <ol className="list-decimal pl-6 space-y-1 text-sm text-surface-600 dark:text-dark-muted">
            <li><a href="#1-definitions" className="text-brand-500 underline hover:text-brand-600">1. Definitions and Interpretation</a></li>
            <li><a href="#2-scope" className="text-brand-500 underline hover:text-brand-600">2. Scope and Applicability</a></li>
            <li><a href="#3-processing-details" className="text-brand-500 underline hover:text-brand-600">3. Processing Details</a></li>
            <li><a href="#4-controller-obligations" className="text-brand-500 underline hover:text-brand-600">4. Controller Obligations</a></li>
            <li><a href="#5-processor-obligations" className="text-brand-500 underline hover:text-brand-600">5. Processor Obligations</a></li>
            <li><a href="#6-security-measures" className="text-brand-500 underline hover:text-brand-600">6. Technical and Organizational Measures</a></li>
            <li><a href="#7-subprocessors" className="text-brand-500 underline hover:text-brand-600">7. Subprocessors</a></li>
            <li><a href="#8-data-subject-rights" className="text-brand-500 underline hover:text-brand-600">8. Data Subject Rights</a></li>
            <li><a href="#9-international-transfers" className="text-brand-500 underline hover:text-brand-600">9. International Transfers</a></li>
            <li><a href="#10-data-breach" className="text-brand-500 underline hover:text-brand-600">10. Personal Data Breach Notification</a></li>
            <li><a href="#11-deletion-return" className="text-brand-500 underline hover:text-brand-600">11. Deletion or Return of Personal Data</a></li>
            <li><a href="#12-audit" className="text-brand-500 underline hover:text-brand-600">12. Audit and Inspection</a></li>
            <li><a href="#13-liability" className="text-brand-500 underline hover:text-brand-600">13. Liability</a></li>
            <li><a href="#14-term-termination" className="text-brand-500 underline hover:text-brand-600">14. Term and Termination</a></li>
            <li><a href="#15-general" className="text-brand-500 underline hover:text-brand-600">15. General Provisions</a></li>
            <li><a href="#annex-1" className="text-brand-500 underline hover:text-brand-600">Annex 1: Processing Details</a></li>
            <li><a href="#annex-2" className="text-brand-500 underline hover:text-brand-600">Annex 2: Technical and Organizational Measures</a></li>
            <li><a href="#annex-3" className="text-brand-500 underline hover:text-brand-600">Annex 3: Approved Subprocessors</a></li>
          </ol>
        </nav>

        <div className="space-y-8 text-surface-600 dark:text-dark-muted">
          <section id="1-definitions">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">1. Definitions and Interpretation</h2>
            <p className="mt-2">
              In this Addendum, the following terms have the meanings set out below. Capitalized terms not defined herein
              have the meanings given in the GDPR or the Agreement.
            </p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row gap-2 p-3 bg-surface-50 dark:bg-dark-surface rounded">
                <dt className="font-semibold text-surface-900 dark:text-dark-text min-w-[200px]">"Agreement"</dt>
                <dd className="text-surface-600 dark:text-dark-muted">The Terms of Service or any signed enterprise agreement between the parties.</dd>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 p-3 bg-surface-50 dark:bg-dark-surface rounded">
                <dt className="font-semibold text-surface-900 dark:text-dark-text min-w-[200px]">"Controller"</dt>
                <dd className="text-surface-600 dark:text-dark-muted">The customer or entity determining the purposes and means of processing.</dd>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 p-3 bg-surface-50 dark:bg-dark-surface rounded">
                <dt className="font-semibold text-surface-900 dark:text-dark-text min-w-[200px]">"Processor"</dt>
                <dd className="text-surface-600 dark:text-dark-muted">DevStackIO, acting as data processor on behalf of the Controller.</dd>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 p-3 bg-surface-50 dark:bg-dark-surface rounded">
                <dt className="font-semibold text-surface-900 dark:text-dark-text min-w-[200px]">"GDPR"</dt>
                <dd className="text-surface-600 dark:text-dark-muted">Regulation (EU) 2016/679 of the European Parliament and of the Council.</dd>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 p-3 bg-surface-50 dark:bg-dark-surface rounded">
                <dt className="font-semibold text-surface-900 dark:text-dark-text min-w-[200px]">"Personal Data"</dt>
                <dd className="text-surface-600 dark:text-dark-muted">Any information relating to an identified or identifiable natural person.</dd>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 p-3 bg-surface-50 dark:bg-dark-surface rounded">
                <dt className="font-semibold text-surface-900 dark:text-dark-text min-w-[200px]">"Processing"</dt>
                <dd className="text-surface-600 dark:text-dark-muted">Any operation performed on Personal Data as defined in Article 4(2) GDPR.</dd>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 p-3 bg-surface-50 dark:bg-dark-surface rounded">
                <dt className="font-semibold text-surface-900 dark:text-dark-text min-w-[200px]">"Subprocessor"</dt>
                <dd className="text-surface-600 dark:text-dark-muted">Any third party engaged by Processor to process Personal Data on behalf of Controller.</dd>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 p-3 bg-surface-50 dark:bg-dark-surface rounded">
                <dt className="font-semibold text-surface-900 dark:text-dark-text min-w-[200px]">"Supervisory Authority"</dt>
                <dd className="text-surface-600 dark:text-dark-muted">The data protection authority competent under GDPR.</dd>
              </div>
            </dl>
          </section>

          <section id="2-scope">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">2. Scope and Applicability</h2>
            <p className="mt-2">
              This Addendum applies to all Processing of Personal Data by Processor on behalf of Controller in connection with
              the Services provided under the Agreement. It is designed to comply with Article 28(3) GDPR and forms a legally
              binding contract between the parties.
            </p>
            <p className="mt-2">
              In the event of a conflict between this Addendum and the Agreement, this Addendum prevails with respect to
              data protection matters. This Addendum does not apply to Processing where Controller acts as a processor
              for a third party.
            </p>
          </section>

          <section id="3-processing-details">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">3. Processing Details</h2>
            <p className="mt-2">
              The subject matter, nature, purpose, duration, categories of Personal Data, and categories of Data Subjects
              are set out in <a href="#annex-1" className="text-brand-500 underline hover:text-brand-600">Annex 1</a>.
            </p>
            <p className="mt-2">
              Processor shall only Process Personal Data in accordance with Controller's documented instructions, unless
              required by applicable law to which Processor is subject. In such case, Processor shall inform Controller
              of that legal requirement before Processing, unless prohibited by law on important grounds of public interest.
            </p>
          </section>

          <section id="4-controller-obligations">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">4. Controller Obligations</h2>
            <p className="mt-2">Controller represents and warrants that:</p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>It has obtained all necessary consents and legal bases for Processing;</li>
              <li>Its instructions to Processor comply with applicable data protection laws;</li>
              <li>It will not provide Personal Data that it is not authorized to share;</li>
              <li>It will respond promptly to Data Subject requests and cooperate with Processor.</li>
            </ul>
          </section>

          <section id="5-processor-obligations">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">5. Processor Obligations</h2>
            <p className="mt-2">Processor shall:</p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Process Personal Data only on Controller's documented instructions;</li>
              <li>Ensure all personnel authorized to Process Personal Data are subject to confidentiality obligations;</li>
              <li>Implement and maintain the technical and organizational measures set out in <a href="#annex-2" className="text-brand-500 underline hover:text-brand-600">Annex 2</a>;</li>
              <li>Not engage Subprocessors without prior specific or general written authorization (see <a href="#7-subprocessors" className="text-brand-500 underline hover:text-brand-600">Section 7</a>);</li>
              <li>Assist Controller in fulfilling its obligations under Articles 32-36 GDPR;</li>
              <li>Notify Controller promptly if it becomes aware of any instruction that violates GDPR or other data protection laws;</li>
              <li>Ensure that Subprocessors are bound by written agreements with substantially the same data protection obligations;</li>
              <li>Delete or return all Personal Data at Controller's choice upon termination (see <a href="#11-deletion-return" className="text-brand-500 underline hover:text-brand-600">Section 11</a>).</li>
            </ul>
          </section>

          <section id="6-security-measures">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">6. Technical and Organizational Measures</h2>
            <p className="mt-2">
              Processor shall implement and maintain appropriate technical and organizational measures to ensure a level of
              security appropriate to the risk, as detailed in <a href="#annex-2" className="text-brand-500 underline hover:text-brand-600">Annex 2</a>.
              These measures shall ensure the ongoing confidentiality, integrity, availability, and resilience of Processing
              systems and services.
            </p>
            <p className="mt-2">
              Processor shall regularly test, assess, and evaluate the effectiveness of these measures. Processor shall
              promptly inform Controller of any material changes to its security measures that may affect the Processing.
            </p>
          </section>

          <section id="7-subprocessors">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">7. Subprocessors</h2>
            <p className="mt-2">
              Controller provides general written authorization for Processor to engage the Subprocessors listed in
              <a href="#annex-3" className="text-brand-500 underline hover:text-brand-600">Annex 3</a>.
            </p>
            <p className="mt-2">
              Processor shall notify Controller of any intended changes concerning the addition or replacement of Subprocessors
              at least 30 days in advance, providing Controller with the opportunity to object in writing within 14 days.
              Objections must be based on reasonable grounds relating to data protection. If Controller objects, Processor
              shall either not engage the Subprocessor or, if technically feasible, provide an alternative solution.
            </p>
            <p className="mt-2">
              Processor shall ensure that all Subprocessors are bound by written agreements imposing obligations no less
              protective than those in this Addendum. Processor remains fully liable for the acts and omissions of its
              Subprocessors.
            </p>
          </section>

          <section id="8-data-subject-rights">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">8. Data Subject Rights</h2>
            <p className="mt-2">
              Taking into account the nature of Processing, Processor shall assist Controller by appropriate technical and
              organizational measures, insofar as this is possible, for the fulfillment of Controller's obligation to respond
              to requests for exercising Data Subject rights under Articles 15-22 GDPR, including:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Right of access (Article 15)</li>
              <li>Right to rectification (Article 16)</li>
              <li>Right to erasure / "right to be forgotten" (Article 17)</li>
              <li>Right to restriction of processing (Article 18)</li>
              <li>Right to data portability (Article 20)</li>
              <li>Right to object (Article 21)</li>
              <li>Rights related to automated decision-making and profiling (Article 22)</li>
            </ul>
            <p className="mt-2">
              Processor shall notify Controller without undue delay upon receiving any direct request from a Data Subject
              and shall not respond to such request without Controller's prior written authorization, unless legally
              compelled to do so.
            </p>
          </section>

          <section id="9-international-transfers">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">9. International Transfers</h2>
            <p className="mt-2">
              Processor shall not transfer Personal Data outside the European Economic Area (EEA), the UK, or Switzerland
              unless adequate safeguards are in place pursuant to Chapter V GDPR. Any such transfers shall be governed by:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Standard Contractual Clauses (SCCs) approved by the European Commission;</li>
              <li>Adequacy decisions; or</li>
              <li>Binding Corporate Rules (BCRs) or other approved mechanisms.</li>
            </ul>
            <p className="mt-2">
              Processor shall inform Controller of the legal basis for any international transfer and provide a copy of
              the applicable safeguards upon request. Current Subprocessors and their transfer mechanisms are listed in
              <a href="#annex-3" className="text-brand-500 underline hover:text-brand-600">Annex 3</a>.
            </p>
          </section>

          <section id="10-data-breach">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">10. Personal Data Breach Notification</h2>
            <p className="mt-2">
              Processor shall notify Controller without undue delay, and in any event within 24 hours, after becoming
              aware of a Personal Data Breach. The notification shall include:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Nature of the breach, including categories and approximate number of Data Subjects and records affected;</li>
              <li>Name and contact details of the Data Protection Officer or other contact point;</li>
              <li>Likely consequences of the breach;</li>
              <li>Measures taken or proposed to address the breach, including measures to mitigate possible adverse effects.</li>
            </ul>
            <p className="mt-2">
              Processor shall cooperate with Controller in investigating, mitigating, and remediating the breach, and
              shall provide reasonable assistance in Controller's notification to Supervisory Authorities and Data Subjects
              as required under Articles 33-34 GDPR.
            </p>
          </section>

          <section id="11-deletion-return">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">11. Deletion or Return of Personal Data</h2>
            <p className="mt-2">
              Upon termination of the Agreement or at Controller's written request, Processor shall, at Controller's choice:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Delete all Personal Data; or</li>
              <li>Return all Personal Data to Controller in a commonly used, machine-readable format.</li>
            </ul>
            <p className="mt-2">
              Processor shall delete existing copies unless storage is required by applicable law. Processor shall certify
              in writing that it has complied with this obligation within 30 days of termination or request. This
              obligation applies to all Subprocessors as well.
            </p>
          </section>

          <section id="12-audit">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">12. Audit and Inspection</h2>
            <p className="mt-2">
              Processor shall make available to Controller all information necessary to demonstrate compliance with this
              Addendum and allow for and contribute to audits, including inspections, conducted by Controller or its
              mandated auditor.
            </p>
            <p className="mt-2">
              Audits shall be conducted during normal business hours, with reasonable notice (minimum 14 days), and in a
              manner that minimizes disruption to Processor's operations. Controller shall bear the costs of audits unless
              a material non-compliance is discovered, in which case Processor bears the costs.
            </p>
            <p className="mt-2">
              Processor may provide a SOC 2 Type II report or equivalent certification as an alternative to on-site
              audits, provided it covers the relevant Processing activities and controls.
            </p>
          </section>

          <section id="13-liability">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">13. Liability</h2>
            <p className="mt-2">
              Each party's liability for breaches of this Addendum shall be governed by the liability provisions of the
              Agreement, subject to the following:
            </p>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li>Processor's liability for Subprocessor acts/omissions is as if Processor remains fully liable;</li>
              <li>Liability for data protection fines imposed by Supervisory Authorities shall be allocated according to
                  each party's responsibility for the violation;</li>
              <li>Neither party excludes liability for fraud, willful misconduct, or gross negligence.</li>
            </ul>
          </section>

          <section id="14-term-termination">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">14. Term and Termination</h2>
            <p className="mt-2">
              This Addendum takes effect on the Effective Date and continues for the duration of the Agreement.
              Upon termination or expiration of the Agreement, this Addendum remains in effect until all Personal Data
              has been deleted or returned per <a href="#11-deletion-return" className="text-brand-500 underline hover:text-brand-600">Section 11</a>.
            </p>
            <p className="mt-2">
              Either party may terminate this Addendum immediately if the other party commits a material breach of its
              data protection obligations and fails to cure such breach within 30 days of written notice.
            </p>
          </section>

          <section id="15-general">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">15. General Provisions</h2>
            <ul className="mt-2 list-disc pl-6 space-y-2">
              <li><strong>Amendments:</strong> This Addendum may be amended only in writing signed by both parties, or by
                  Processor providing 30 days' written notice of changes that do not materially reduce data protection
                  standards, provided Controller does not object.</li>
              <li><strong>Governing Law:</strong> This Addendum is governed by the laws specified in the Agreement.</li>
              <li><strong>Jurisdiction:</strong> Courts specified in the Agreement have exclusive jurisdiction.</li>
              <li><strong>Severability:</strong> If any provision is held invalid, the remainder continues in force.</li>
              <li><strong>No Third-Party Beneficiaries:</strong> This Addendum does not create rights for any third party
                  except Data Subjects to the extent provided by GDPR.</li>
              <li><strong>Counterparts:</strong> This Addendum may be executed in counterparts, each deemed an original.</li>
            </ul>
          </section>

          <section id="annex-1">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Annex 1: Processing Details</h2>
            <p className="mt-2">Pursuant to <a href="#3-processing-details" className="text-brand-500 underline hover:text-brand-600">Section 3</a>.</p>
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Subject Matter of Processing</h3>
                <p className="mt-1 text-surface-600 dark:text-dark-muted">
                  Provision of browser-based developer tools (formatters, converters, generators, validators, etc.)
                  where Processing occurs client-side in the user's browser. Processor does not access, store, or
                  transmit user data through its servers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Nature of Processing</h3>
                <p className="mt-1 text-surface-600 dark:text-dark-muted">
                  Client-side data transformation, encoding, decoding, formatting, validation, and generation.
                  No server-side Processing of user content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Purpose of Processing</h3>
                <p className="mt-1 text-surface-600 dark:text-dark-muted">
                  To provide the functionality of each developer tool as requested by the user. No analytics,
                  profiling, or secondary Processing of user content.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Duration of Processing</h3>
                <p className="mt-1 text-surface-600 dark:text-dark-muted">
                  Per session (client-side only). No persistent storage by Processor. Duration of the Agreement.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Categories of Personal Data</h3>
                <p className="mt-1 text-surface-600 dark:text-dark-muted">
                  Minimal: IP address (temporarily for security/rate limiting via Cloudflare), browser/device metadata
                  (for optimization), optional analytics data (only with consent). No user content is Processed
                  by Processor's servers.
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Categories of Data Subjects</h3>
                <p className="mt-1 text-surface-600 dark:text-dark-muted">
                  End users of the developer tools (developers, engineers, students, researchers).
                </p>
              </div>
            </div>
          </section>

          <section id="annex-2">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Annex 2: Technical and Organizational Measures</h2>
            <p className="mt-2">Pursuant to <a href="#6-security-measures" className="text-brand-500 underline hover:text-brand-600">Section 6</a> and Article 32 GDPR.</p>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">1. Pseudonymization and Encryption</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm text-surface-600 dark:text-dark-muted">
                  <li>HTTPS/TLS 1.2+ for all traffic (HSTS enabled)</li>
                  <li>No storage of user content on servers</li>
                  <li>Client-side Processing eliminates data-in-transit to Processor</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">2. Confidentiality, Integrity, Availability</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm text-surface-600 dark:text-dark-muted">
                  <li>Content Security Policy (CSP) with strict directives</li>
                  <li>Subresource Integrity (SRI) for third-party resources</li>
                  <li>Referrer-Policy: strict-origin-when-cross-origin</li>
                  <li>Permissions-Policy restricting browser features</li>
                  <li>X-Content-Type-Options: nosniff</li>
                  <li>X-Frame-Options: DENY</li>
                  <li>Cloudflare DDoS protection and WAF</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">3. Resilience and Recovery</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm text-surface-600 dark:text-dark-muted">
                  <li>Static hosting on globally distributed CDN (99.9%+ uptime SLA)</li>
                  <li>Automated deployments with rollback capability</li>
                  <li>Service Worker for offline-capable tool access</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">4. Organizational Measures</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm text-surface-600 dark:text-dark-muted">
                  <li>Data protection by design and by default (client-side architecture)</li>
                  <li>Minimal data collection principle (no server-side user content)</li>
                  <li>No employee access to user content (architecturally impossible)</li>
                  <li>Regular security assessments and dependency scanning</li>
                  <li>Incident response plan with 24-hour notification target</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">5. Testing and Evaluation</h3>
                <ul className="mt-2 list-disc pl-6 space-y-1 text-sm text-surface-600 dark:text-dark-muted">
                  <li>Automated security scanning in CI/CD pipeline</li>
                  <li>Dependabot alerts for vulnerable dependencies</li>
                  <li>Regular penetration testing of infrastructure</li>
                  <li>CSP violation reporting and monitoring</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="annex-3">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Annex 3: Approved Subprocessors</h2>
            <p className="mt-2">Pursuant to <a href="#7-subprocessors" className="text-brand-500 underline hover:text-brand-600">Section 7</a>. Last updated: {lastUpdated}.</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-surface-200 dark:border-dark-border">
                    <th className="py-2 pr-4 text-left font-semibold text-surface-900 dark:text-dark-text">Subprocessor</th>
                    <th className="py-2 pr-4 text-left font-semibold text-surface-900 dark:text-dark-text">Purpose</th>
                    <th className="py-2 pr-4 text-left font-semibold text-surface-900 dark:text-dark-text">Location</th>
                    <th className="py-2 pr-4 text-left font-semibold text-surface-900 dark:text-dark-text">Transfer Mechanism</th>
                    <th className="py-2 text-left font-semibold text-surface-900 dark:text-dark-text">Categories of Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200 dark:divide-dark-border">
                  <tr>
                    <td className="py-2 pr-4 font-mono">Cloudflare, Inc.</td>
                    <td className="py-2 pr-4">CDN, DDoS protection, WAF, DNS, Analytics</td>
                    <td className="py-2 pr-4">Global (US HQ)</td>
                    <td className="py-2 pr-4">SCCs + EU-US Data Privacy Framework</td>
                    <td className="py-2">IP address, request metadata, logs</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">Google LLC (Google Analytics 4)</td>
                    <td className="py-2 pr-4">Anonymous usage analytics (with consent)</td>
                    <td className="py-2 pr-4">Global (US HQ)</td>
                    <td className="py-2 pr-4">SCCs + EU-US Data Privacy Framework</td>
                    <td className="py-2">Pseudonymous identifiers, event data</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">Google LLC (Google AdSense)</td>
                    <td className="py-2 pr-4">Advertising (with consent)</td>
                    <td className="py-2 pr-4">Global (US HQ)</td>
                    <td className="py-2 pr-4">SCCs + EU-US Data Privacy Framework</td>
                    <td className="py-2">Pseudonymous identifiers, browsing context</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono">Vercel Inc. / Hosting Provider</td>
                    <td className="py-2 pr-4">Static hosting, edge functions, analytics</td>
                    <td className="py-2 pr-4">Global (US HQ)</td>
                    <td className="py-2 pr-4">SCCs + EU-US Data Privacy Framework</td>
                    <td className="py-2">Request logs, deployment metadata</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm text-surface-500 dark:text-dark-muted">
              Processor shall notify Controller of any changes to this list per <a href="#7-subprocessors" className="text-brand-500 underline hover:text-brand-600">Section 7</a>.
              Subprocessors are engaged under written agreements containing data protection obligations no less
              protective than this Addendum.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Execution</h2>
          <p className="mt-2 text-surface-600 dark:text-dark-muted">
            This Data Processing Addendum is incorporated into and forms part of the Agreement between the parties.
            By using the Services, Controller acknowledges and accepts this Addendum.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="font-semibold text-surface-900 dark:text-dark-text">DevStackIO (Processor)</p>
              <p className="mt-4 text-surface-600 dark:text-dark-muted">Contact: <a href="mailto:contact@devstackio.com" className="text-brand-500 underline hover:text-brand-600">contact@devstackio.com</a></p>
              <p className="mt-2 text-surface-600 dark:text-dark-muted">Date: {effectiveDate}</p>
            </div>
            <div>
              <p className="font-semibold text-surface-900 dark:text-dark-text">Customer (Controller)</p>
              <p className="mt-4 text-surface-600 dark:text-dark-muted">Accepted via Terms of Service acceptance or signed agreement</p>
              <p className="mt-2 text-surface-600 dark:text-dark-muted">Date: Upon acceptance</p>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
