import { DataTypes } from "sequelize";
import sequelize from "./config";
import {
  CardAction,
  CardColor,
  CardType,
  FriendshipStatus,
  GameCardLocation,
  GameMoveType,
  GameStatus,
} from "../enum/enums";

const User = sequelize.define("User", {
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

const Game = sequelize.define("Game", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  host_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  member_2_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  member_3_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  member_4_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM(
      GameStatus.WAITING,
      GameStatus.PLAYING,
      GameStatus.FINISHED,
    ),
    allowNull: false,
  },
  current_turn: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  turn_direction: {
    type: DataTypes.INTEGER, // 1 for clockwise, -1 for counter-clockwise
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
Game.belongsTo(User, { foreignKey: "host_id", as: "host" });
Game.belongsTo(User, { foreignKey: "member_2_id" });
Game.belongsTo(User, { foreignKey: "member_3_id" });
Game.belongsTo(User, { foreignKey: "member_4_id" });

const GamePlayer = sequelize.define("GamePlayer", {
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
  seat_number: {
    // 1, 2, 3, 4
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

GamePlayer.belongsTo(User, { foreignKey: "user_id" });
GamePlayer.belongsTo(Game, { foreignKey: "game_id" });
Game.hasMany(GamePlayer, { foreignKey: "game_id", as: "gamePlayers" });

const Chatlog = sequelize.define("Chatlog", {
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

Chatlog.belongsTo(User, { foreignKey: "user_id" });
Chatlog.belongsTo(Game, { foreignKey: "game_id" });

const Friendship = sequelize.define("Friendship", {
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
  status: {
    // pending, accepted, rejected
    type: DataTypes.ENUM(
      FriendshipStatus.PENDING,
      FriendshipStatus.ACCEPTED,
      FriendshipStatus.REJECTED,
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

Friendship.belongsTo(User, { foreignKey: "user_id", as: "user" });
Friendship.belongsTo(User, { foreignKey: "friend_id", as: "friend" });

const CardDefinition = sequelize.define("CardDefinition", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  type: {
    type: DataTypes.ENUM(CardType.NORMAL, CardType.ACTION, CardType.WILD),
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

const GameCard = sequelize.define("GameCard", {
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
      GameCardLocation.DECK,
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

GameCard.belongsTo(Game, { foreignKey: "game_id" });
GameCard.belongsTo(User, { foreignKey: "owner_id" });
GameCard.belongsTo(CardDefinition, { foreignKey: "card_definition_id" });

const GameMove = sequelize.define("GameMove", {
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
      GameMoveType.DRAW_TWO,
      GameMoveType.WILD,
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

GameMove.belongsTo(Game, { foreignKey: "game_id" });
GameMove.belongsTo(User, { foreignKey: "player_id" });
GameMove.belongsTo(GameCard, { foreignKey: "card_id" });

export {
  User,
  Game,
  GamePlayer,
  Chatlog,
  Friendship,
  CardDefinition,
  GameCard,
  GameMove,
};
