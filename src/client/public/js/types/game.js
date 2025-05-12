export var GameStatus;
(function (GameStatus) {
  GameStatus["WAITING"] = "waiting";
  GameStatus["PLAYING"] = "playing";
  GameStatus["FINISHED"] = "finished";
})(GameStatus || (GameStatus = {}));
export var CardType;
(function (CardType) {
  CardType["NORMAL"] = "normal";
  CardType["ACTION"] = "action";
  CardType["WILD"] = "wild";
})(CardType || (CardType = {}));
export var CardAction;
(function (CardAction) {
  CardAction["DRAW_TWO"] = "draw_two";
  CardAction["DRAW_FOUR"] = "draw_four";
  CardAction["SKIP"] = "skip";
  CardAction["REVERSE"] = "reverse";
})(CardAction || (CardAction = {}));
export var CardColor;
(function (CardColor) {
  CardColor["RED"] = "red";
  CardColor["GREEN"] = "green";
  CardColor["BLUE"] = "blue";
  CardColor["YELLOW"] = "yellow";
  CardColor["NONE"] = "none";
})(CardColor || (CardColor = {}));
//# sourceMappingURL=game.js.map
