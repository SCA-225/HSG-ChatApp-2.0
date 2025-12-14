import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const API_BASE_URL = 'http://localhost:3000';

interface ServerMessage {
  id: number;
  message: string;
  nickname: string;
  avatar: string;     // << NEU
  createdAt: string;
}

interface UiMessage {
  text: string;
  nickname: string;
  date: string;
  avatar: string;
}

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.html',
  styleUrls: ['./chat-window.css'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class ChatWindow implements OnInit, OnDestroy {
  @Input() nickname!: string;
  @Input() avatar!: string;

  messages: UiMessage[] = [];
  messageText: string = '';

  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private lastMessageId = 0;

  // Farbpalette für fremde Nachrichten
  private otherColors: string[] = ['#D7F3DC', '#B7E4C7', '#95D5B2', '#74C79D', '#51B788'];
  private nicknameColors = new Map<string, string>();

  // --------------------------------------------------
  // Lifecycle
  // --------------------------------------------------
  async ngOnInit(): Promise<void> {
    await this.loadInitialHistory();
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  // --------------------------------------------------
  // Initiale History
  // --------------------------------------------------
  private async loadInitialHistory(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/history`);
      if (!response.ok) return;

      const data = (await response.json()) as ServerMessage[];

      this.messages = data.map((m) => ({
        text: m.message,
        nickname: m.nickname,
        date: new Date(m.createdAt).toLocaleString('de'),
        avatar: m.avatar ?? 'avatar1.png', // << kommt jetzt vom Server
      }));

      if (data.length > 0) {
        this.lastMessageId = data[data.length - 1].id;
      }

      setTimeout(() => this.scrollToBottom(), 0);
    } catch (err) {
      console.error('Fehler beim Initial-Laden', err);
    }
  }

  // --------------------------------------------------
  // Polling: nur neue Nachrichten
  // --------------------------------------------------
  private async pollNewMessages(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/history`);
      if (!response.ok) return;

      const data = (await response.json()) as ServerMessage[];
      const newMessages = data.filter((m) => m.id > this.lastMessageId);
      if (newMessages.length === 0) return;

      newMessages.forEach((m) => {
        this.messages.push({
          text: m.message,
          nickname: m.nickname,
          date: new Date(m.createdAt).toLocaleString('de'),
          avatar: m.avatar ?? 'avatar1.png', // << kommt jetzt vom Server
        });
        this.lastMessageId = m.id;
      });

      setTimeout(() => this.scrollToBottom(), 0);
    } catch (err) {
      console.error('Polling Fehler', err);
    }
  }

  private startPolling(): void {
    if (this.pollHandle) return;
    this.pollHandle = setInterval(() => {
      this.pollNewMessages();
    }, 2000);
  }

  // --------------------------------------------------
  // Nachricht senden
  // --------------------------------------------------
  async sendMessage(): Promise<void> {
    if (!this.nickname) {
      alert('Please add a nickname!');
      return;
    }

    const text = this.messageText.trim();
    if (!text) return;

    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          nickname: this.nickname,
        }),
      });

      if (!response.ok) return;

      const saved = (await response.json()) as ServerMessage;

      // wichtig: Avatar NICHT lokal raten, sondern aus Server-Antwort nehmen
      this.messages.push({
        text: saved.message,
        nickname: saved.nickname,
        date: new Date(saved.createdAt).toLocaleString('de'),
        avatar: saved.avatar ?? this.avatar ?? 'avatar1.png',
      });

      this.lastMessageId = saved.id;
      this.messageText = '';
      setTimeout(() => this.scrollToBottom(), 0);
    } catch (err) {
      console.error('Sendefehler', err);
    }
  }

  // --------------------------------------------------
  // Scroll
  // --------------------------------------------------
  private scrollToBottom(): void {
    const container = document.querySelector('.message-space') as HTMLElement | null;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  // --------------------------------------------------
  // Farben (wie vorher)
  // --------------------------------------------------
  getBubbleColor(msg: UiMessage): string {
    if (msg.nickname === this.nickname) {
      return '#2E6A50';
    }

    let color = this.nicknameColors.get(msg.nickname);
    if (!color) {
      const index = this.nicknameColors.size % this.otherColors.length;
      color = this.otherColors[index];
      this.nicknameColors.set(msg.nickname, color);
    }
    return color;
  }
}
