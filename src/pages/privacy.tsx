import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div
      style={{
        padding: '3rem 1rem',
        maxWidth: '800px',
        margin: 'auto',
        fontFamily: 'sans-serif',
        lineHeight: '1.6',
        color: '#333',
      }}
    >
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Privacy Policy</h1>

      <p>
        <strong>Bloom Calendar App</strong> respects your privacy and is committed to protecting your personal data.
        We only request access to your Google Calendar to:
      </p>

      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        <li>Read events that contain menstrual-related keywords like <em>"period"</em>, <em>"cycle"</em>, or <em>"PMS"</em></li>
        <li>Automatically track your cycle and help generate health insights</li>
      </ul>

      <p style={{ marginTop: '1.5rem' }}><strong>We do NOT:</strong></p>

      <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
        <li>Store or share your data with third parties</li>
        <li>Request calendar write permissions</li>
        <li>Access or store any unrelated calendar event data</li>
      </ul>

      <p>
        All data is processed securely and temporarily for the purpose of generating insights. 
        You may revoke access at any time from your Google account settings.
      </p>

      <p style={{ marginTop: '1.5rem' }}>
        If you have any questions or concerns, please contact us at{' '}
        <a href="mailto:maaz@remap.ai" style={{ color: '#0070f3', textDecoration: 'underline' }}>
          maaz@remap.ai
        </a>.
      </p>
    </div>
  );
}
