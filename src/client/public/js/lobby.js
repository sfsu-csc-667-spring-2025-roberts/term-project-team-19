import { Auth } from "../auth/auth";
import { GameManager } from "../game/game";
import { GameStatus } from "../types/game";

export class GameLobbyUI {
  constructor(containerId) {
    this.createDialog = null;
    this.gameManager = GameManager.getInstance();
    this.container =
      document.getElementById(containerId) || document.createElement("div");
    this.container.id = containerId;
    this.initialize();
  }
  initialize() {
    // Add game listener
    this.gameManager.addGameListener(this.renderGames.bind(this));
    // Initial fetch
    this.gameManager.fetchGames();
    // Set up periodic refresh
    setInterval(() => this.gameManager.fetchGames(), 5000);
  }
  handleAuthChange(user) {
    if (!user) {
      window.location.href = "/login.html";
    }
  }
  createHeader() {
    const header = document.createElement("header");
    header.className = "app-header";
    const headerContent = document.createElement("div");
    headerContent.className = "header-content";
    const title = document.createElement("h1");
    title.textContent = "UNO Game Lobby";
    const headerActions = document.createElement("div");
    headerActions.className = "header-actions";
    const welcomeText = document.createElement("span");
    welcomeText.className = "welcome-text";
    welcomeText.textContent = `Welcome, ${this.auth.getUser()?.username}!`;
    const refreshButton = document.createElement("button");
    refreshButton.className = "icon-button";
    refreshButton.textContent = "↻";
    refreshButton.onclick = () => this.gameManager.fetchGames();
    const logoutButton = document.createElement("button");
    logoutButton.className = "icon-button";
    logoutButton.textContent = "⇥";
    logoutButton.onclick = async () => {
      await this.auth.logout();
      window.location.href = "/login.html";
    };
    headerActions.append(welcomeText, refreshButton, logoutButton);
    headerContent.append(title, headerActions);
    header.appendChild(headerContent);
    return header;
  }
  createGameList() {
    const gamesList = document.createElement("div");
    gamesList.className = "games-list";
    const games = this.gameManager.getGames();
    if (games.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className = "list-item";
      emptyMessage.innerHTML = "<p>No games available. Create one!</p>";
      gamesList.appendChild(emptyMessage);
    } else {
      games.forEach((game) => {
        const gameItem = this.createGameItem(game);
        gamesList.appendChild(gameItem);
      });
    }
    return gamesList;
  }
  createGameItem(game) {
    const item = document.createElement("div");
    item.className = "list-item";
    const gameInfo = document.createElement("div");
    gameInfo.className = "game-info";
    const hostTitle = document.createElement("h3");
    hostTitle.textContent = `Host: ${game.hostUsername}`;
    const gameStatus = document.createElement("p");
    gameStatus.textContent = `Players: ${game.playerCount}/${game.maxPlayers} | Status: ${game.status}`;
    const joinButton = document.createElement("button");
    joinButton.className = "join-button";
    joinButton.textContent = "Join Game";
    joinButton.disabled =
      game.status !== GameStatus.WAITING || game.playerCount >= game.maxPlayers;
    joinButton.onclick = async () => {
      if (await this.gameManager.joinGame(game.id)) {
        window.location.href = `/game.html?id=${game.id}`;
      }
    };
    gameInfo.append(hostTitle, gameStatus);
    item.append(gameInfo, joinButton);
    return item;
  }
  createCreateGameDialog() {
    const dialog = document.createElement("div");
    dialog.className = "dialog-overlay";
    dialog.style.display = "none";
    const dialogContent = document.createElement("div");
    dialogContent.className = "dialog";
    const title = document.createElement("h2");
    title.textContent = "Create New Game";
    const content = document.createElement("div");
    content.className = "dialog-content";
    const formGroup = document.createElement("div");
    formGroup.className = "form-group";
    const label = document.createElement("label");
    label.htmlFor = "maxPlayers";
    label.textContent = "Max Players";
    const select = document.createElement("select");
    select.id = "maxPlayers";
    [2, 3, 4].forEach((num) => {
      const option = document.createElement("option");
      option.value = num.toString();
      option.textContent = `${num} Players`;
      select.appendChild(option);
    });
    const actions = document.createElement("div");
    actions.className = "dialog-actions";
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "Cancel";
    cancelButton.onclick = () => {
      dialog.style.display = "none";
    };
    const createButton = document.createElement("button");
    createButton.className = "primary-button";
    createButton.textContent = "Create";
    createButton.onclick = async () => {
      const gameId = await this.gameManager.createGame(Number(select.value));
      if (gameId) {
        dialog.style.display = "none";
        window.location.href = `/game.html?id=${gameId}`;
      }
    };
    actions.append(cancelButton, createButton);
    formGroup.append(label, select);
    content.appendChild(formGroup);
    dialogContent.append(title, content, actions);
    dialog.appendChild(dialogContent);
    return dialog;
  }
  renderGames() {
    this.container.innerHTML = "";
    const header = this.createHeader();
    const mainContent = document.createElement("main");
    mainContent.className = "main-content";
    const lobbyContainer = document.createElement("div");
    lobbyContainer.className = "lobby-container";
    const title = document.createElement("h2");
    title.className = "lobby-title";
    title.textContent = "Game Lobby";
    const createButton = document.createElement("button");
    createButton.className = "create-game-button";
    createButton.textContent = "Create New Game";
    createButton.onclick = () => {
      if (this.createDialog) {
        this.createDialog.style.display = "block";
      }
    };
    const gamesList = this.createGameList();
    lobbyContainer.append(title, createButton, gamesList);
    mainContent.appendChild(lobbyContainer);
    this.container.append(header, mainContent);
    if (!this.createDialog) {
      this.createDialog = this.createCreateGameDialog();
      this.container.appendChild(this.createDialog);
    }
  }
}
//# sourceMappingURL=gameLobby.js.map
