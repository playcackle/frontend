import { Key, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import styles from "./auth-buttons.module.css";

export function AuthButtons() {
  return (
    <div className={styles.authButtonsContainer}>
      <div className={styles.authMessage}>
        <h2 className={styles.authTitle}>Join the Cackle Quiz Revolution!!</h2>
        <p className={styles.authDescription}>
          Join the greatness or get back to access
        </p>
      </div>

      <div className={styles.buttonsContainer}>
        <Link to="/login" className={styles.loginButton}>
          <div className={styles.buttonContent}>
            <span className={styles.buttonIcon}><Key size={16} /></span>
            <div className={styles.buttonTextContainer}>
              <span className={styles.buttonTitle}>BACK FOR MORE</span>
              <span className={styles.buttonSubtitle}>Couldnt get enough!</span>
            </div>
          </div>
        </Link>
        <Link to="/register" className={styles.signupButton}>
          <div className={styles.buttonContent}>
            <span className={styles.buttonIcon}><Sparkles size={16} /></span>
            <div className={styles.buttonTextContainer}>
              <span className={styles.buttonTitle}>JOIN THE GREATNESS</span>
              <span className={styles.buttonSubtitle}>
                Create a new account
              </span>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
