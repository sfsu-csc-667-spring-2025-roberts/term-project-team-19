export enum GameStatus {
    WAITING = 'waiting',
    PLAYING = 'playing',
    FINISHED = 'finished',
}

export enum CardType {
    NORMAL = 'normal',
    ACTION = 'action',
    WILD = 'wild',
}

export enum CardAction {
    DRAW_TWO = 'draw_two',
    DRAW_FOUR = 'draw_four',
    SKIP = 'skip',
    REVERSE = 'reverse',
}

export enum CardColor {
    RED = 'red',
    GREEN = 'green',
    BLUE = 'blue',
    YELLOW = 'yellow',
    NONE = 'none',
}

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface Card {
    id: number;
    type: CardType;
    action?: CardAction;
    color: CardColor;
    value: number;
}

export interface GamePlayer {
    id: number;
    userId: number;
    username: string;
    seatNumber: number;
    cards: Card[];
}

export interface Game {
    id: number;
    hostId: number;
    status: GameStatus;
    currentTurn: number;
    players: GamePlayer[];
    topCard?: Card;
    direction: 'clockwise' | 'counterclockwise';
}

export interface ChatMessage {
    id: number;
    gameId: number;
    userId: number;
    username: string;
    message: string;
    createdAt: string;
}

export interface GameLobbyItem {
    id: number;
    hostId: number;
    hostUsername: string;
    status: GameStatus;
    playerCount: number;
    maxPlayers: number;
    createdAt: string;
}

export interface CreateGameOptions {
    maxPlayers: number;
} 