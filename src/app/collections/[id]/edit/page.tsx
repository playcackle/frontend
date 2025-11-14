"use client";
import * as Form from "@radix-ui/react-form";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Round = {
  id: string;
  name: string;
  slots: { id: string; answer: string }[];
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

// Mock available rounds
const availableRounds: Round[] = [
  {
    id: "r1",
    name: "80s Movies",
    slots: [{ id: "s1", answer: "Back to the Future" }],
  },
  {
    id: "r2",
    name: "80s Music",
    slots: [{ id: "s2", answer: "Michael Jackson" }],
  },
  {
    id: "r3",
    name: "80s TV Shows",
    slots: [{ id: "s3", answer: "Miami Vice" }],
  },
  {
    id: "r4",
    name: "80s Video Games",
    slots: [{ id: "s4", answer: "Pac-Man" }],
  },
  {
    id: "r5",
    name: "80s Technology",
    slots: [{ id: "s5", answer: "Walkman" }],
  },
];

export default function EditCollectionPage() {
  const router = useRouter();
  const params = useParams();
  const [collection, setCollection] = useState<Collection>({
    id: params.id as string,
    name: "",
    rounds: [],
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    // Load existing collection data
    const existingCollection = {
      id: params.id as string,
      name: "80s Pop Culture",
      rounds: [
        { roundId: "r1", order: 1 },
        { roundId: "r2", order: 2 },
      ],
    };
    setCollection(existingCollection);
  }, [params.id]);

  const handleSave = () => {
    console.log("[v0] Saving collection:", collection);
    router.push("/collections");
  };

  const handleCancel = () => {
    router.push("/collections");
  };

  const addRound = (roundId: string) => {
    if (collection.rounds.find((r) => r.roundId === roundId)) {
      alert("Round already added to collection");
      return;
    }

    const newOrder = collection.rounds.length + 1;
    setCollection({
      ...collection,
      rounds: [...collection.rounds, { roundId, order: newOrder }],
    });
  };

  const removeRound = (roundId: string) => {
    const updatedRounds = collection.rounds
      .filter((r) => r.roundId !== roundId)
      .map((r, index) => ({ ...r, order: index + 1 }));
    setCollection({ ...collection, rounds: updatedRounds });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedRounds = [...collection.rounds];
    const draggedItem = updatedRounds[draggedIndex];
    updatedRounds.splice(draggedIndex, 1);
    updatedRounds.splice(index, 0, draggedItem);

    const reorderedRounds = updatedRounds.map((r, idx) => ({
      ...r,
      order: idx + 1,
    }));
    setCollection({ ...collection, rounds: reorderedRounds });
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggedIndex(null);
  };

  const getRoundById = (id: string) => availableRounds.find((r) => r.id === id);

  const filteredRounds = availableRounds.filter((round) =>
    round.name.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>
          <span className={styles.neonText}>EDIT</span>
          <span className={styles.neonTextPink}>COLLECTION</span>
        </h1>

        <div className={styles.content}>
          <Form.Root className={styles.form}>
            <Form.Field name="collectionName" className={styles.formField}>
              <Form.Label className={styles.formLabel}>
                Collection Name
              </Form.Label>
              <Form.Control asChild>
                <input
                  type="text"
                  className={styles.input}
                  value={collection.name}
                  onChange={(e) =>
                    setCollection({ ...collection, name: e.target.value })
                  }
                  placeholder="Enter collection name"
                />
              </Form.Control>
            </Form.Field>

            <div className={styles.sectionsContainer}>
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Available Rounds</h2>
                <input
                  type="text"
                  className={styles.filterInput}
                  placeholder="Filter rounds..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
                <div className={styles.availableRounds}>
                  {filteredRounds.map((round) => {
                    const isAdded = collection.rounds.some(
                      (r) => r.roundId === round.id
                    );
                    return (
                      <div
                        key={round.id}
                        className={`${styles.roundCard} ${
                          isAdded ? styles.roundCardAdded : ""
                        }`}
                      >
                        <div className={styles.roundInfo}>
                          <span className={styles.roundName}>{round.name}</span>
                          <span className={styles.roundSlotCount}>
                            {round.slots.length} slots
                          </span>
                        </div>
                        <button
                          type="button"
                          className={styles.addRoundButton}
                          onClick={() => addRound(round.id)}
                          disabled={isAdded}
                        >
                          {isAdded ? "ADDED" : "+ ADD"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  Selected Rounds (Drag to Reorder)
                </h2>
                <div className={styles.selectedRounds}>
                  {collection.rounds.length === 0 ? (
                    <p className={styles.emptyMessage}>
                      No rounds selected. Add rounds from the left.
                    </p>
                  ) : (
                    collection.rounds.map((collectionRound, index) => {
                      const round = getRoundById(collectionRound.roundId);
                      if (!round) return null;

                      return (
                        <div
                          key={collectionRound.roundId}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={(e) => handleDragOver(e, index)}
                          onDragEnd={handleDragEnd}
                          onDrop={handleDrop}
                          className={`${styles.selectedRoundCard} ${
                            draggedIndex === index ? styles.dragging : ""
                          }`}
                        >
                          <div className={styles.dragHandle}>☰</div>
                          <div className={styles.orderBadge}>
                            {collectionRound.order}
                          </div>
                          <div className={styles.roundInfo}>
                            <span className={styles.roundName}>
                              {round.name}
                            </span>
                            <span className={styles.roundSlotCount}>
                              {round.slots.length} slots
                            </span>
                          </div>
                          <button
                            type="button"
                            className={styles.removeButton}
                            onClick={() => removeRound(collectionRound.roundId)}
                          >
                            REMOVE
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={handleCancel}
              >
                CANCEL
              </button>
              <button
                type="button"
                className={styles.saveButton}
                onClick={handleSave}
              >
                SAVE COLLECTION
              </button>
            </div>
          </Form.Root>
        </div>
      </main>
    </div>
  );
}
