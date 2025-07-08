import React from 'react';
import styles from './Settings.module.css';

export default function Settings() {
  return (
    <div className={styles.settingsPage}>
      <h2 className={styles.title}>Settings</h2>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Company Profile</h3>
        <input className={styles.input} placeholder="Company Name" />
        <input className={styles.input} placeholder="Industry" />
        <input className={styles.input} placeholder="Contact Email" />
        <button className={styles.saveBtn}>Save Profile</button>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Notifications</h3>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" className={styles.checkbox} defaultChecked />
          Email me about new candidates
        </label>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" className={styles.checkbox} />
          Send weekly analytics summary
        </label>
        <button className={styles.saveBtn}>Save Notifications</button>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Account Management</h3>
        <button className={styles.saveBtn}>Change Password</button>
        <button className={styles.deleteBtn}>Delete Account</button>
      </div>
    </div>
  );
} 