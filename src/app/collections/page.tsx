"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

type Round = {
  id: string;
  name: string;
};

type CollectionRound = {
  roundId: string;
  order: number;
};

type Collection = {
  id: string;
  name: string;
  rounds: CollectionRound[];
};

export default function CollectionsPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([
    {
      id: "1",
      name: "80s Pop Culture",
      rounds: [
        { roundId: "r1", order: 1 },
        { roundId: "r2", order: 2 },
      ],
    },
  ]);

  const handleCreateNew = () => {
    router.push("/collections/new");
  };

  const handleEdit = (id: string) => {
    router.push(`/collections/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this collection?")) {
      setCollections(collections.filter((c) => c.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.neonText}>COLLECTION</span>
          <span className={styles.neonTextPink}>MANAGER</span>
        </h1>

        <div className={styles.content}>
          <button className={styles.createButton} onClick={handleCreateNew}>
            + CREATE NEW COLLECTION
          </button>

          <div className={styles.collectionsList}>
            {collections.map((collection) => (
              <div key={collection.id} className={styles.collectionCard}>
                <div className={styles.collectionHeader}>
                  <h3 className={styles.collectionName}>{collection.name}</h3>
                  <div className={styles.collectionActions}>
                    <button
                      className={styles.editButton}
                      onClick={() => handleEdit(collection.id)}
                    >
                      EDIT
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDelete(collection.id)}
                    >
                      DELETE
                    </button>
                  </div>
                </div>
                <p className={styles.roundCount}>
                  {collection.rounds.length} rounds
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
