"use server";

type JoinPayload = {
  lobbyId: string;
  playerId: string;
};

type LobbyJoinSuccess = {
  player_id: string;
  token: string;
  game_ws_url: string;
  chat_ws_url: string;
};

type LobbyJoinError = {
  isError: true;
  error: string;
};

type LobbyJoinResponse = LobbyJoinSuccess | LobbyJoinError;

const resolveLobbyManagerUrl = () => {
  const baseUrl =
    process.env.BACKEND_URL || process.env.NEXT_PUBLIC_LOBBY_MANAGER_URL;
  if (!baseUrl) {
    throw new Error("Lobby Manager URL is not configured.");
  }
  return baseUrl;
};

export const joinGameroom = async ({
  lobbyId,
  playerId,
}: JoinPayload): Promise<LobbyJoinResponse> => {
  const lobbyManagerUrl = resolveLobbyManagerUrl();
  try {
    const response = await fetch(`${lobbyManagerUrl}/lobbies/${lobbyId}/join`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ player_id: playerId }),
    });

    if (!response.ok) {
      let errorMessage = "Unable to join lobby.";
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch (error) {
        console.error("Failed to parse join error:", error);
      }
      return {
        isError: true,
        error: errorMessage,
      };
    }

    const data = (await response.json()) as LobbyJoinSuccess;
    return data;
  } catch (error) {
    console.error("Failed to reach Lobby Manager:", error);
    return {
      isError: true,
      error: "Lobby Manager is unavailable. Please try again shortly.",
    };
  }
};
