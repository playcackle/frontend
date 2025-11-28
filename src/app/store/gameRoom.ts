import { LobbyJoinSuccess } from "@/actions/joinGameroom";
import { atom } from "jotai";

export const gameRoomAtom = atom<LobbyJoinSuccess | null>(null);
