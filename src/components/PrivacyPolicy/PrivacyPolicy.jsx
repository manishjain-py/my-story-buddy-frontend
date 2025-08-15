import React from 'react';
import './PrivacyPolicy.css';

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy">
      <div className="privacy-container">
        <h1>Privacy Policy for MyStoryBuddy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>
        
        <section>
          <h2>Introduction</h2>
          <p>
            Welcome to MyStoryBuddy ("we," "our," or "us"). We are committed to protecting your privacy 
            and the privacy of children who use our service. This Privacy Policy explains how we collect, 
            use, and protect information when you use our mobile application and website.
          </p>
          <p>
            MyStoryBuddy is designed for children ages 3-4 and complies with the Children's Online Privacy 
            Protection Act (COPPA), General Data Protection Regulation (GDPR), and California Consumer 
            Privacy Act (CCPA).
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          
          <h3>Personal Information</h3>
          <ul>
            <li><strong>Account Information:</strong> When creating an account, we may collect email addresses from parents/guardians for account management and communication purposes.</li>
            <li><strong>Child's Information:</strong> We may collect the child's first name and age to personalize stories, but we do not collect full names, addresses, or other identifying information from children.</li>
          </ul>

          <h3>Usage Information</h3>
          <ul>
            <li><strong>Story Preferences:</strong> We collect information about story topics, characters, and themes selected to improve our AI-generated content.</li>
            <li><strong>App Usage:</strong> We collect anonymous usage statistics such as which features are used most frequently to improve our service.</li>
            <li><strong>Generated Content:</strong> Stories and images generated through our service may be temporarily stored to provide the service functionality.</li>
          </ul>

          <h3>Technical Information</h3>
          <ul>
            <li><strong>Device Information:</strong> We may collect device type, operating system, and app version for technical support and optimization.</li>
            <li><strong>Log Data:</strong> Our servers automatically record information including IP addresses, access times, and pages viewed for security and performance monitoring.</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul>
            <li><strong>Service Provision:</strong> To generate personalized stories and provide core app functionality</li>
            <li><strong>Account Management:</strong> To create and manage user accounts and provide customer support</li>
            <li><strong>Content Improvement:</strong> To improve our AI models and story generation capabilities</li>
            <li><strong>Safety and Security:</strong> To ensure the safety of our platform and prevent misuse</li>
            <li><strong>Communication:</strong> To send important updates about the service (with parental consent where required)</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations</li>
          </ul>
        </section>

        <section>
          <h2>Information Sharing and Disclosure</h2>
          <p><strong>We do not sell, trade, or share personal information with third parties for commercial purposes.</strong></p>
          
          <p>We may share information only in the following limited circumstances:</p>
          <ul>
            <li><strong>Service Providers:</strong> With trusted third-party services (like OpenAI for AI generation and AWS for hosting) under strict privacy agreements</li>
            <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
            <li><strong>Safety:</strong> To protect the safety and security of our users or prevent illegal activities</li>
            <li><strong>Business Transfer:</strong> In the event of a merger or acquisition, with continued privacy protection commitments</li>
          </ul>
        </section>

        <section>
          <h2>COPPA Compliance</h2>
          <p>
            MyStoryBuddy is designed for children under 13 and fully complies with COPPA requirements:
          </p>
          <ul>
            <li>We obtain verifiable parental consent before collecting any personal information from children</li>
            <li>We collect only the minimum information necessary to provide our service</li>
            <li>Parents can review, delete, and refuse further collection of their child's information</li>
            <li>We do not share children's information with third parties except as outlined in this policy</li>
            <li>We do not use behavioral advertising or collect information for advertising purposes</li>
          </ul>
        </section>

        <section>
          <h2>GDPR Compliance</h2>
          <p>For users in the European Union, we provide additional rights under GDPR:</p>
          <ul>
            <li><strong>Right to Access:</strong> You can request information about what personal data we have</li>
            <li><strong>Right to Rectification:</strong> You can request correction of inaccurate data</li>
            <li><strong>Right to Erasure:</strong> You can request deletion of personal data</li>
            <li><strong>Right to Portability:</strong> You can request transfer of your data</li>
            <li><strong>Right to Object:</strong> You can object to certain processing activities</li>
            <li><strong>Right to Restrict:</strong> You can request limitation of processing</li>
          </ul>
        </section>

        <section>
          <h2>CCPA Compliance</h2>
          <p>For California residents, we provide rights under the California Consumer Privacy Act:</p>
          <ul>
            <li>Right to know what personal information is collected and how it's used</li>
            <li>Right to delete personal information</li>
            <li>Right to opt-out of the sale of personal information (we don't sell personal information)</li>
            <li>Right to non-discrimination for exercising privacy rights</li>
          </ul>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security audits and vulnerability assessments</li>
            <li>Limited access to personal information on a need-to-know basis</li>
            <li>Secure hosting infrastructure with AWS</li>
            <li>Regular backup and disaster recovery procedures</li>
          </ul>
        </section>

        <section>
          <h2>Data Retention</h2>
          <p>
            We retain personal information only as long as necessary to provide our service and comply with legal obligations:
          </p>
          <ul>
            <li><strong>Account Information:</strong> Retained until account deletion is requested</li>
            <li><strong>Generated Stories:</strong> May be cached temporarily for performance but are not permanently stored</li>
            <li><strong>Usage Analytics:</strong> Anonymized data may be retained for service improvement</li>
            <li><strong>Legal Requirements:</strong> Some data may be retained longer if required by law</li>
          </ul>
        </section>

        <section>
          <h2>Parental Rights and Controls</h2>
          <p>Parents and guardians have the following rights and controls:</p>
          <ul>
            <li>Review any personal information collected from their child</li>
            <li>Request deletion of their child's personal information</li>
            <li>Refuse to allow further collection of their child's information</li>
            <li>Contact us with questions or concerns about privacy practices</li>
          </ul>
        </section>

        <section>
          <h2>Third-Party Services</h2>
          <p>MyStoryBuddy uses the following third-party services:</p>
          <ul>
            <li><strong>OpenAI:</strong> For AI-powered story and image generation</li>
            <li><strong>Amazon Web Services (AWS):</strong> For hosting and data storage</li>
            <li><strong>CloudFront:</strong> For content delivery and performance optimization</li>
          </ul>
          <p>
            These services are bound by strict privacy agreements and are used only to provide core functionality.
          </p>
        </section>

        <section>
          <h2>International Data Transfers</h2>
          <p>
            Your information may be processed and stored in countries other than your own. We ensure 
            appropriate safeguards are in place for such transfers, including:
          </p>
          <ul>
            <li>Standard contractual clauses approved by regulatory authorities</li>
            <li>Privacy Shield frameworks where applicable</li>
            <li>Adequacy decisions by competent authorities</li>
          </ul>
        </section>

        <section>
          <h2>Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify users of any material 
            changes by:
          </p>
          <ul>
            <li>Posting the updated policy on our website</li>
            <li>Sending email notifications to registered users</li>
            <li>Providing in-app notifications</li>
          </ul>
          <p>
            Continued use of MyStoryBuddy after changes constitute acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>Contact Information</h2>
          <p>
            If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, 
            please contact us:
          </p>
          <div className="contact-info">
            <p><strong>Email:</strong> preethi@simplifyloop.com</p>
            <p><strong>Website:</strong> https://www.mystorybuddy.com</p>
            <p><strong>WhatsApp:</strong> +91 9704983498</p>
            <p><strong>Mailing Address:</strong></p>
            <p>
              Simplify Loop<br/>
              MyStoryBuddy Privacy Team<br/>
              Jains Ravi Gayathri Heights<br/>
              Jubilee Enclave, HITEC City<br/>
              Hyderabad, Telangana, India
            </p>
          </div>
          <p>
            We will respond to privacy-related inquiries within 30 days or as required by applicable law.
          </p>
        </section>

        <section>
          <h2>Effective Date</h2>
          <p>
            This Privacy Policy is effective as of {new Date().toLocaleDateString()} and applies to all 
            information collected by MyStoryBuddy from that date forward.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;