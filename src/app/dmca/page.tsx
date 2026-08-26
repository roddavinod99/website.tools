/* eslint-disable react/no-unescaped-entities */
import type { Metadata } from "next";
import { siteConfig } from "@/lib/data";

export const metadata: Metadata = {
  title: "DMCA / Copyright Policy",
  description: "DevStackIO DMCA Copyright Policy. Procedure for reporting copyright infringement and submitting counter-notifications under 17 U.S.C. § 512.",
  alternates: { canonical: `${siteConfig.url}/dmca` },
  openGraph: {
    title: "DMCA / Copyright Policy | DevStackIO",
    description: "Procedure for reporting copyright infringement under DMCA 17 U.S.C. § 512 on DevStackIO.",
    url: `${siteConfig.url}/dmca`,
    siteName: "DevStackIO Tools",
    type: "website",
    images: [{ url: siteConfig.ogImage, width: 1200, height: 630, alt: "DevStackIO DMCA Policy" }],
  },
};

export default function DMCAPage() {
  const lastUpdated = siteConfig.legal?.lastUpdated?.dmca || "2026-07-20";
  const effectiveDate = "2026-07-20";

  return (
    <div className="container py-12 md:py-16">
      <article className="mx-auto max-w-3xl">
        <div className="mb-8">
          <p className="text-sm text-surface-500 dark:text-dark-muted">
            Last updated: {lastUpdated} | Effective: {effectiveDate}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-surface-900 dark:text-dark-text sm:text-4xl">
            DMCA / Copyright Policy
          </h1>
          <p className="mt-2 text-lg text-surface-600 dark:text-dark-muted">
            Procedure for reporting copyright infringement under the Digital Millennium Copyright Act (DMCA),
            17 U.S.C. § 512, and international copyright law.
          </p>
        </div>

        <div className="mb-8 p-4 rounded-lg bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800">
          <p className="text-sm text-brand-700 dark:text-brand-300">
            <strong>Summary:</strong> DevStackIO respects intellectual property rights. If you believe your copyrighted
            work has been infringed on our platform, submit a DMCA notice to{" "}
            <a href="mailto:contact@devstackio.com" className="underline hover:text-brand-600">contact@devstackio.com</a>.
            We process valid notices promptly and provide a counter-notification procedure.
          </p>
        </div>

        <nav className="mb-8 p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
          <h2 className="text-sm font-semibold text-surface-900 dark:text-dark-text mb-3">Table of Contents</h2>
          <ol className="list-decimal pl-6 space-y-1 text-sm text-surface-600 dark:text-dark-muted">
            <li><a href="#1-dmca-designated-agent" className="text-brand-500 underline hover:text-brand-600">1. DMCA Designated Agent</a></li>
            <li><a href="#2-submitting-a-dmca-notice" className="text-brand-500 underline hover:text-brand-600">2. Submitting a DMCA Take-Down Notice</a></li>
            <li><a href="#3-required-notice-elements" className="text-brand-500 underline hover:text-brand-600">3. Required Notice Elements (17 U.S.C. § 512(c)(3))</a></li>
            <li><a href="#4-our-response-process" className="text-brand-500 underline hover:text-brand-600">4. Our Response Process</a></li>
            <li><a href="#5-counter-notification-procedure" className="text-brand-500 underline hover:text-brand-600">5. Counter-Notification Procedure (17 U.S.C. § 512(g))</a></li>
            <li><a href="#6-repeat-infringers" className="text-brand-500 underline hover:text-brand-600">6. Repeat Infringers</a></li>
            <li><a href="#7-fair-use-consideration" className="text-brand-500 underline hover:text-brand-600">7. Fair Use Consideration</a></li>
            <li><a href="#8-international-copyright" className="text-brand-500 underline hover:text-brand-600">8. International Copyright Compliance</a></li>
            <li><a href="#9-misrepresentation-liability" className="text-brand-500 underline hover:text-brand-600">9. Misrepresentation Liability (17 U.S.C. § 512(f))</a></li>
            <li><a href="#10-changes" className="text-brand-500 underline hover:text-brand-600">10. Changes to This Policy</a></li>
          </ol>
        </nav>

        <div className="space-y-8 text-surface-600 dark:text-dark-muted">
          <section id="1-dmca-designated-agent">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">1. DMCA Designated Agent</h2>
            <p className="mt-2">
              In compliance with 17 U.S.C. § 512(c)(2), DevStackIO has designated the following agent to receive
              notifications of claimed copyright infringement:
            </p>
            <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border space-y-1">
              <p><strong>Name:</strong> DevStackIO Copyright Agent</p>
              <p><strong>Email:</strong> <a href="mailto:contact@devstackio.com" className="text-brand-500 underline hover:text-brand-600">contact@devstackio.com</a></p>
              <p><strong>Mailing Address:</strong> DevStackIO Copyright Agent, 123 Developer Way, San Francisco, CA 94102, USA</p>
              <p><strong>Abuse Email:</strong> <a href="mailto:contact@devstackio.com" className="text-brand-500 underline hover:text-brand-600">contact@devstackio.com</a></p>
            </div>
            <p className="mt-4 text-sm text-surface-500 dark:text-dark-muted">
              Include "DMCA Notice" in the subject line for fastest processing. We do not accept notices via phone, fax,
              or social media.
            </p>
          </section>

          <section id="2-submitting-a-dmca-notice">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">2. Submitting a DMCA Take-Down Notice</h2>
            <p className="mt-2">
              If you believe that content on DevStackIO infringes your copyright, submit a written notification to our
              Designated Agent. The notice must comply with 17 U.S.C. § 512(c)(3) (see <a href="#3-required-notice-elements" className="text-brand-500 underline hover:text-brand-600">Section 3</a>).
            </p>
            <div className="mt-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">Before Submitting, Consider:</h3>
              <ul className="list-disc pl-6 space-y-1 text-sm">
                <li>Is the use potentially fair use? (See <a href="#7-fair-use-consideration" className="text-brand-500 underline hover:text-brand-600">Section 7</a>)</li>
                <li>Are you the copyright owner or authorized agent?</li>
                <li>Is the material actually on DevStackIO? (Our tools process data client-side; we don't host user content)</li>
                <li>Have you tried contacting the user directly?</li>
              </ul>
            </div>
          </section>

          <section id="3-required-notice-elements">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">3. Required Notice Elements (17 U.S.C. § 512(c)(3))</h2>
            <p className="mt-2">
              Your written notification must include substantially the following:
            </p>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text mb-2">Required Elements</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li><strong>Physical or electronic signature</strong> of the copyright owner or authorized agent.</li>
                  <li><strong>Identification of the copyrighted work</strong> claimed to be infringed (or a representative list if multiple works).</li>
                  <li><strong>Identification of the infringing material</strong> and information reasonably sufficient to locate it on DevStackIO (URLs, tool names, specific content).</li>
                  <li><strong>Your contact information</strong>: name, physical address, telephone number, and email address.</li>
                  <li><strong>Good faith belief statement</strong>: "I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law."</li>
                  <li><strong>Accuracy statement under penalty of perjury</strong>: "The information in this notification is accurate, and under penalty of perjury, I am the copyright owner or authorized to act on behalf of the owner."</li>
                </ol>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text mb-2">Template</h3>
                <pre className="bg-surface-50 dark:bg-dark-bg p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap text-surface-600 dark:text-dark-muted"><code>To: DevStackIO Copyright Agent
Email: contact@devstackio.com
Subject: DMCA Notice - [Your Name/Company]

1. Signature: [Your electronic or physical signature]

2. Copyrighted Work: [Title, description, registration number if applicable]

3. Infringing Material:
   - URL(s): [Exact URLs on devstackio.com]
   - Tool/Page: [Specific tool or page name]
   - Description: [What specifically infringes]

4. Contact Information:
   Name: [Full legal name]
   Address: [Physical address]
   Phone: [Phone number]
   Email: [Email address]

5. Good Faith Belief: I have a good faith belief that the use of the material
   described above is not authorized by the copyright owner, its agent, or the law.

6. Accuracy: The information in this notification is accurate, and under penalty
   of perjury, I am the copyright owner or authorized to act on behalf of the
   owner of the exclusive right that is allegedly infringed.

Signed: [Your Name]
Date: [Date]</code></pre>
              </div>
            </div>
          </section>

          <section id="4-our-response-process">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">4. Our Response Process</h2>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text mb-2">Timeline</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Acknowledgment:</strong> Within 1 business day of receipt</li>
                  <li><strong>Review:</strong> Within 3-5 business days (expedited for clear cases)</li>
                  <li><strong>Action:</strong> Removal or disablement within 24 hours of validation</li>
                  <li><strong>Notification to user:</strong> Within 24 hours of action</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text mb-2">What We Review</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Completeness of notice (all § 512(c)(3) elements)</li>
                  <li>Validity of copyright claim (registration not required but helpful)</li>
                  <li>Location accuracy (can we find the material?)</li>
                  <li>Fair use assessment (good faith evaluation)</li>
                  <li>Whether material is actually on our platform (client-side tools may not host content)</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">Important: Our Architecture</h3>
                <p className="text-sm text-red-600 dark:text-red-400">
                  DevStackIO tools process data entirely in the user's browser. We do not host, store, or transmit
                  user content through our servers. If the "infringing material" is user data processed client-side,
                  we may not be able to remove it from our servers (it was never there). We will, however, disable
                  access to the specific tool or configuration if applicable, and notify the user.
                </p>
              </div>

              <h3 className="font-semibold text-surface-900 dark:text-dark-text">Actions We May Take</h3>
              <ul className="mt-2 list-disc pl-6 space-y-2">
                <li>Disable access to specific tool configurations or preset data</li>
                <li>Remove documentation, examples, or blog content containing infringing material</li>
                <li>Disable tool features that facilitate the infringement</li>
                <li>Notify the user who posted/used the material</li>
                <li>Terminate repeat infringer accounts (see <a href="#6-repeat-infringers" className="text-brand-500 underline hover:text-brand-600">Section 6</a>)</li>
              </ul>
            </div>
          </section>

          <section id="5-counter-notification-procedure">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">5. Counter-Notification Procedure (17 U.S.C. § 512(g))</h2>
            <p className="mt-2">
              If you believe material was removed or disabled by mistake or misidentification, you may submit a
              counter-notification under 17 U.S.C. § 512(g).
            </p>

            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text mb-2">Required Elements (§ 512(g)(3))</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Physical or electronic signature of the subscriber.</li>
                  <li>Identification of the material removed and its location before removal.</li>
                  <li>Statement under penalty of perjury: "I have a good faith belief that the material was removed or disabled as a result of mistake or misidentification."</li>
                  <li>Your name, address, telephone number, and email.</li>
                  <li>Statement consenting to jurisdiction of Federal District Court for your district (or San Francisco if outside US).</li>
                  <li>Statement accepting service of process from the original complainant.</li>
                </ol>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text mb-2">Counter-Notification Template</h3>
                <pre className="bg-surface-50 dark:bg-dark-bg p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap text-surface-600 dark:text-dark-muted"><code>To: DevStackIO Copyright Agent
Email: contact@devstackio.com
Subject: Counter-Notification - [Case Reference if known]

1. Signature: [Your electronic or physical signature]

2. Removed Material: [Description and URL/location before removal]

3. Good Faith Belief: I have a good faith belief that the material was
   removed or disabled as a result of mistake or misidentification.

4. Contact Information:
   Name: [Full legal name]
   Address: [Physical address]
   Phone: [Phone number]
   Email: [Email address]

5. Jurisdiction Consent: I consent to the jurisdiction of the Federal
   District Court for the judicial district in which my address is located
   (or San Francisco, CA if outside the United States).

6. Service of Process: I will accept service of process from the person
   who provided the original DMCA notification or their agent.

Signed: [Your Name]
Date: [Date]</code></pre>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">What Happens Next</h3>
                <ol className="list-decimal pl-6 space-y-2 text-sm">
                  <li>We forward your counter-notification to the original complainant within 1 business day.</li>
                  <li>The complainant has 10-14 business days to file a lawsuit seeking a court order.</li>
                  <li>If no lawsuit is filed, we restore the material within 10-14 business days.</li>
                  <li>We notify you of the outcome.</li>
                </ol>
              </div>
            </div>
          </section>

          <section id="6-repeat-infringers">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">6. Repeat Infringers</h2>
            <p className="mt-2">
              In accordance with 17 U.S.C. § 512(i), DevStackIO maintains a policy for terminating accounts of
              repeat infringers in appropriate circumstances.
            </p>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text mb-2">Policy</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We track valid DMCA notices per user/account.</li>
                  <li>Three (3) valid, uncontested DMCA notices within 24 months = presumptive repeat infringer.</li>
                  <li>Account may be suspended or terminated at our discretion.</li>
                  <li>We consider context: fair use, good faith, volume, and severity.</li>
                  <li>Users may appeal termination by contacting <a href="mailto:contact@devstackio.com" className="text-brand-500 underline hover:text-brand-600">contact@devstackio.com</a>.</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text mb-2">Appeal Process</h3>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Submit written appeal to <a href="mailto:contact@devstackio.com" className="text-brand-500 underline hover:text-brand-600">contact@devstackio.com</a> within 30 days.</li>
                  <li>Include: account details, notice references, explanation of why termination is unwarranted.</li>
                  <li>We review within 10 business days and respond in writing.</li>
                  <li>Decision is final unless new evidence emerges.</li>
                </ol>
              </div>
            </div>
          </section>

          <section id="7-fair-use-consideration">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">7. Fair Use Consideration</h2>
            <p className="mt-2">
              We recognize the importance of fair use (17 U.S.C. § 107) and similar exceptions in international law.
              Before acting on a DMCA notice, we consider whether the use may qualify as fair use, including:
            </p>
            <div className="mt-4 space-y-4">
              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Four Factors (17 U.S.C. § 107)</h3>
                <ol className="mt-2 list-decimal pl-6 space-y-2">
                  <li><strong>Purpose and character:</strong> Educational, transformative, non-commercial, research, criticism, commentary, news reporting.</li>
                  <li><strong>Nature of the work:</strong> Factual vs. creative; published vs. unpublished.</li>
                  <li><strong>Amount and substantiality:</strong> Quantity and qualitative importance of portion used.</li>
                  <li><strong>Market effect:</strong> Impact on potential market for or value of the original.</li>
                </ol>
              </div>

              <div className="p-4 rounded-lg bg-white dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
                <h3 className="font-semibold text-surface-900 dark:text-dark-text">Common Fair Use Scenarios on DevStackIO</h3>
                <ul className="mt-2 list-disc pl-6 space-y-2">
                  <li>Code snippets in documentation, tutorials, or blog posts for educational purposes</li>
                  <li>Configuration examples demonstrating tool usage</li>
                  <li>Error messages, stack traces, or log excerpts for debugging help</li>
                  <li>Standard library function signatures, API definitions, or schema examples</li>
                  <li>Minimal reproduction cases for bug reports</li>
                  <li>Transformative use: code analysis, comparison, or format conversion</li>
                </ul>
              </div>

              <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                <h3 className="font-semibold text-amber-700 dark:text-amber-300 mb-2">Good Faith Evaluation</h3>
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  We evaluate fair use in good faith before acting on notices. However, fair use is a legal defense
                  determined by courts. Our evaluation does not guarantee protection. If in doubt, we may err on the
                  side of the copyright holder but will document our reasoning.
                </p>
              </div>
            </div>
          </section>

          <section id="8-international-copyright">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">8. International Copyright Compliance</h2>
            <p className="mt-2">
              DevStackIO operates globally and complies with applicable international copyright laws and treaties:
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li><strong>Berne Convention:</strong> Automatic protection without formalities; national treatment.</li>
              <li><strong>WIPO Copyright Treaty (WCT):</strong> Digital rights, anti-circumvention provisions.</li>
              <li><strong>EU Directive 2001/29/EC (InfoSoc):</strong> Harmonized exceptions; notice-and-takedown frameworks.</li>
              <li><strong>EU Directive 2019/790 (DSM):</strong> Article 17 obligations for online content-sharing services.</li>
              <li><strong>UK CDPA 1988:</strong> Post-Brexit retained EU law framework.</li>
              <li><strong>Canadian Copyright Act:</strong> Notice-and-notice regime (we honor both).</li>
              <li><strong>Australian Copyright Act 1968:</strong> Safe harbor provisions for carriage service providers.</li>
              <li><strong>Other jurisdictions:</strong> We apply the higher standard of protection where conflicts arise.</li>
            </ul>
            <p className="mt-4">
              For non-U.S. notices, we apply the same procedural standards. Contact
              <a href="mailto:contact@devstackio.com" className="text-brand-500 underline hover:text-brand-600">contact@devstackio.com</a>
              for jurisdiction-specific guidance.
            </p>
          </section>

          <section id="9-misrepresentation-liability">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">9. Misrepresentation Liability (17 U.S.C. § 512(f))</h2>
            <p className="mt-2">
              Under 17 U.S.C. § 512(f), any person who knowingly materially misrepresents that material or activity
              is infringing, or was removed by mistake, may be liable for:
            </p>
            <ul className="mt-4 list-disc pl-6 space-y-2">
              <li>Actual damages incurred by the affected party</li>
              <li>Costs and attorneys' fees incurred in defending against the notice</li>
              <li>Costs and attorneys' fees incurred in pursuing the misrepresentation claim</li>
            </ul>
            <p className="mt-4">
              We reserve the right to seek damages, injunctive relief, and attorneys' fees against any party who
              knowingly submits fraudulent, abusive, or bad-faith DMCA notices or counter-notifications. We may also
              report patterns of abuse to relevant authorities and platforms.
            </p>
          </section>

          <section id="10-changes">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">10. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Copyright Policy from time to time to reflect legal developments, platform changes,
              or operational improvements. Changes will be posted on this page with an updated "Last updated" date.
              Material changes will be announced via website notice or email to registered users.
            </p>
            <p className="mt-4">
              Your continued use of DevStackIO after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-surface-900 dark:text-dark-text">Contact</h2>
            <div className="mt-4 p-4 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border space-y-2">
              <p><strong>Copyright Agent:</strong> <a href="mailto:contact@devstackio.com" className="text-brand-500 underline hover:text-brand-600">contact@devstackio.com</a></p>
              <p><strong>Abuse/Security:</strong> <a href="mailto:contact@devstackio.com" className="text-brand-500 underline hover:text-brand-600">contact@devstackio.com</a></p>
              <p><strong>Legal:</strong> <a href="mailto:contact@devstackio.com" className="text-brand-500 underline hover:text-brand-600">contact@devstackio.com</a></p>
              <p><strong>Appeals:</strong> <a href="mailto:contact@devstackio.com" className="text-brand-500 underline hover:text-brand-600">contact@devstackio.com</a></p>
              <p className="pt-2"><strong>Mail:</strong> DevStackIO Copyright Agent, 123 Developer Way, San Francisco, CA 94102, USA</p>
            </div>
            <p className="mt-4 text-sm text-surface-500 dark:text-dark-muted">
              Include "DMCA Notice", "Counter-Notification", or "Copyright Inquiry" in the subject line for fastest
              processing. We do not accept notices via phone, fax, or social media.
            </p>
          </section>
        </div>

        <div className="mt-12 p-6 rounded-lg bg-surface-50 dark:bg-dark-surface border border-surface-200 dark:border-dark-border">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-dark-text">Related Documents</h2>
          <ul className="mt-3 list-disc pl-6 space-y-2 text-sm text-surface-600 dark:text-dark-muted">
            <li><a href="/terms" className="text-brand-500 underline hover:text-brand-600">Terms of Service</a></li>
            <li><a href="/privacy" className="text-brand-500 underline hover:text-brand-600">Privacy Policy</a></li>
            <li><a href="/acceptable-use" className="text-brand-500 underline hover:text-brand-600">Acceptable Use Policy</a></li>
            <li><a href="/dpa" className="text-brand-500 underline hover:text-brand-600">Data Processing Addendum (DPA)</a></li>
            <li><a href="/cookie-policy" className="text-brand-500 underline hover:text-brand-600">Cookie Policy</a></li>
            <li><a href="/disclaimer" className="text-brand-500 underline hover:text-brand-600">Disclaimer</a></li>
          </ul>
        </div>
      </article>
    </div>
  );
}
