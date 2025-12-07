import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const API_BASE_URL = 'http://localhost:3000';

interface ServerMessage {
  id: number;
  message: string;
  nickname: string;
  createdAt: string;
}

interface UiMessage {
  text: string;
  nickname: string;
  date: string;
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

  messages: UiMessage[] = [];
  messageText: string = '';

  // Handle für das regelmäßige Polling
  private pollHandle: ReturnType<typeof setInterval> | null = null;

  // --------------------------------------------------
  // Lifecycle: Beim Start und beim Beenden
  // --------------------------------------------------
  async ngOnInit(): Promise<void> {
    // einmal initial laden
    await this.loadHistoryFromServer(false);
    // danach in Intervallen nachladen
    this.startPolling();
  }

  ngOnDestroy(): void {
    if (this.pollHandle) {
      clearInterval(this.pollHandle);
      this.pollHandle = null;
    }
  }

  // --------------------------------------------------
  // History vom Server laden (optional aus Polling)
  // --------------------------------------------------
  private async loadHistoryFromServer(fromPolling: boolean = false): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/history`);
      if (!response.ok) {
        console.error('Fehler beim Laden der History', response.statusText);
        return;
      }

      const data = (await response.json()) as ServerMessage[];

      this.messages = data.map((m) => ({
        text: m.message,
        nickname: m.nickname,
        date: new Date(m.createdAt).toLocaleString('de'),
      }));

      // Nur beim initialen Laden oder nach eigenem Senden auto-scrollen
      if (!fromPolling) {
        setTimeout(() => this.scrollToBottom(), 0);
      }
    } catch (err) {
      console.error('Server nicht erreichbar (GET /history)', err);
    }
  }

  // --------------------------------------------------
  // Nachricht senden → POST /history
  // --------------------------------------------------
  async sendMessage(): Promise<void> {
    if (!this.nickname) {
      alert('Please add a nickname!');
      return;
    }

    const text = this.messageText.trim();
    if (!text) {
      alert('Please add a Message!');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          nickname: this.nickname,
        }),
      });

      if (!response.ok) {
        const msg = await response.text();
        alert('Fehler beim Senden: ' + msg);
        return;
      }

      const saved = (await response.json()) as ServerMessage;

      // Im UI anzeigen (direkt)
      this.messages.push({
        text: saved.message,
        nickname: saved.nickname,
        date: new Date(saved.createdAt).toLocaleString('de'),
      });

      this.messageText = '';
      setTimeout(() => this.scrollToBottom(), 0);
    } catch (err) {
      console.error('Server nicht erreichbar (POST /history)', err);
      alert('Server nicht erreichbar. Läuft der Chat-API-Server auf Port 3000?');
    }
  }

  // --------------------------------------------------
  // Polling: alle 2 Sekunden neue History holen
  // --------------------------------------------------
  private startPolling(): void {
    if (this.pollHandle) return; // nicht doppelt starten

    this.pollHandle = setInterval(() => {
      this.loadHistoryFromServer(true); // true = kommt aus Polling
    }, 2000); // 2000 ms = 2 Sekunden
  }

  // --------------------------------------------------
  // Chat nach unten scrollen
  // --------------------------------------------------
  private scrollToBottom(): void {
    const container = document.querySelector('.message-space') as HTMLElement | null;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
