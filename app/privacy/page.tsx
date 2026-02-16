import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="mb-4 text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                <p className="mb-2">
                    Welcome to WorkforceOne ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the "Service").
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                <p className="mb-2">We verify and collect the following types of information:</p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                    <li><strong>Personal Information:</strong> Name, email address, phone number, and organization details provided during registration.</li>
                    <li><strong>Operational Data:</strong> Form submissions, location data (if enabled for specific features), time logs, and task status updates generated while using the app.</li>
                    <li><strong>Device Information:</strong> Device type, operating system, and unique device identifiers necessary for app functionality and security.</li>
                    <li><strong>Media:</strong> Photos or images uploaded as part of form submissions or profile settings.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                <p className="mb-2">We use the collected information for the following purposes:</p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                    <li>To provide, operate, and maintain the WorkforceOne Service.</li>
                    <li>To manage user accounts and authentication.</li>
                    <li>To process form submissions and operational workflows.</li>
                    <li>To improve, personalize, and expand our Service.</li>
                    <li>To communicate with you regarding updates, security alerts, and support.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">4. Data Storage and Security</h2>
                <p className="mb-2">
                    We implement appropriate technical and organizational security measures to protect your data. Your information is stored on secure servers (via Supabase) and is accessible only to authorized personnel and your organization's administrators.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
                <p className="mb-2">
                    We do not sell your personal data. We may share your information only in the following circumstances:
                </p>
                <ul className="list-disc pl-6 mb-2 space-y-1">
                    <li><strong>With Your Organization:</strong> Administrators of your WorkforceOne workspace have access to data submitted within their organization's scope.</li>
                    <li><strong>Service Providers:</strong> Third-party vendors who assist us in operating the Service (e.g., cloud hosting, analytics).</li>
                    <li><strong>Legal Requirements:</strong> If required by law or in response to valid requests by public authorities.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">6. Your Rights</h2>
                <p className="mb-2">
                    Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete your data. To exercise these rights, please contact your organization's administrator or reach out to us directly.
                </p>
            </section>

            <section className="mb-6">
                <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
                <p className="mb-2">
                    If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="font-medium">support@workforceone.com</p>
            </section>
        </div>
    );
}
