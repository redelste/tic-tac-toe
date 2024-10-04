export interface GameState {
    players: string[];
    board: (string | null)[];
    currentPlayer: string;
    winner: string | null;
    moves: { player: string; position: number }[];
    createdAt: Date;
  }
  
  export interface GameWithId extends GameState {
    id: string;
  }