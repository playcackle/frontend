"use server";

export const joinLobby = async (playerId: string) => {
  const response = await fetch(`${process.env.BACKEND_JOIN_URL}/join`, {
    method: "POST",
    body: JSON.stringify({ player_id: "player123" }),
    // …
  });
  const lobby = await response.json();
  return lobby;
};
