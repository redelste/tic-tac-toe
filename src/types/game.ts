export interface PlayerInfo {
    id: string;
    name: string;
  }
  
  export interface Move {
    player: string;
    position: number;
    symbol: 'X' | 'O';
    moveNumber: number;
  }
  
  export interface GameState {
    players: PlayerInfo[];
    board: (string | null)[];
    currentPlayer: string | null;
    winner: string | null;
    moves: Move[];
    createdAt: Date;
    endedAt: string | Date | null;
    cancelled?: boolean;
  }
  
  export interface GameWithId extends GameState {
    id: string;
  }