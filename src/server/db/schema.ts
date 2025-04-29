import { DataTypes } from 'sequelize';
import sequelize from './config';
import { CardAction, CardColor, CardType, FriendshipStatus, GameCardLocation, GameMoveType, GameStatus } from '../enum/enums';

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});


const Game = sequelize.define('Game', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    host_id: { // user_id
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: { // waiting, playing, finished
        type: DataTypes.ENUM(
            GameStatus.WAITING, 
            GameStatus.PLAYING, 
            GameStatus.FINISHED
        ),
        allowNull: false,
    },
    current_turn: { // 1, 2, 3, 4
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
}); 

Game.hasOne(User, { foreignKey: 'host_id' });

const GamePlayer = sequelize.define('GamePlayer', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },  
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    seat_number: { // 1, 2, 3, 4
        type: DataTypes.INTEGER,
        allowNull: false,           
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

GamePlayer.hasOne(User, { foreignKey: 'user_id' });
GamePlayer.hasOne(Game, { foreignKey: 'game_id' });


const Chatlog = sequelize.define('Chatlog', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    message: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

Chatlog.hasOne(User, { foreignKey: 'user_id' });
Chatlog.hasOne(Game, { foreignKey: 'game_id' });

const Friendship = sequelize.define('Friendship', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    friend_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    status: { // pending, accepted, rejected
        type: DataTypes.ENUM(
            FriendshipStatus.PENDING, 
            FriendshipStatus.ACCEPTED, 
            FriendshipStatus.REJECTED
        ),
        allowNull: false,   
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },  
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

Friendship.hasOne(User, { foreignKey: 'user_id' });
Friendship.hasOne(User, { foreignKey: 'friend_id' });

const CardDefinition = sequelize.define('CardDefinition', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM(
            CardType.NORMAL,
            CardType.ACTION,
            CardType.WILD,
        ),
        allowNull: false,
    },
    action: {
        type: DataTypes.ENUM(
            CardAction.DRAW_TWO,
            CardAction.DRAW_FOUR,
            CardAction.SKIP,
            CardAction.REVERSE,
        ),
        allowNull: true,
    },
    color: {
        type: DataTypes.ENUM(
            CardColor.RED,
            CardColor.GREEN,
            CardColor.BLUE,
            CardColor.YELLOW,
            CardColor.NONE,
        ),
        allowNull: false,
    },
    value: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});          

const GameCard = sequelize.define('GameCard', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },  
    card_definition_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    location: {
        type: DataTypes.ENUM(
            GameCardLocation.HAND,
            GameCardLocation.BOARD,
            GameCardLocation.DISCARD_PILE,
        ),
        allowNull: false,
    },
    owner_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },  
});

GameCard.hasOne(Game, { foreignKey: 'game_id' });
GameCard.hasOne(User, { foreignKey: 'owner_id' });
GameCard.hasOne(CardDefinition, { foreignKey: 'card_definition_id' });

const GameMove = sequelize.define('GameMove', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    game_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },  
    player_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    card_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    move_type: {
        type: DataTypes.ENUM(
            GameMoveType.PLAY,
            GameMoveType.DRAW,
            GameMoveType.SKIP,
            GameMoveType.REVERSE,
            GameMoveType.DRAW_FOUR,
        ),
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
    updated_at: {   
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
});

GameMove.hasOne(Game, { foreignKey: 'game_id' });
GameMove.hasOne(User, { foreignKey: 'player_id' });
GameMove.hasOne(GameCard, { foreignKey: 'card_id' });

export { User, Game, GamePlayer, Chatlog, Friendship, CardDefinition, GameCard, GameMove };
