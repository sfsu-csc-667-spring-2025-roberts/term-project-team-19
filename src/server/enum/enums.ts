

export enum GameStatus {
    WAITING = 'waiting',
    PLAYING = 'playing',
    FINISHED = 'finished',
}

export enum FriendshipStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
}

export enum GameCardLocation {
    HAND = 'hand',
    BOARD = 'board',
    DISCARD_PILE = 'discard_pile',
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

export enum GameMoveType {
    PLAY = 'play',
    DRAW = 'draw',
    SKIP = 'skip',
    REVERSE = 'reverse',
    DRAW_FOUR = 'draw_four',
}