import React from 'react';
import styles from './Settings.module.css';

export default function Settings() {
  return (
    <div className={styles.settingsPage}>
      <h2 className={styles.title}>Configuración</h2>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Perfil de la Empresa</h3>
        <input className={styles.input} placeholder="Nombre de la Empresa" />
        <input className={styles.input} placeholder="Industria" />
        <input className={styles.input} placeholder="Correo de Contacto" />
        <button className={styles.saveBtn}>Guardar Perfil</button>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Notificaciones</h3>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" className={styles.checkbox} defaultChecked />
          Enviarme correos sobre nuevos candidatos
        </label>
        <label className={styles.checkboxLabel}>
          <input type="checkbox" className={styles.checkbox} />
          Enviar resumen semanal de análisis
        </label>
        <button className={styles.saveBtn}>Guardar Notificaciones</button>
      </div>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Gestión de Cuenta</h3>
        <button className={styles.saveBtn}>Cambiar Contraseña</button>
        <button className={styles.deleteBtn}>Eliminar Cuenta</button>
      </div>
    </div>
  );
} 