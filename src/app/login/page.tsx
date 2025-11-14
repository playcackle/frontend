"use client";

import { Box, Button, Flex } from "@radix-ui/themes";
import { AtSign, Lock } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";
import styles from "../login/auth.module.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const ref = useRef<HTMLFormElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const res = await signIn("credentials", {
      name: formData.get("name"),
      password: formData.get("password"),
      redirect: false,
    });
    if (res?.error) {
      setError(res.error as string);
    }
    if (res?.ok) {
      return router.push("/");
    }
  };

  return (
    <Flex align="center" direction="column">
      <form ref={ref} onSubmit={handleSubmit} className={styles.formContainer}>
        <h1 className={styles.title}>
          <span className={styles.neonText}>Back for more?</span>
          <span className={styles.neonTextPink}>Didn’t expect that.</span>
        </h1>

        <Box className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="name" className={styles.label}>
              Name
            </label>
            <div className={styles.inputWrapper}>
              <AtSign className={styles.inputIcon} size={18} />
              <input
                id="name"
                type="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
                placeholder="Type your name. Try not to mess it up."
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} size={18} />
              <input
                id="password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                placeholder="Your super-secret password… that you always forget."
                required
              />
            </div>
          </div>

          <Button type="submit" className={styles.submitButton}>
            Fine, let’s go
          </Button>
        </Box>
      </form>
    </Flex>
  );
}
